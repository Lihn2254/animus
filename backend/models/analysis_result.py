from datetime import datetime
from infrastructure.db import db


class AnalysisResult(db.Model):
    __tablename__ = "analysis_results"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    #Parameters given by the user
    geographical_region = db.Column(db.String(25))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    age_range = db.Column(db.String(6))
    topics = db.Column(db.JSON, nullable=True)
    communities = db.Column(db.JSON, nullable=True)
    post_count = db.Column(db.Integer)

    #Analysis results
    sentiment = db.Column(db.String(20))
    stress_level = db.Column(db.Float, db.CheckConstraint("stress_level >= 0 AND stress_level <= 1"))
    anxiety_level = db.Column(db.Float, db.CheckConstraint("anxiety_level >= 0 AND anxiety_level <= 1"))
    keywords = db.Column(db.JSON)
    summary = db.Column(db.String(800))

    #Metadata
    model_version = db.Column(db.String(50))
    analysis_date = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", back_populates="analysis_results")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "geographical_region": self.geographical_region,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "age_range": self.age_range,
            "topics": self.topics,
            "communities": self.communities,
            "post_count": self.post_count,
            "sentiment": self.sentiment,
            "stress_level": self.stress_level,
            "anxiety_level": self.anxiety_level,
            "keywords": self.keywords,
            "summary": self.summary,
            "model_version": self.model_version,
            "analysis_date": self.analysis_date.isoformat() if self.analysis_date else None,
        }
