from flask import request, jsonify

from services.scraping_service import ScrapingService
from services.ai_analysis_service import AIAnalysisService

_scraper = ScrapingService()
_ai_service = AIAnalysisService()


def scrape_subreddit(name):
    body = request.get_json(silent=True) or {}

    limit = body.get("limit", 25)
    category = body.get("category", "hot")
    include_comments = bool(body.get("include_comments", False))
    save = bool(body.get("save", True))

    if category not in ("hot", "top", "new"):
        return jsonify({"error": "category must be 'hot', 'top', or 'new'"}), 400

    try:
        limit = int(limit)
    except (TypeError, ValueError):
        return jsonify({"error": "limit must be an integer"}), 400

    data, status = _scraper.fetch_subreddit_posts(
        name,
        limit=limit,
        category=category,
        include_comments=include_comments,
        save=save,
    )

    if isinstance(data, dict) and "error" in data:
        return jsonify(data), status

    return jsonify({"count": len(data), "results": data}), status


def search_reddit():
    body = request.get_json(silent=True) or {}

    query = body.get("query", "").strip()
    if not query:
        return jsonify({"error": "query is required"}), 400

    subreddit = body.get("subreddit") or None
    include_comments = bool(body.get("include_comments", False))
    save = bool(body.get("save", False))

    try:
        limit = int(body.get("limit", 10))
    except (TypeError, ValueError):
        return jsonify({"error": "limit must be an integer"}), 400

    data, status = _scraper.search(
        query,
        subreddit_name=subreddit,
        limit=limit,
        include_comments=include_comments,
        save=save,
    )

    return jsonify({"count": len(data), "results": data}), status


def fetch_user():
    body = request.get_json(silent=True) or {}

    username = body.get("username", "").strip()
    if not username:
        return jsonify({"error": "username is required"}), 400

    save = bool(body.get("save", False))

    try:
        limit = int(body.get("limit", 30))
    except (TypeError, ValueError):
        return jsonify({"error": "limit must be an integer"}), 400

    data, status = _scraper.fetch_user_data(username, limit=limit, save=save)
    return jsonify({"username": username, "count": len(data), "results": data}), status


def analyze_user():
    body = request.get_json(silent=True) or {}

    username = body.get("username", "").strip()
    if not username:
        return jsonify({"error": "username is required"}), 400

    try:
        limit = int(body.get("limit", 30))
    except (TypeError, ValueError):
        return jsonify({"error": "limit must be an integer"}), 400

    data, status = _ai_service.analyze_user(username, limit=limit)
    return jsonify(data), status
