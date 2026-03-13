from flask import Flask
from flask_cors import CORS
from .extensions import db, jwt
from .config import Config
from .auth.routes import auth_bp
from .credit.routes import credit_bp
from .visibility.routes import visibility_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(credit_bp, url_prefix="/credit")
    app.register_blueprint(visibility_bp, url_prefix="/visibility")

    with app.app_context():
        db.create_all()

    return app
