from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from infrastructure.db import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    country = db.Column(db.String(100), nullable=False)
    region = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    analysis_results = db.relationship("AnalysisResult", back_populates="user", cascade="all, delete-orphan")


    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "fullname": self.fullname,
            "username": self.username,
            "email": self.email,
            "country": self.country,
            "region": self.region,
            "created_at": self.created_at.isoformat(),
        }
