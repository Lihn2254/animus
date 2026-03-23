import json
import os

from google import genai

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

_SENTIMENT_PROMPT = """You are an AI assistant specialized in sentiment analysis for Reddit content.

Analyze the provided Reddit posts and comments and return a single JSON object with this schema and constraints:
{{
    "sentiment": "positivo" | "negativo" | "neutral",
    "stress_level": number,  // 0.0 to 1.0
    "anxiety_level": number, // 0.0 to 1.0
    "keywords": ["string", ...],
    "model_version": "gemini-3-flash-preview",
    "summary": "string"
}}

Rules:
- None of the values can be null.
- All fields must have a value.
- If uncertain about the sentiment value (e.g. due to the lack of sufficient data) write "neutral"
- Write all string values of the JSON object in Spanish. The fields' names must remain in English.
- Output JSON only. No extra text.
- All numeric fields must have a value. If uncertain about the value (e.g. due to a neutral sentiment or too little data) write 0.0.
- Ensure numeric values are within 0.0 to 1.0.
- Provide 5-12 concise keywords.

Context filters (may be approximate and based on available data):
{context}

Reddit content:
{content}
"""


class AIAnalysisService:
    def __init__(self):
        self._yars = YARS()
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self._ai = genai.Client(api_key=api_key)
        self._model_name = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")

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
        response = self._generate_text(prompt)

        return {"username": username, "analysis": response}, 200

    def analyze_sentiment(self, items, context):
        """Run Gemini AI sentiment analysis over aggregated Reddit items."""
        formatted_items = self._format_items(items)
        if not formatted_items:
            return {"error": "No usable content found for analysis."}, 404

        prompt = _SENTIMENT_PROMPT.format(
            context=json.dumps(context, ensure_ascii=True),
            content="\n\n".join(formatted_items),
        )
        response = self._generate_text(prompt)

        parsed = self._extract_json(response)
        if not parsed:
            return {"error": "AI response was not valid JSON."}, 502

        normalized = self._normalize_sentiment_response(parsed)
        if normalized is None:
            return {"error": "AI response missing required fields."}, 502

        normalized["analyzed_posts"] = len(formatted_items)
        return {"analysis": normalized}, 200

    def _format_items(self, items, max_items=50, max_item_chars=700, max_comments=15):
        formatted = []
        for item in items[:max_items]:
            parts = []
            title = (item.get("title") or "").strip()
            if title:
                parts.append(f"Title: {title}")

            content = (
                item.get("content")
                or item.get("selftext")
                or item.get("description")
                or item.get("body")
                or ""
            ).strip()
            if content:
                parts.append(f"Content: {content}")

            comments = self._flatten_comments(item.get("comments", []), max_comments=max_comments)
            if comments:
                parts.append("Comments: " + " | ".join(comments))

            if not parts:
                continue

            combined = " ".join(parts).replace("\n", " <line gap> ")
            formatted.append(combined[:max_item_chars])

        return formatted

    def _flatten_comments(self, comments, max_comments=15):
        if not comments:
            return []

        flattened = []

        def walk(nodes):
            for node in nodes:
                if len(flattened) >= max_comments:
                    return
                body = (node.get("body") or "").strip()
                if body:
                    flattened.append(body.replace("\n", " <line gap> "))
                replies = node.get("replies", [])
                if replies:
                    walk(replies)

        walk(comments)
        return flattened

    def _extract_json(self, response):
        if isinstance(response, dict):
            return response
        if response is None:
            return None

        if not isinstance(response, str):
            response = str(response)

        start = response.find("{")
        end = response.rfind("}")
        if start == -1 or end == -1 or end <= start:
            return None

        candidate = response[start : end + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            return None

    def _normalize_sentiment_response(self, parsed):
        sentiment = parsed.get("sentiment")
        if isinstance(sentiment, str):
            sentiment = sentiment.strip().lower()

        stress_level = self._safe_float(parsed.get("stress_level") or parsed.get("stressLevel"))
        anxiety_level = self._safe_float(parsed.get("anxiety_level") or parsed.get("anxietyLevel"))
        keywords = parsed.get("keywords")
        if isinstance(keywords, list):
            keywords = [str(k).strip() for k in keywords if str(k).strip()]
        else:
            keywords = None

        model_version = parsed.get("model_version") or parsed.get("modelVersion") or self._model_name
        summary = parsed.get("summary")
        if not isinstance(summary, str) or not summary.strip():
            summary = None

        if sentiment not in {"positivo", "negativo", "neutral"}:
            sentiment = None

        if all(value is None for value in [sentiment, stress_level, anxiety_level, keywords, summary]):
            return None

        return {
            "sentiment": sentiment,
            "stress_level": stress_level,
            "anxiety_level": anxiety_level,
            "keywords": keywords,
            "model_version": str(model_version),
            "summary": summary,
        }

    def _safe_float(self, value):
        try:
            value = float(value)
        except (TypeError, ValueError):
            return None

        if value < 0 or value > 1:
            return None

        return value

    def _generate_text(self, prompt):
        response = self._ai.models.generate_content(
            model=self._model_name,
            contents=prompt,
        )
        return response.text
