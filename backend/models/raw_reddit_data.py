from datetime import datetime
from infrastructure.db import db


class RawRedditData(db.Model):
    __tablename__ = "raw_reddit_data"

    id = db.Column(db.Integer, primary_key=True)

    # Foreign keys for relationships
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    analysis_result_id = db.Column(db.Integer, db.ForeignKey("analysis_results.id"), nullable=True)

    # Unique identifier from Reddit
    external_id = db.Column(db.String(50), unique=True, nullable=False, index=True)

    # Content type classifier
    content_type = db.Column(db.String(20), nullable=False)  # "post" or "comment"

    # Core content fields
    title = db.Column(db.String(500), nullable=True)  # Only for posts
    content = db.Column(db.Text, nullable=True)  # selftext for posts, body for comments
    subreddit = db.Column(db.String(100), nullable=True)

    # URLs and links
    permalink = db.Column(db.String(500), nullable=True)
    url = db.Column(db.String(500), nullable=True)

    # Metadata
    created_utc = db.Column(db.DateTime, nullable=True)
    score = db.Column(db.Integer, nullable=True)
    num_comments = db.Column(db.Integer, nullable=True)

    # Store complete raw JSON from Reddit API
    raw_json = db.Column(db.JSON, nullable=True)

    # Tracking
    scraped_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", back_populates="scraped_data")
    analysis_result = db.relationship("AnalysisResult", back_populates="raw_data")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "analysis_result_id": self.analysis_result_id,
            "external_id": self.external_id,
            "content_type": self.content_type,
            "title": self.title,
            "content": self.content,
            "subreddit": self.subreddit,
            "permalink": self.permalink,
            "url": self.url,
            "created_utc": self.created_utc.isoformat() if self.created_utc else None,
            "score": self.score,
            "num_comments": self.num_comments,
            "raw_json": self.raw_json,
            "scraped_at": self.scraped_at.isoformat() if self.scraped_at else None,
        }
