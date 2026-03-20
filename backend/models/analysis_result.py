from datetime import datetime
from infrastructure.db import db


class AnalysisResult(db.Model):
    __tablename__ = "analysis_results"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    stress_level = db.Column(db.Float, db.CheckConstraint("stress_level >= 0 AND stress_level <= 1"))
    anxiety_level = db.Column(db.Float, db.CheckConstraint("anxiety_level >= 0 AND anxiety_level <= 1"))
    sentiment = db.Column(db.String(20))
    keywords = db.Column(db.JSON)
    communities = db.Column(db.JSON, nullable=True)
    summary = db.Column(db.String(800))
    post_count = db.Column(db.Integer)
    model_version = db.Column(db.String(50))
    analysis_date = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", back_populates="analysis_results")
    raw_data = db.relationship("RawRedditData", back_populates="analysis_result")

    def to_dict(self):
        return {
            "id": self.id,
            "stress_level": self.stress_level,
            "anxiety_level": self.anxiety_level,
            "sentiment": self.sentiment,
            "keywords": self.keywords,
            "communities": self.communities,
            "summary": self.summary,
            "post_count": self.post_count,
            "model_version": self.model_version,
            "analysis_date": self.analysis_date.isoformat() if self.analysis_date else None,
        }
