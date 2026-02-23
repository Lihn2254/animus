from datetime import datetime
from infrastructure.db import db


class AnalysisResult(db.Model):
    __tablename__ = "analysis_results"

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id", ondelete="CASCADE"), unique=True, nullable=True)
    stress_level = db.Column(db.Float, db.CheckConstraint("stress_level >= 0 AND stress_level <= 1"), nullable=True)
    anxiety_level = db.Column(db.Float, db.CheckConstraint("anxiety_level >= 0 AND anxiety_level <= 1"), nullable=True)
    sentiment = db.Column(db.String(20), nullable=True)
    keywords = db.Column(db.JSON, nullable=True)
    model_version = db.Column(db.String(50), nullable=True)
    analysis_date = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    post = db.relationship("Post", back_populates="analysis_result")

    def to_dict(self):
        return {
            "id": self.id,
            "post_id": self.post_id,
            "stress_level": self.stress_level,
            "anxiety_level": self.anxiety_level,
            "sentiment": self.sentiment,
            "keywords": self.keywords,
            "model_version": self.model_version,
            "analysis_date": self.analysis_date.isoformat() if self.analysis_date else None,
        }
