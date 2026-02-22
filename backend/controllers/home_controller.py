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
            },
        }
    )
