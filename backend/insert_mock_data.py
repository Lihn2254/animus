import sys
from datetime import datetime, timezone
from dotenv import load_dotenv

# Import the app, db, and models from the new structure
from infrastructure.app_factory import create_app
from infrastructure.db import db
from models.user import User
from models.analysis_result import AnalysisResult
from models.raw_reddit_data import RawRedditData

# Load environment variables
load_dotenv()


app = create_app()


def insert_users():
    print("\n[Users]")
    mock_users = [
        {
            "username": "john_doe",
            "email": "john.doe@example.com",
            "password": "password123",
            "fullname": "Universidad Nacional Autónoma de México",
            "country": "México",
            "region": "Ciudad de México",
        },
        {
            "username": "jane_smith",
            "email": "jane.smith@example.com",
            "password": "securepass456",
            "fullname": "Instituto Tecnológico y de Estudios Superiores de Monterrey",
            "country": "México",
            "region": "Nuevo León",
        },
        {
            "username": "bob_wilson",
            "email": "bob.wilson@example.com",
            "password": "mypassword789",
            "fullname": "Universidad de Guadalajara",
            "country": "México",
            "region": "Jalisco",
        },
        {
            "username": "alice_brown",
            "email": "alice.brown@example.com",
            "password": "alicepass321",
            "fullname": "Universidad Autónoma de Nuevo León",
            "country": "México",
            "region": "Nuevo León",
        },
        {
            "username": "charlie_davis",
            "email": "charlie.davis@example.com",
            "password": "charlie2024",
            "fullname": "Instituto Politécnico Nacional",
            "country": "México",
            "region": "Ciudad de México",
        },
    ]

    for user_data in mock_users:
        if User.query.filter_by(username=user_data["username"]).first():
            print(
                f"  Warning: User '{user_data['username']}' already exists, skipping..."
            )
            continue
        user = User(
            username=user_data["username"],
            email=user_data["email"],
            fullname=user_data["fullname"],
            country=user_data["country"],
            region=user_data["region"],
        )
        user.set_password(user_data["password"])
        db.session.add(user)
        print(f"  Added user: {user_data['username']}")

    db.session.commit()
    print(f"  Total users: {User.query.count()}")


def insert_raw_reddit_data():
    print("\n[Raw Reddit Data]")

    # Get first user for ownership
    user = User.query.first()
    if not user:
        print("  Warning: No users found, cannot insert raw data")
        return

    mock_data = [
        {
            "external_id": "abc123",
            "content_type": "post",
            "subreddit": "r/programming",
            "title": "I burned out after 3 years of crunch time at my job",
            "content": "I have been working 60+ hour weeks for years and I just cannot do it anymore. Anyone else been through this?",
            "created_utc": datetime(2026, 1, 10, 14, 30, tzinfo=timezone.utc),
            "permalink": "/r/programming/comments/abc123/burnout",
            "url": "https://www.reddit.com/r/programming/comments/abc123/burnout",
            "score": 1520,
            "num_comments": 312,
            "raw_json": {"score": 1520, "num_comments": 312, "upvote_ratio": 0.97},
        },
        {
            "external_id": "def456",
            "content_type": "post",
            "subreddit": "r/sysadmin",
            "title": "On-call schedule is destroying my sleep and personal life",
            "content": "Our team is understaffed and the on-call rotation is brutal. I am constantly anxious even on my days off.",
            "created_utc": datetime(2026, 1, 15, 9, 0, tzinfo=timezone.utc),
            "permalink": "/r/sysadmin/comments/def456/oncall",
            "url": "https://www.reddit.com/r/sysadmin/comments/def456/oncall",
            "score": 876,
            "num_comments": 198,
            "raw_json": {"score": 876, "num_comments": 198, "upvote_ratio": 0.95},
        },
        {
            "external_id": "ghi789",
            "content_type": "post",
            "subreddit": "r/devops",
            "title": "Finally automated the deployment pipeline – feeling great!",
            "content": "Spent two weeks building a full CI/CD pipeline and it went live today without a hitch. Super proud of this one.",
            "created_utc": datetime(2026, 2, 1, 11, 45, tzinfo=timezone.utc),
            "permalink": "/r/devops/comments/ghi789/pipeline",
            "url": "https://www.reddit.com/r/devops/comments/ghi789/pipeline",
            "score": 2300,
            "num_comments": 145,
            "raw_json": {"score": 2300, "num_comments": 145, "upvote_ratio": 0.99},
        },
        {
            "external_id": "jkl012",
            "content_type": "post",
            "subreddit": "r/cscareerquestions",
            "title": "Rejected from 50 jobs in a row – starting to lose hope",
            "content": "I have been applying for 6 months and keep getting ghosted or rejected. I do not know what I am doing wrong.",
            "created_utc": datetime(2026, 2, 10, 16, 20, tzinfo=timezone.utc),
            "permalink": "/r/cscareerquestions/comments/jkl012/rejected",
            "url": "https://www.reddit.com/r/cscareerquestions/comments/jkl012/rejected",
            "score": 3100,
            "num_comments": 520,
            "raw_json": {"score": 3100, "num_comments": 520, "upvote_ratio": 0.96},
        },
        {
            "external_id": "mno345",
            "content_type": "post",
            "subreddit": "r/learnprogramming",
            "title": "Just solved my first LeetCode medium problem!",
            "content": "Been struggling with algorithms for months. Finally cracked a medium problem on my own. Small win but it feels huge.",
            "created_utc": datetime(2026, 2, 18, 8, 0, tzinfo=timezone.utc),
            "permalink": "/r/learnprogramming/comments/mno345/leetcode",
            "url": "https://www.reddit.com/r/learnprogramming/comments/mno345/leetcode",
            "score": 450,
            "num_comments": 67,
            "raw_json": {"score": 450, "num_comments": 67, "upvote_ratio": 0.98},
        },
        {
            "external_id": "comment_xyz789",
            "content_type": "comment",
            "subreddit": "r/cscareerquestions",
            "content": "I went through the exact same thing. It took me 8 months but I finally landed a role. Keep going!",
            "created_utc": datetime(2026, 2, 11, 10, 15, tzinfo=timezone.utc),
            "permalink": "/r/cscareerquestions/comments/jkl012/comment/xyz789",
            "url": "https://www.reddit.com/r/cscareerquestions/comments/jkl012/comment/xyz789",
            "score": 45,
            "raw_json": {"score": 45, "type": "t1"},
        },
    ]

    for data in mock_data:
        if RawRedditData.query.filter_by(external_id=data["external_id"]).first():
            print(
                f"  Warning: Raw data '{data['external_id']}' already exists, skipping..."
            )
            continue

        raw_data = RawRedditData(
            user_id=user.id,
            external_id=data["external_id"],
            content_type=data["content_type"],
            title=data.get("title"),
            content=data.get("content"),
            subreddit=data.get("subreddit"),
            permalink=data.get("permalink"),
            url=data.get("url"),
            created_utc=data.get("created_utc"),
            score=data.get("score"),
            num_comments=data.get("num_comments"),
            raw_json=data.get("raw_json"),
        )
        db.session.add(raw_data)
        print(f"  Added raw data: {data['external_id']} ({data['content_type']})")

    db.session.commit()
    print(f"  Total raw reddit data: {RawRedditData.query.count()}")


