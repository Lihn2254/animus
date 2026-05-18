from datetime import datetime
from infrastructure.db import db

class Notification(db.Model):
    __tablename__ = "notifications"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    analysis_id = db.Column(db.Integer, db.ForeignKey("analysis_results.id", ondelete="CASCADE"), nullable=True)
    report_id = db.Column(db.Integer, nullable=True)  # No ForeignKey yet as reports table doesn't exist
    
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship("User", back_populates="notifications")
    analysis = db.relationship("AnalysisResult", back_populates="notifications")
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "analysis_id": self.analysis_id,
            "report_id": self.report_id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
