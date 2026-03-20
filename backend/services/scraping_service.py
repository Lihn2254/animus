from datetime import datetime, timezone

from infrastructure.db import db
from models.raw_reddit_data import RawRedditData
from services.yars import YARS


class ScrapingService:
    def __init__(self):
        self._yars = YARS()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def fetch_subreddit_posts(self, subreddit_name, user_id, limit=25, category="hot", include_comments=False, save=True, analysis_result_id=None):
        raw_posts = self._yars.fetch_subreddit_posts(subreddit_name, limit=limit, category=category)

        results = []
        for raw in raw_posts:
            if include_comments and raw.get("permalink"):
                details = self._yars.scrape_post_details(raw["permalink"])
                if details:
                    raw["comments"] = details.get("comments", [])

            if save:
                raw_data = self._upsert_raw_data(
                    raw,
                    user_id=user_id,
                    content_type="post",
                    analysis_result_id=analysis_result_id
                )
                results.append(raw_data.to_dict() if raw_data else raw)
            else:
                results.append(raw)

        return results, 200

    def search(self, query, user_id=None, subreddit_name=None, limit=10, include_comments=False, save=False, analysis_result_id=None):
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

            if save and user_id:
                raw_data = self._upsert_raw_data(
                    raw,
                    user_id=user_id,
                    content_type="post",
                    analysis_result_id=analysis_result_id
                )
                results.append(raw_data.to_dict() if raw_data else raw)
            else:
                results.append(raw)

        if save and user_id:
            db.session.commit()

        return results, 200

    def fetch_user_data(self, reddit_username, user_id, limit=30, save=False, analysis_result_id=None):
        """Fetch a Reddit user's post and comment history."""
        items = self._yars.scrape_user_data(reddit_username, limit=limit)

        if save:
            for item in items:
                if item.get("external_id"):
                    content_type = item.get("type", "post")  # YARS returns "post" or "comment"
                    self._upsert_raw_data(
                        item,
                        user_id=user_id,
                        content_type=content_type,
                        analysis_result_id=analysis_result_id
                    )
            db.session.commit()

        return items, 200

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _upsert_raw_data(self, raw, user_id, content_type, analysis_result_id=None):
        """Insert raw Reddit data if it doesn't already exist (dedup by external_id)."""
        external_id = raw.get("external_id") or raw.get("id")
        if not external_id:
            return None

        # Check for existing record
        existing = RawRedditData.query.filter_by(external_id=external_id).first()
        if existing:
            # Optionally update analysis_result_id if provided
            if analysis_result_id and not existing.analysis_result_id:
                existing.analysis_result_id = analysis_result_id
                db.session.flush()
            return existing

        # Parse created_utc timestamp
        created_utc = raw.get("created_utc")
        if isinstance(created_utc, (int, float)):
            created_utc = datetime.fromtimestamp(created_utc, tz=timezone.utc)

        # Create new record
        raw_data = RawRedditData(
            user_id=user_id,
            analysis_result_id=analysis_result_id,
            external_id=external_id,
            content_type=content_type,
            title=raw.get("title"),
            content=raw.get("content") or raw.get("body") or raw.get("selftext") or raw.get("description"),
            author=raw.get("author"),
            subreddit=raw.get("subreddit"),
            permalink=raw.get("permalink"),
            url=raw.get("url") or raw.get("link"),
            created_utc=created_utc,
            score=raw.get("score"),
            num_comments=raw.get("num_comments"),
            raw_json=raw,
        )
        db.session.add(raw_data)
        db.session.flush()
        return raw_data
