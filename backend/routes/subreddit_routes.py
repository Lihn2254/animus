from flask import Blueprint
from controllers.subreddit_controller import register_subreddit, get_subreddits
from middlewares.jwt_required import jwt_required

subreddit_bp = Blueprint("subreddit", __name__)


@subreddit_bp.route("/subreddits", methods=["POST"])
@jwt_required
def register_subreddit_route():
    return register_subreddit()


@subreddit_bp.route("/subreddits", methods=["GET"])
@jwt_required
def get_subreddits_route():
    return get_subreddits()
