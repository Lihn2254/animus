from flask import Blueprint
from controllers.scraping_controller import (
    scrape_subreddit,
    search_reddit,
    fetch_user,
    analyze_user,
)

scraping_bp = Blueprint("scraping", __name__)

scraping_bp.add_url_rule(
    "/scrape/subreddit/<string:name>",
    view_func=scrape_subreddit,
    methods=["POST"],
)
scraping_bp.add_url_rule(
    "/scrape/search",
    view_func=search_reddit,
    methods=["POST"],
)
scraping_bp.add_url_rule(
    "/scrape/user",
    view_func=fetch_user,
    methods=["POST"],
)
scraping_bp.add_url_rule(
    "/scrape/analyze/user",
    view_func=analyze_user,
    methods=["POST"],
)
