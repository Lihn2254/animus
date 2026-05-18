from datetime import datetime

from infrastructure.db import db


class AnalysisSchedule(db.Model):
    __tablename__ = "analysis_schedules"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    frequency = db.Column(db.String(20), nullable=False)
    scheduled_day = db.Column(db.String(20), nullable=False)
    scheduled_time = db.Column(db.String(5), nullable=False)
    next_run_date = db.Column(db.DateTime, nullable=True)
    last_run_date = db.Column(db.DateTime, nullable=True)
    active = db.Column(db.Boolean, default=True, nullable=False)

    geographical_region = db.Column(db.String(25), nullable=True)
    age_range = db.Column(db.String(6), nullable=True)
    topics = db.Column(db.JSON, nullable=True)
    communities = db.Column(db.JSON, nullable=True)
    post_count = db.Column(db.Integer, nullable=True)
    include_comments = db.Column(db.Boolean, default=False, nullable=False)
    model = db.Column(db.String(50), nullable=False, default="gemini-3-flash-preview")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="analysis_schedules")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "frequency": self.frequency,
            "scheduled_day": self.scheduled_day,
            "scheduled_time": self.scheduled_time,
            "next_run_date": self.next_run_date.isoformat() if self.next_run_date else None,
            "last_run_date": self.last_run_date.isoformat() if self.last_run_date else None,
            "active": self.active,
            "geographical_region": self.geographical_region,
            "age_range": self.age_range,
            "topics": self.topics,
            "communities": self.communities,
            "post_count": self.post_count,
            "include_comments": self.include_comments,
            "model": self.model,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
