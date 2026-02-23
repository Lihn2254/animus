from flask import request, jsonify
from sqlalchemy import or_
from infrastructure.db import db
from models.analysis_result import AnalysisResult
from datetime import datetime


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
        data = request.get_json()
        if not data:
            return jsonify({"error": "Se requiere un cuerpo JSON"}), 400

        required_fields = ["geographical_region", "start_date", "end_date", "age_range", "topics"]
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return jsonify({"error": f"Faltan campos requeridos: {', '.join(missing)}"}), 400

        # Validate date formats
        for date_field in ("start_date", "end_date"):
            try:
                datetime.fromisoformat(data[date_field])
            except ValueError:
                return jsonify({"error": f"Formato de {date_field} inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400

        if not isinstance(data["topics"], list) or not data["topics"]:
            return jsonify({"error": "El campo topics debe ser una lista no vacía"}), 400

        return jsonify({"message": "Executed new analysis. "}), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
