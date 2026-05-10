from datetime import datetime, timedelta

from flask import request, jsonify

from infrastructure.db import db
from models.analysis_result import AnalysisResult
from models.analysis_schedule import AnalysisSchedule
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
        # Get authenticated user
        user_id = getattr(request, 'current_user_id', None)
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        # Always filter by authenticated user's ID for security
        query = AnalysisResult.query.filter(AnalysisResult.user_id == user_id)

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
      - model               : string
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
        required_fields = ["geographical_region", "start_date", "end_date", "age_range", "model", "save", "post_count", "include_comments"]
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
        if "topics" in data:
            topics = [t.strip() for t in data["topics"] if isinstance(t, str) and t.strip()]
        else:
            topics = []

        #Validate, parse and store communities in an array
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
        aggregated, error_message, status = _collect_scraped_items(
            scraper=scraper,
            topics=topics,
            communities=communities,
            user_id=user_id,
            post_count=post_count,
            include_comments=include_comments,
            save=save,
        )
        if error_message:
            return jsonify({"error": error_message}), status

        filtered_items = _filter_items_by_date(aggregated, start_date, end_date)
        if not filtered_items:
            return jsonify({"error": "No se encontraron datos para el rango de fechas indicado."}), 404

        ai_service = AIAnalysisService()
        context = {
            "geographical_region": data["geographical_region"],
            "start_date": data["start_date"],
            "end_date": data["end_date"],
            "age_range": data["age_range"],
            "topics": topics,
        }

        analysis_payload, status = ai_service.analyze_sentiment(filtered_items, context, data["model"])
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
                post_count=len(filtered_items),
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

def _collect_scraped_items(scraper, topics, communities, user_id, post_count, include_comments, save):
    aggregated = []
    
    # When topics are not indicated it defaults to mental health related topics
    search_queries = topics if topics else ["Ansiedad", "Salud mental", "Universidad"]
    search_communities = communities if communities else [None]
    base_search_kwargs = {
        "user_id": user_id,
        "limit": post_count,
        "include_comments": include_comments,
        "save": save,
    }

    for query in search_queries:
        for community in search_communities:
            search_kwargs = {**base_search_kwargs, "query": query}
            if community is not None:
                search_kwargs["subreddit_name"] = community

            results, status = scraper.search(**search_kwargs)
            if status != 200:
                if query and community:
                    error_message = f"Error scraping topic '{query}' in community '{community}'"
                elif query:
                    error_message = f"Error scraping topic '{query}'"
                elif community:
                    error_message = f"Error scraping community '{community}'"
                else:
                    error_message = "Error scraping data"
                return None, error_message, status

            aggregated.extend(results)

    return aggregated, None, 200

def get_analysis_by_id(analysis_id):
    """
    GET /api/analysis/<analysis_id>
    """
    try:
        # Get authenticated user
        user_id = getattr(request, 'current_user_id', None)
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        result = AnalysisResult.query.filter_by(id=analysis_id, user_id=user_id).first()
        if not result:
            return jsonify({"error": "Analysis not found"}), 404

        return jsonify(result.to_dict()), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


def create_analysis_schedule():
    """
    POST /api/analysis/schedules
    Body (JSON):
      - frequency          : string (semanal, bisemanal, mensual, trimestral, semestral)
      - scheduled_day      : string (día de la semana o día del mes según frecuencia)
      - scheduled_time     : string (HH:MM)
      - geographical_region: string
      - age_range          : string
      - topics             : list of strings
      - communities        : list of strings
      - post_count         : int
      - include_comments   : bool
      - model              : string (opcional)
    """
    try:
        user_id = getattr(request, 'current_user_id', None)
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        data = request.get_json()
        if not data:
            return jsonify({"error": "Se requiere un cuerpo JSON"}), 400

        required_fields = [
            "frequency",
            "scheduled_day",
            "scheduled_time",
            "geographical_region",
            "age_range",
            "post_count",
            "include_comments",
        ]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({"error": f"Faltan campos requeridos: {', '.join(missing)}"}), 400

        frequency = data["frequency"].strip().lower()
        valid_frequencies = {"semanal", "bisemanal", "mensual", "trimestral", "semestral"}
        if frequency not in valid_frequencies:
            return jsonify({"error": "Frecuencia inválida. Usa semanal, bisemanal, mensual, trimestral o semestral."}), 400

        scheduled_day = str(data["scheduled_day"]).strip()
        scheduled_time = str(data["scheduled_time"]).strip()
        if not _parse_schedule_time(scheduled_time):
            return jsonify({"error": "scheduled_time inválido. Usa formato HH:MM."}), 400

        topics = [t.strip() for t in data.get("topics", []) if isinstance(t, str) and t.strip()]
        communities = [c.strip() for c in data.get("communities", []) if isinstance(c, str) and c.strip()]
        if not topics and not communities:
            return jsonify({"error": "Por lo menos uno de los campos topics o communities debe contener datos válidos."}), 400

        post_count = _parse_post_count(data.get("post_count", 15))
        include_comments = _parse_bool(data.get("include_comments", False))
        model = str(data.get("model", "gemini-3-flash-preview")).strip() or "gemini-3-flash-preview"

        next_run_date = _compute_next_run_date(frequency, scheduled_day, scheduled_time)

        schedule = AnalysisSchedule(
            user_id=user_id,
            frequency=frequency,
            scheduled_day=scheduled_day,
            scheduled_time=scheduled_time,
            next_run_date=next_run_date,
            geographical_region=str(data["geographical_region"]).strip(),
            age_range=str(data["age_range"]).strip(),
            topics=topics,
            communities=communities,
            post_count=post_count,
            include_comments=include_comments,
            model=model,
        )
        db.session.add(schedule)
        db.session.commit()
        db.session.refresh(schedule)

        return jsonify({
            "message": "Programación de análisis creada correctamente.",
            "schedule": schedule.to_dict(),
        }), 201

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


