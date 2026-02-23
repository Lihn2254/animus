from flask import request, jsonify
from infrastructure.db import db
from models.subreddit import Subreddit
from datetime import datetime


def register_subreddit():
    """
    POST /api/subreddits
    Body (JSON):
      - name     : string (required, unique)
      - category : string (optional)
    """
    try:
        data = request.get_json()
        if not data or not data.get("name"):
            return jsonify({"error": "El campo 'name' es requerido"}), 400

        name = data["name"].strip()
        if not name:
            return jsonify({"error": "El nombre del subreddit no puede estar vacío"}), 400

        if Subreddit.query.filter_by(name=name).first():
            return jsonify({"error": "El subreddit ya existe"}), 409

        subreddit = Subreddit(
            name=name,
            category=data.get("category", "").strip() or None,
            is_active=data.get("is_active", True),
        )

        db.session.add(subreddit)
        db.session.commit()

        return jsonify({"message": "Subreddit registrado correctamente", "subreddit": subreddit.to_dict()}), 201

    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 500


def get_subreddits():
    """
    GET /api/subreddits
    Query params:
      - category       : exact match
      - is_active      : true | false
      - scraped_before : ISO date string – last_scraped <= value
      - scraped_after  : ISO date string – last_scraped >= value
    """
    try:
        query = Subreddit.query

        category = request.args.get("category", "").strip()
        if category:
            query = query.filter(Subreddit.category == category)

        is_active_param = request.args.get("is_active", "").strip().lower()
        if is_active_param in ("true", "false"):
            query = query.filter(Subreddit.is_active == (is_active_param == "true"))

        scraped_after = request.args.get("scraped_after", "").strip()
        if scraped_after:
            try:
                dt = datetime.fromisoformat(scraped_after)
                query = query.filter(Subreddit.last_scraped >= dt)
            except ValueError:
                return jsonify({"error": "Formato de scraped_after inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400

        scraped_before = request.args.get("scraped_before", "").strip()
        if scraped_before:
            try:
                dt = datetime.fromisoformat(scraped_before)
                query = query.filter(Subreddit.last_scraped <= dt)
            except ValueError:
                return jsonify({"error": "Formato de scraped_before inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400

        subreddits = query.all()

        return jsonify({
            "count": len(subreddits),
            "subreddits": [s.to_dict() for s in subreddits],
        }), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
