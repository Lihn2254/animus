from flask import Flask
from .config import Config
from .db import db
from routes import register_routes


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # basic CORS header for all responses
    @app.after_request
    def add_cors(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        return response

    db.init_app(app)
    register_routes(app)

    return app
