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

            results.append(raw)

        return results, 200

    def fetch_user_data(self, reddit_username, user_id, limit=30, save=False, analysis_result_id=None):
        """Fetch a Reddit user's post and comment history."""
        items = self._yars.scrape_user_data(reddit_username, limit=limit)
        return items, 200
