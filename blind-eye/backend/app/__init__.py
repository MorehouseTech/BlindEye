import logging
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load .env from backend root
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")

    CORS(app)

    from .auth.routes import auth_bp
    from .credit.routes import credit_bp
    from .visibility.routes import visibility_bp
    from .feed.routes import feed_bp
    from .insights.routes import insights_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(credit_bp, url_prefix="/credit")
    app.register_blueprint(visibility_bp, url_prefix="/visibility")
    app.register_blueprint(feed_bp, url_prefix="/feed")
    app.register_blueprint(insights_bp, url_prefix="/insights")

    return app
