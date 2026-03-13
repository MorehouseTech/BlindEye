# Database models for BlindEye.
from datetime import datetime, timezone
from .extensions import db


class Business(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    products = db.relationship("Product", backref="business", lazy=True)


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey("business.id"), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    features = db.Column(db.Text, nullable=True)
    competitors = db.Column(db.Text, nullable=True)
    availability = db.Column(db.String(50), default="in_stock")
    created_at = db.Column(db.DateTime, server_default=db.func.now())


class UserSearch(db.Model):
    """Consumer search queries — seeds business-side suggested queries."""
    __tablename__ = "user_searches"
    id = db.Column(db.Integer, primary_key=True)
    search_text = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class UserInteraction(db.Model):
    """User likes/views on feed posts — for recommendation engine."""
    __tablename__ = "user_interactions"
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(100), nullable=False)
    post_id = db.Column(db.Integer, nullable=False)
    action = db.Column(db.String(20), nullable=False)  # "like", "view", "skip"
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class VisibilityTestResult(db.Model):
    """Cached visibility test results for performance."""
    __tablename__ = "visibility_test_results"
    id = db.Column(db.Integer, primary_key=True)
    query_hash = db.Column(db.String(64), nullable=False, index=True)
    query_text = db.Column(db.String(255), nullable=False)
    result_json = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
