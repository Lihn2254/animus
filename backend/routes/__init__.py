from .home_routes import home_bp
from .auth_routes import auth_bp
from .account_routes import account_bp
from .analysis_routes import analysis_bp
from .scraping_routes import scraping_bp


def register_routes(app):
    app.register_blueprint(home_bp)
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(account_bp, url_prefix="/api")
    app.register_blueprint(analysis_bp, url_prefix="/api")
    app.register_blueprint(scraping_bp, url_prefix="/api")