def get_analysis_schedules():
    """
    GET /api/analysis/schedules
    """
    try:
        user_id = getattr(request, 'current_user_id', None)
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        schedules = AnalysisSchedule.query.filter_by(user_id=user_id).order_by(AnalysisSchedule.created_at.desc()).all()
        return jsonify({
            "count": len(schedules),
            "results": [s.to_dict() for s in schedules],
        }), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


def get_analysis_by_id(analysis_id):
    """
    GET /api/analysis/<analysis_id>
    """
    try:
        # Get authenticated user
        user_id = getattr(request, 'current_user_id', None)
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        result = AnalysisResult.query.filter_by(id=analysis_id, user_id=user_id).first()
        if not result:
            return jsonify({"error": "Analysis not found"}), 404

        return jsonify(result.to_dict()), 200

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


def _parse_schedule_time(time_str):
    if not isinstance(time_str, str):
        return None

    parts = time_str.split(":")
    if len(parts) != 2:
        return None

    try:
        hour = int(parts[0])
        minute = int(parts[1])
    except ValueError:
        return None

    if hour < 0 or hour > 23 or minute < 0 or minute > 59:
        return None

    return hour, minute


def _compute_next_run_date(frequency, scheduled_day, scheduled_time):
    now = datetime.utcnow()
    parsed_time = _parse_schedule_time(scheduled_time)
    if not parsed_time:
        return now

    hour, minute = parsed_time
    if frequency in {"semanal", "bisemanal"}:
        weekday_map = {
            "lunes": 0,
            "martes": 1,
            "miércoles": 2,
            "miercoles": 2,
            "jueves": 3,
            "viernes": 4,
            "sábado": 5,
            "sabado": 5,
            "domingo": 6,
        }
        weekday = weekday_map.get(scheduled_day.strip().lower())
        if weekday is None:
            return now

        candidate = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        days_ahead = (weekday - candidate.weekday()) % 7
        candidate = candidate + timedelta(days=days_ahead)
        if candidate <= now:
            candidate = candidate + timedelta(days=7 if frequency == "semanal" else 14)
        return candidate

    if frequency in {"mensual", "trimestral", "semestral"}:
        try:
            day = int(scheduled_day)
        except ValueError:
            day = 1
        day = max(1, min(day, 28))
        month_step = 1 if frequency == "mensual" else 3 if frequency == "trimestral" else 6
        return _get_next_monthly_run(now, day, hour, minute, month_step)

    return now


def _get_next_monthly_run(now, day, hour, minute, month_step):
    year, month = now.year, now.month
    current_candidate = datetime(year, month, min(day, _days_in_month(year, month)), hour, minute)
    if current_candidate <= now:
        month += month_step
        year += (month - 1) // 12
        month = ((month - 1) % 12) + 1
        current_candidate = datetime(year, month, min(day, _days_in_month(year, month)), hour, minute)
    return current_candidate


def _days_in_month(year, month):
    if month == 12:
        next_month = datetime(year + 1, 1, 1)
    else:
        next_month = datetime(year, month + 1, 1)
    return (next_month - timedelta(days=1)).day


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