def insert_analysis_results():
    print("\n[Analysis Results]")

    # Get first user for ownership
    user = User.query.first()
    if not user:
        print("  Warning: No users found, cannot insert analysis results")
        return

    # Get raw data for linking
    raw_data_map = {r.external_id: r.id for r in RawRedditData.query.all()}

    mock_results = [
        {
            "user_id": user.id,
            "raw_data_ids": ["abc123", "def456"],  # Links to multiple raw data items
            "stress_level": 0.85,
            "anxiety_level": 0.75,
            "sentiment": "negative",
            "keywords": [
                "burnout",
                "crunch",
                "exhaustion",
                "overwork",
                "on-call",
                "anxiety",
            ],
            "communities": ["r/programming", "r/sysadmin"],
            "summary": "Analysis shows high stress and anxiety levels related to workplace burnout and on-call responsibilities.",
            "post_count": 2,
            "model_version": "animus-v0.1",
        },
        {
            "user_id": user.id,
            "raw_data_ids": ["ghi789"],
            "stress_level": 0.10,
            "anxiety_level": 0.05,
            "sentiment": "positive",
            "keywords": ["automation", "CI/CD", "achievement", "proud"],
            "communities": ["r/devops"],
            "summary": "Positive sentiment around successful automation project completion.",
            "post_count": 1,
            "model_version": "animus-v0.1",
        },
        {
            "user_id": user.id,
            "raw_data_ids": ["jkl012", "comment_xyz789"],
            "stress_level": 0.75,
            "anxiety_level": 0.80,
            "sentiment": "negative",
            "keywords": ["rejection", "hopeless", "job search", "ghosted"],
            "communities": ["r/cscareerquestions"],
            "summary": "High anxiety levels related to job search difficulties and repeated rejection.",
            "post_count": 2,
            "model_version": "animus-v0.1",
        },
    ]

    for data in mock_results:
        result = AnalysisResult(
            user_id=data["user_id"],
            stress_level=data["stress_level"],
            anxiety_level=data["anxiety_level"],
            sentiment=data["sentiment"],
            keywords=data["keywords"],
            communities=data["communities"],
            summary=data["summary"],
            post_count=data["post_count"],
            model_version=data["model_version"],
        )
        db.session.add(result)
        db.session.flush()  # Get the ID

        # Link raw data to this analysis
        for raw_external_id in data.get("raw_data_ids", []):
            raw_data_id = raw_data_map.get(raw_external_id)
            if raw_data_id:
                raw_data = RawRedditData.query.get(raw_data_id)
                if raw_data:
                    raw_data.analysis_result_id = result.id

        print(
            f"  Added analysis result: {data['sentiment']} (linked to {len(data['raw_data_ids'])} items)"
        )

    db.session.commit()
    print(f"  Total analysis results: {AnalysisResult.query.count()}")


def insert_mock_data():
    with app.app_context():
        print("Inserting mock data...")
        insert_users()
        insert_raw_reddit_data()
        insert_analysis_results()
        print("\nAll mock data inserted successfully!")


if __name__ == "__main__":
    try:
        insert_mock_data()
    except Exception as e:
        print(f"Error inserting mock data: {e}")
        db.session.rollback()
        sys.exit(1)
