from datetime import datetime, timezone

from infrastructure.db import db
from models.post import Post
from models.subreddit import Subreddit
from services.yars import YARS


class ScrapingService:
    def __init__(self):
        self._yars = YARS()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def fetch_subreddit_posts(self, name, limit=25, category="hot", include_comments=False, save=True):
        """Scrape posts from a registered subreddit by name."""
        subreddit = Subreddit.query.filter_by(name=name).first()
        if subreddit is None:
            return {"error": f"Subreddit '{name}' is not registered."}, 404

        raw_posts = self._yars.fetch_subreddit_posts(subreddit.name, limit=limit, category=category)

        results = []
        for raw in raw_posts:
            if include_comments and raw.get("permalink"):
                details = self._yars.scrape_post_details(raw["permalink"])
                if details:
                    raw["comments"] = details.get("comments", [])

            if save:
                post = self._upsert_post(raw, subreddit.id)
                results.append(post.to_dict() if post else raw)
            else:
                results.append(raw)

        if save:
            subreddit.last_scraped = datetime.now(timezone.utc)
            db.session.commit()

        return results, 200

    def search(self, query, subreddit_name=None, limit=10, include_comments=False, save=False):
        """Search Reddit globally or within a specific subreddit."""
        if subreddit_name:
            raw_results = self._yars.search_subreddit(subreddit_name, query, limit=limit)
        else:
            raw_results = self._yars.search_reddit(query, limit=limit)

        results = []
        for raw in raw_results:
            if include_comments and raw.get("permalink"):
                details = self._yars.scrape_post_details(raw["permalink"])
                if details:
                    raw["comments"] = details.get("comments", [])

            if save:
                subreddit_id = None
                if raw.get("subreddit"):
                    sub = Subreddit.query.filter_by(name=raw["subreddit"]).first()
                    if sub is None:
                        sub = Subreddit(name=raw["subreddit"])
                        db.session.add(sub)
                        db.session.flush()
                    subreddit_id = sub.id

                post = self._upsert_post(raw, subreddit_id)
                results.append(post.to_dict() if post else raw)
            else:
                results.append(raw)

        if save:
            db.session.commit()

        return results, 200

    def fetch_user_data(self, username, limit=30, save=False):
        """Fetch a Reddit user's post and comment history."""
        items = self._yars.scrape_user_data(username, limit=limit)

        if save:
            for item in items:
                if item.get("external_id"):
                    self._upsert_post(item, subreddit_id=None)
            db.session.commit()

        return items, 200

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _upsert_post(self, raw, subreddit_id):
        """Insert a post if it doesn't already exist (dedup by external_id)."""
        external_id = raw.get("external_id") or raw.get("id")
        if not external_id:
            return None

        existing = Post.query.filter_by(external_id=external_id).first()
        if existing:
            return existing

        created_utc = raw.get("created_utc")
        if isinstance(created_utc, (int, float)):
            created_utc = datetime.fromtimestamp(created_utc, tz=timezone.utc)

        post = Post(
            external_id=external_id,
            subreddit_id=subreddit_id,
            title=raw.get("title"),
            content=raw.get("content") or raw.get("body") or raw.get("description"),
            author=raw.get("author"),
            created_utc=created_utc,
            raw_json=raw,
        )
        db.session.add(post)
        db.session.flush()
        return post
