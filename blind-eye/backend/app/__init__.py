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

logger = logging.getLogger("blindeye.app")


def _seed_user_searches(db):
    """Seed sample consumer searches if table is empty."""
    from .models import UserSearch
    if db.session.query(UserSearch).count() > 0:
        return

    searches = [
        ("Best sustainable running shoes under $150", "Running Shoes"),
        ("Eco-friendly sneakers for everyday wear", "Casual Sneakers"),
        ("Where to buy recycled hiking boots", "Hiking Boots"),
        ("Top rated organic cotton t-shirts", "Apparel"),
        ("Best plant-based protein bars 2026", "Food & Beverage"),
        ("Solar powered desk accessories", "Electronics"),
        ("Sustainable home goods brands", "Home Goods"),
        ("Affordable eco-friendly running shoes", "Running Shoes"),
        ("Best running shoes for flat feet", "Running Shoes"),
        ("Organic skincare brands near me", "Beauty"),
        ("Cheap wireless earbuds under $50", "Electronics"),
        ("Vegan leather bags", "Accessories"),
        ("Best taco shops in Austin", "Food & Beverage"),
        ("Zero waste kitchen products", "Home Goods"),
        ("Bamboo toothbrush subscription", "Health"),
        ("Ethical fashion brands for women", "Apparel"),
        ("Recyclable phone cases", "Electronics"),
        ("Local coffee roasters near me", "Food & Beverage"),
        ("Best yoga mat for beginners", "Fitness"),
        ("Compostable trash bags", "Home Goods"),
        ("Natural deodorant that works", "Health"),
        ("Fair trade chocolate brands", "Food & Beverage"),
        ("Sustainable swimwear brands", "Apparel"),
        ("Best reusable water bottles", "Home Goods"),
        ("Solar charger for camping", "Electronics"),
        ("Organic baby clothes brands", "Apparel"),
        ("Biodegradable cleaning products", "Home Goods"),
        ("Best electric bikes under $1000", "Transportation"),
        ("Plant-based meal delivery services", "Food & Beverage"),
        ("Eco-friendly furniture brands", "Home Goods"),
    ]

    for query_text, category in searches:
        db.session.add(UserSearch(search_text=query_text, category=category))
    db.session.commit()
    logger.info("Seeded %d user searches", len(searches))


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")

    # Database — SQLite for local dev, Postgres for production
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "blindeye.db")
        db_url = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app)

    # Initialize extensions
    from .extensions import db
    db.init_app(app)

    # Register blueprints
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

    # Create tables and seed data
    with app.app_context():
        from . import models  # noqa: F401 — ensure models are registered
        db.create_all()
        _seed_user_searches(db)

    return app
