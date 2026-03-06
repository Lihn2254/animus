import json

from meta_ai_api import MetaAI

from services.yars import YARS

_PROMPT_PREFIX = """You are an AI assistant specialized in analyzing Reddit user data. Your task is to analyze the given user's comment history and provide insights into their personality, interests, and behavior.

Given the user's comment history, please provide an analysis focusing on the following aspects:

1. Personality Traits: Identify key personality traits based on the user's comments.
2. Interests & Passions: Determine the user's main interests and passions from their subreddit choices and comment content.
3. Communication Style: Describe how the user typically engages with others on Reddit.
4. Social Behavior: Infer the user's social interaction tendencies on the platform.
5. Recurring Themes: Identify any patterns or repeated themes in the user's comments.

For each aspect, provide a concise analysis supported by specific examples from the user's comment history when possible. Limit your total response to approximately 500 words.

User's comment history:
"""


class AIAnalysisService:
    def __init__(self):
        self._yars = YARS()
        self._ai = MetaAI()

    def analyze_user(self, username, limit=30):
        """Scrape a user's comment history and return a Meta AI personality analysis."""
        user_data = self._yars.scrape_user_data(username, limit=limit)

        comments = [
            f"{item['subreddit']} > {item['body'].replace(chr(10), ' <line gap> ')}"
            for item in user_data
            if item.get("type") == "comment" and item.get("body")
        ]

        if not comments:
            return {"error": f"No comment history found for user '{username}'."}, 404

        prompt = _PROMPT_PREFIX + "\n".join(comments)
        response = self._ai.prompt(message=json.dumps({"prompt": prompt}))

        return {"username": username, "analysis": response}, 200
