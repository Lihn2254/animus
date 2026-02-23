from flask import Blueprint
from controllers.subreddit_controller import register_subreddit, get_subreddits

subreddit_bp = Blueprint("subreddit", __name__)


@subreddit_bp.route("/subreddits", methods=["POST"])
def register_subreddit_route():
    return register_subreddit()


@subreddit_bp.route("/subreddits", methods=["GET"])
def get_subreddits_route():
    return get_subreddits()
