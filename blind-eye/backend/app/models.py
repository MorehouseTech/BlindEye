# Database models. Add new models here as features grow.
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
    features = db.Column(db.Text, nullable=True)          # JSON string: ["feature1", "feature2"]
    competitors = db.Column(db.Text, nullable=True)        # JSON string: ["comp1", "comp2"]
    availability = db.Column(db.String(50), default="in_stock")
    created_at = db.Column(db.DateTime, server_default=db.func.now())
