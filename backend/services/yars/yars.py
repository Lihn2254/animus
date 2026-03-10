from __future__ import annotations
from .sessions import RandomUserAgentSession
import os
import time
import random
import logging
import requests
from urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter

os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    filename="logs/yars.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)


class YARS:
    __slots__ = ("headers", "session", "proxy", "timeout")

    def __init__(self, proxy=None, timeout=10, random_user_agent=True):
        self.session = RandomUserAgentSession() if random_user_agent else requests.Session()
        self.proxy = proxy
        self.timeout = timeout

        retries = Retry(
            total=5,
            backoff_factor=2,
            status_forcelist=[429, 500, 502, 503, 504],
        )

        self.session.mount("https://", HTTPAdapter(max_retries=retries))

        if proxy:
            self.session.proxies.update({"http": proxy, "https": proxy})

    def handle_search(self, url, params, after=None, before=None):
        if after:
            params["after"] = after
        if before:
            params["before"] = before

        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            logging.info("Search request successful")
        except Exception as e:
            if response.status_code != 200:
                logging.info("Search request unsuccessful due to: %s", e)
                return []

        data = response.json()
        results = []
        for post in data["data"]["children"]:
            post_data = post["data"]
            results.append(
                {
                    "title": post_data["title"],
                    "link": f"https://www.reddit.com{post_data['permalink']}",
                    "description": post_data.get("selftext", "")[:269],
                    "permalink": post_data["permalink"],
                    "author": post_data.get("author", ""),
                    "subreddit": post_data.get("subreddit", ""),
                    "score": post_data.get("score", 0),
                    "num_comments": post_data.get("num_comments", 0),
                    "created_utc": post_data.get("created_utc"),
                    "external_id": post_data.get("id", ""),
                }
            )
        logging.info("Search returned %d results", len(results))
        return results

    def search_reddit(self, query, limit=10, after=None, before=None):
        url = "https://www.reddit.com/search.json"
        params = {"q": query, "limit": limit, "sort": "relevance", "type": "link"}
        return self.handle_search(url, params, after, before)

    def search_subreddit(self, subreddit, query, limit=10, after=None, before=None, sort="relevance"):
        url = f"https://www.reddit.com/r/{subreddit}/search.json"
        params = {"q": query, "limit": limit, "sort": sort, "type": "link", "restrict_sr": "on"}
        return self.handle_search(url, params, after, before)

    def scrape_post_details(self, permalink):
        url = f"https://www.reddit.com{permalink}.json"

        try:
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            logging.info("Post details request successful: %s", url)
        except Exception as e:
            logging.info("Post details request unsuccessful: %s", e)
            if response.status_code != 200:
                return None

        post_data = response.json()
        if not isinstance(post_data, list) or len(post_data) < 2:
            return None

        main_post = post_data[0]["data"]["children"][0]["data"]
        title = main_post["title"]
        body = main_post.get("selftext", "")

        comments = self._extract_comments(post_data[1]["data"]["children"])
        logging.info("Successfully scraped post: %s", title)
        return {"title": title, "body": body, "comments": comments}

    def _extract_comments(self, comments):
        extracted_comments = []
        for comment in comments:
            if isinstance(comment, dict) and comment.get("kind") == "t1":
                comment_data = comment.get("data", {})
                extracted_comment = {
                    "author": comment_data.get("author", ""),
                    "body": comment_data.get("body", ""),
                    "score": comment_data.get("score", ""),
                    "replies": [],
                }
                replies = comment_data.get("replies", "")
                if isinstance(replies, dict):
                    extracted_comment["replies"] = self._extract_comments(
                        replies.get("data", {}).get("children", [])
                    )
                extracted_comments.append(extracted_comment)
        return extracted_comments

    def scrape_user_data(self, username, limit=10):
        logging.info("Scraping user data for %s, limit: %d", username, limit)
        base_url = f"https://www.reddit.com/user/{username}/.json"
        params = {"limit": limit, "after": None}
        all_items = []
        count = 0

        while count < limit:
            try:
                response = self.session.get(base_url, params=params, timeout=self.timeout)
                response.raise_for_status()
            except Exception as e:
                logging.info("User data request unsuccessful: %s", e)
                break

            try:
                data = response.json()
            except ValueError:
                break

            if "data" not in data or "children" not in data["data"]:
                break

            items = data["data"]["children"]
            if not items:
                break

            for item in items:
                kind = item["kind"]
                item_data = item["data"]
                if kind == "t3":
                    all_items.append(
                        {
                            "type": "post",
                            "title": item_data.get("title", ""),
                            "subreddit": item_data.get("subreddit", ""),
                            "url": f"https://www.reddit.com{item_data.get('permalink', '')}",
                            "created_utc": item_data.get("created_utc", ""),
                            "external_id": item_data.get("id", ""),
                            "permalink": item_data.get("permalink", ""),
                            "author": item_data.get("author", username),
                            "content": item_data.get("selftext", ""),
                        }
                    )
                elif kind == "t1":
                    all_items.append(
                        {
                            "type": "comment",
                            "subreddit": item_data.get("subreddit", ""),
                            "body": item_data.get("body", ""),
                            "created_utc": item_data.get("created_utc", ""),
                            "url": f"https://www.reddit.com{item_data.get('permalink', '')}",
                            "external_id": item_data.get("id", ""),
                            "author": item_data.get("author", username),
                        }
                    )
                count += 1
                if count >= limit:
                    break

            params["after"] = data["data"].get("after")
            if not params["after"]:
                break

            time.sleep(random.uniform(1, 2))

        logging.info("Successfully scraped user data for %s", username)
        return all_items

    def fetch_subreddit_posts(self, subreddit, limit=10, category="hot", time_filter="all"):
        logging.info(
            "Fetching subreddit posts for %s, limit: %d, category: %s",
            subreddit, limit, category,
        )
        if category not in ["hot", "top", "new", "userhot", "usertop", "usernew"]:
            raise ValueError("Category must be 'hot', 'top', or 'new'")

        batch_size = min(100, limit)
        total_fetched = 0
        after = None
        all_posts = []

        while total_fetched < limit:
            if category == "hot":
                url = f"https://www.reddit.com/r/{subreddit}/hot.json"
            elif category == "top":
                url = f"https://www.reddit.com/r/{subreddit}/top.json"
            else:
                url = f"https://www.reddit.com/r/{subreddit}/new.json"

            params = {"limit": batch_size, "after": after, "raw_json": 1, "t": time_filter}

            try:
                response = self.session.get(url, params=params, timeout=self.timeout)
                response.raise_for_status()
            except Exception as e:
                logging.info("Subreddit posts request unsuccessful: %s", e)
                break

            data = response.json()
            posts = data["data"]["children"]
            if not posts:
                break

            for post in posts:
                post_data = post["data"]
                post_info = {
                    "title": post_data["title"],
                    "author": post_data["author"],
                    "permalink": post_data["permalink"],
                    "score": post_data["score"],
                    "num_comments": post_data["num_comments"],
                    "created_utc": post_data["created_utc"],
                    "external_id": post_data.get("id", ""),
                    "content": post_data.get("selftext", ""),
                }
                if post_data.get("post_hint") == "image" and "url" in post_data:
                    post_info["image_url"] = post_data["url"]
                elif "preview" in post_data and "images" in post_data.get("preview", {}):
                    post_info["image_url"] = post_data["preview"]["images"][0]["source"]["url"]
                if "thumbnail" in post_data and post_data["thumbnail"] not in ("self", "default", ""):
                    post_info["thumbnail_url"] = post_data["thumbnail"]

                all_posts.append(post_info)
                total_fetched += 1
                if total_fetched >= limit:
                    break

            after = data["data"].get("after")
            if not after:
                break

            time.sleep(random.uniform(1, 2))

        logging.info("Successfully fetched %d posts from r/%s", total_fetched, subreddit)
        return all_posts
