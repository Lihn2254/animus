from flask import jsonify


def home():
    return jsonify(
        {
            "message": "Welcome to Animus API",
            "version": "1.0.0",
            "endpoints": {
                "POST /api/register": "Create a new account",
                "POST /api/login": "Login to an existing account",
                "DELETE /api/account/<user_id>": "Delete an account",
                "PUT /api/account/<user_id>": "Update account information (fullname, username, email, password, country, region)",
                "GET /api/analysis": "Get analysis results filtered by keywords, sentiment, and/or date range",
                "POST /api/analysis/run": "Run a new analysis with region, dates, age range, and topics",
                "POST /api/subreddits": "Register a new subreddit",
                "GET /api/subreddits": "Get subreddits filtered by category, last_scraped, and/or is_active",
            },
        }
    )
