from datetime import datetime
from infrastructure.db import db


class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(20), unique=True, nullable=False)
    subreddit_id = db.Column(db.Integer, db.ForeignKey("subreddits.id", ondelete="CASCADE"), nullable=True)
    title = db.Column(db.Text, nullable=True)
    content = db.Column(db.Text, nullable=True)
    author = db.Column(db.String(100), nullable=True)
    created_utc = db.Column(db.DateTime, nullable=True)
    raw_json = db.Column(db.JSON, nullable=True)
    scraped_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    subreddit = db.relationship("Subreddit", back_populates="posts")
    analysis_result = db.relationship("AnalysisResult", back_populates="post", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "external_id": self.external_id,
            "subreddit_id": self.subreddit_id,
            "title": self.title,
            "content": self.content,
            "author": self.author,
            "created_utc": self.created_utc.isoformat() if self.created_utc else None,
            "scraped_at": self.scraped_at.isoformat() if self.scraped_at else None,
        }
