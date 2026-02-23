from infrastructure.db import db


class Subreddit(db.Model):
    __tablename__ = "subreddits"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    category = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    last_scraped = db.Column(db.DateTime, nullable=True)

    # Relationships
    posts = db.relationship("Post", back_populates="subreddit", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "is_active": self.is_active,
            "last_scraped": self.last_scraped.isoformat() if self.last_scraped else None,
        }
