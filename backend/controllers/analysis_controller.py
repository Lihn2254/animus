from datetime import datetime

from flask import request, jsonify

from infrastructure.db import db
from models.analysis_result import AnalysisResult
from services.ai_analysis_service import AIAnalysisService
from services.scraping_service import ScrapingService


def get_analysis_results():
    """
    GET /api/analysis
    Query params:
      - keywords   : comma-separated list (matches if any keyword appears in the stored keywords JSON)
      - sentiment  : exact match (e.g. positive, negative, neutral)
      - date_from  : ISO date string (inclusive) – filters by analysis_date
      - date_to    : ISO date string (inclusive) – filters by analysis_date
    """
    try:
        query = AnalysisResult.query

        # --- filter by sentiment ---
        sentiment = request.args.get("sentiment", "").strip()
        if sentiment:
            query = query.filter(AnalysisResult.sentiment == sentiment)

        # --- filter by analysis date range ---
        date_from = request.args.get("date_from", "").strip()
        if date_from:
            try:
                dt_from = datetime.fromisoformat(date_from)
                query = query.filter(AnalysisResult.analysis_date >= dt_from)
            except ValueError:
                return jsonify({"error": "Formato de date_from inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400

        date_to = request.args.get("date_to", "").strip()
        if date_to:
            try:
                dt_to = datetime.fromisoformat(date_to)
                query = query.filter(AnalysisResult.analysis_date <= dt_to)
            except ValueError:
                return jsonify({"error": "Formato de date_to inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400

        results = query.all()

        # --- filter by keywords (post-query, JSON array comparison) ---
        keywords_param = request.args.get("keywords", "").strip()
        if keywords_param:
            search_keywords = [k.strip().lower() for k in keywords_param.split(",") if k.strip()]
            if search_keywords:
                results = [
                    r for r in results
                    if r.keywords and any(
                        kw in [k.lower() for k in r.keywords]
                        for kw in search_keywords
                    )
                ]

        return jsonify({
            "count": len(results),
            "results": [r.to_dict() for r in results],
        }), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


def run_analysis():
    """
    POST /api/analysis/run
    Body (JSON):
      - geographical_region : string
      - start_date          : ISO date string
      - end_date            : ISO date string
      - age_range           : string  (e.g. "18-35")
      - topics              : list of strings (e.g. ["IT", "Software"])
    """
    try:
        # Get authenticated user
        user_id = getattr(request, 'current_user_id', None)
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        data = request.get_json()
        if not data:
            return jsonify({"error": "Se requiere un cuerpo JSON"}), 400

        required_fields = ["geographical_region", "start_date", "end_date", "age_range", "topics"]
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return jsonify({"error": f"Faltan campos requeridos: {', '.join(missing)}"}), 400

        # Validate date formats
        try:
            start_date = datetime.fromisoformat(data["start_date"])
            end_date = datetime.fromisoformat(data["end_date"])
        except ValueError:
            return jsonify({"error": "Formato de fechas inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400

        if not isinstance(data["topics"], list) or not data["topics"]:
            return jsonify({"error": "El campo topics debe ser una lista no vacía"}), 400

        topics = [t.strip() for t in data["topics"] if isinstance(t, str) and t.strip()]
        if not topics:
            return jsonify({"error": "El campo topics debe contener al menos un string válido"}), 400

        save = _parse_bool(data.get("save", False))
        limit = _parse_limit(data.get("limit", 15))

        scraper = ScrapingService()
        aggregated = []
        for topic in topics:
            results, status = scraper.search(topic, user_id=user_id, limit=limit, include_comments=True, save=False)
            if status != 200:
                return jsonify({"error": f"Error scraping topic '{topic}'"}), status
            aggregated.extend(results)

        filtered = _filter_items_by_date(aggregated, start_date, end_date)
        if not filtered:
            return jsonify({"error": "No se encontraron datos para el rango de fechas indicado."}), 404

        ai_service = AIAnalysisService()
        context = {
            "geographical_region": data["geographical_region"],
            "age_range": data["age_range"],
            "topics": topics,
            "start_date": data["start_date"],
            "end_date": data["end_date"],
        }

        analysis_payload, status = ai_service.analyze_sentiment(filtered, context)
        if status != 200:
            return jsonify(analysis_payload), status

        analysis_result_id = None
        if save:
            analysis = analysis_payload.get("analysis", {})

            # Create AnalysisResult first
            result = AnalysisResult(
                user_id=user_id,
                sentiment=analysis.get("sentiment"),
                stress_level=analysis.get("stress_level"),
                anxiety_level=analysis.get("anxiety_level"),
                keywords=analysis.get("keywords"),
                communities=topics,
                summary=analysis.get("summary"),
                post_count=len(filtered),
                model_version=analysis.get("model_version"),
            )
            db.session.add(result)
            db.session.flush()  # Get the ID

            # Now save raw data linked to this analysis
            for item in filtered:
                content_type = item.get("type", "post")
                scraper._upsert_raw_data(
                    item,
                    user_id=user_id,
                    content_type=content_type,
                    analysis_result_id=result.id
                )

            db.session.commit()
            analysis_result_id = result.id

        return jsonify({
            "analysis": analysis_payload.get("analysis"),
            "source_count": analysis_payload.get("source_count", 0),
            "saved": save,
            "analysis_result_id": analysis_result_id,
        }), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


def _parse_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"true", "1", "yes", "y"}
    return False


def _parse_limit(value, default=15, minimum=1, maximum=50):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default

    return max(minimum, min(parsed, maximum))


def _filter_items_by_date(items, start_date, end_date):
    filtered = []
    for item in items:
        created_utc = item.get("created_utc")
        created_dt = _to_datetime(created_utc)
        if created_dt is None:
            continue
        if created_dt < start_date or created_dt > end_date:
            continue
        filtered.append(item)

    return _dedupe_items(filtered)


def _to_datetime(value):
    if isinstance(value, datetime):
        return value
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value)
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value)
        except ValueError:
            return None
    return None


def _dedupe_items(items):
    seen = set()
    deduped = []
    for item in items:
        key = item.get("external_id") or item.get("id") or item.get("permalink") or item.get("link")
        if not key:
            continue
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped
