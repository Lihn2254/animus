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
      - topics (opt.)       : list of strings (e.g. ["IT", "Software"])
      - communities (opt.)  : list of strings (e.g. ["taquerosprogramadores", "programming"])
      - save                : bool
      - post_count          : int
      - include_comments    : bool
    """
    try:
        # Get authenticated user
        user_id = getattr(request, 'current_user_id', None)
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        data = request.get_json()
        if not data:
            return jsonify({"error": "Se requiere un cuerpo JSON"}), 400

        #Check if mandatory fields are present
        required_fields = ["geographical_region", "start_date", "end_date", "age_range", "save", "post_count", "include_comments"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({"error": f"Faltan campos requeridos: {', '.join(missing)}"}), 400

        # Validate date formats
        try:
            start_date = datetime.fromisoformat(data["start_date"])
            end_date = datetime.fromisoformat(data["end_date"])
        except ValueError:
            return jsonify({"error": "Formato de fechas inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400

        #Validate, parse and store topics in an array
        # if not isinstance(data["topics"], list) or not data["topics"]:
        #     return jsonify({"error": "El campo topics debe ser una lista no vacía"}), 400

        # topics = [t.strip() for t in data["topics"] if isinstance(t, str) and t.strip()]
        # if not topics:
        #     return jsonify({"error": "El campo topics debe contener al menos un string válido"}), 400

        if "topics" in data:
            topics = [t.strip() for t in data["topics"] if isinstance(t, str) and t.strip()]
        else:
            topics = []

        #Validate, parse and store communities in an array
        # if not isinstance(data["communities"], list) or not data["communities"]:
        #     return jsonify({"error": "El campo communities debe ser una lista no vacía"}), 400

        if "communities" in data:
            communities = [c.strip() for c in data["communities"] if isinstance(c, str) and c.strip()]
        else:
            communities = []

        if not communities and not topics:
            return jsonify({"error": "Por lo menos uno de los dos campos: topics y communities, debe contener datos válidos."}), 400

        #Parse parameters
        include_comments = _parse_bool(data.get("include_comments", True))
        save = _parse_bool(data.get("save", False))
        post_count = _parse_post_count(data.get("post_count", 15))

        scraper = ScrapingService()
        aggregated = []

        for topic in topics:
            #If specific communities are included in the request for scraping, then scrape that community (subreddit)
            if communities:
                for community in communities:
                    results, status = scraper.search(topic, user_id=user_id, subreddit_name=community, limit=post_count, include_comments=include_comments, save=save)
            else:
                results, status = scraper.search(topic, user_id=user_id, limit=post_count, include_comments=include_comments, save=save)

            if status != 200:
                return jsonify({"error": f"Error scraping topic '{topic}'"}), status
            aggregated.extend(results)

        filtered = _filter_items_by_date(aggregated, start_date, end_date)
        if not filtered:
            return jsonify({"error": "No se encontraron datos para el rango de fechas indicado."}), 404

        ai_service = AIAnalysisService()
        context = {
            "geographical_region": data["geographical_region"],
            "start_date": data["start_date"],
            "end_date": data["end_date"],
            "age_range": data["age_range"],
            "topics": topics,
        }

        analysis_payload, status = ai_service.analyze_sentiment(filtered, context)
        if status != 200:
            return jsonify(analysis_payload), status

        analysis_result_id = None
        if save:
            analysis = analysis_payload.get("analysis", {})

            # Create AnalysisResult
            result = AnalysisResult(
                user_id=user_id,
                geographical_region=data["geographical_region"],
                start_date=start_date.date(),
                end_date=end_date.date(),
                age_range=data["age_range"],
                topics=topics,
                communities=communities,
                post_count=len(filtered),
                sentiment=analysis.get("sentiment"),
                stress_level=analysis.get("stress_level"),
                anxiety_level=analysis.get("anxiety_level"),
                keywords=analysis.get("keywords"),
                summary=analysis.get("summary"),
                model_version=analysis.get("model_version"),
            )
            db.session.add(result)
            db.session.commit()
            db.session.refresh(result)
            analysis_result_id = result.id

        return jsonify({
            "message": "Análisis finalizado correctamente",
            "analysis": analysis_payload.get("analysis"),
            "saved": save,
            "id": analysis_result_id,
        }), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


def _parse_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"true", "1", "yes", "y"}
    return False


def _parse_post_count(value, default=15, minimum=1, maximum=50):
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
