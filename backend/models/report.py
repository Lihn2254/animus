from datetime import datetime
from infrastructure.db import db


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    title = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # aggregated summary fields
    overall_sentiment = db.Column(db.String(50), nullable=True)
    stress_level = db.Column(db.Float, nullable=True)
    anxiety_level = db.Column(db.Float, nullable=True)
    total_posts = db.Column(db.Integer, nullable=True)
    topics = db.Column(db.JSON, nullable=True)

    # list of included analysis ids and storage info
    included_analysis_ids = db.Column(db.JSON, nullable=False)
    filename = db.Column(db.String(300), nullable=False)
    storage_path = db.Column(db.String(500), nullable=False)

    # relationships
    user = db.relationship("User", back_populates="reports")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "overall_sentiment": self.overall_sentiment,
            "stress_level": self.stress_level,
            "anxiety_level": self.anxiety_level,
            "total_posts": self.total_posts,
            "topics": self.topics,
            "included_analysis_ids": self.included_analysis_ids,
            "filename": self.filename,
            "storage_path": self.storage_path,
        }
