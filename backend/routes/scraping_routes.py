from flask import Blueprint
from controllers.scraping_controller import (
    scrape_subreddit,
    search_reddit,
    fetch_user,
    analyze_user,
)
from middlewares.jwt_required import jwt_required

scraping_bp = Blueprint("scraping", __name__)

scraping_bp.add_url_rule(
    "/scrape/subreddit/<string:name>",
    view_func=jwt_required(scrape_subreddit),
    methods=["POST"],
)
scraping_bp.add_url_rule(
    "/scrape/search",
    view_func=jwt_required(search_reddit),
    methods=["POST"],
)
scraping_bp.add_url_rule(
    "/scrape/user",
    view_func=jwt_required(fetch_user),
    methods=["POST"],
)
scraping_bp.add_url_rule(
    "/scrape/analyze/user",
    view_func=jwt_required(analyze_user),
    methods=["POST"],
)
