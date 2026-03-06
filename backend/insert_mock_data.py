"""
Mock data insertion script
Inserts sample data into the database for testing
"""
import os
import sys
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the app, db, and models from the new structure
from infrastructure.app_factory import create_app
from infrastructure.db import db
from models.user import User
from models.subreddit import Subreddit
from models.post import Post
from models.analysis_result import AnalysisResult

app = create_app()


def insert_users():
    print("\n[Users]")
    mock_users = [
        {'username': 'john_doe',      'email': 'john.doe@example.com',      'password': 'password123',  'fullname': 'Universidad Nacional Autónoma de México',      'country': 'México',        'region': 'Ciudad de México'},
        {'username': 'jane_smith',    'email': 'jane.smith@example.com',    'password': 'securepass456','fullname': 'Instituto Tecnológico y de Estudios Superiores de Monterrey', 'country': 'México', 'region': 'Nuevo León'},
        {'username': 'bob_wilson',    'email': 'bob.wilson@example.com',    'password': 'mypassword789','fullname': 'Universidad de Guadalajara',                   'country': 'México',        'region': 'Jalisco'},
        {'username': 'alice_brown',   'email': 'alice.brown@example.com',   'password': 'alicepass321', 'fullname': 'Universidad Autónoma de Nuevo León',           'country': 'México',        'region': 'Nuevo León'},
        {'username': 'charlie_davis', 'email': 'charlie.davis@example.com', 'password': 'charlie2024',  'fullname': 'Instituto Politécnico Nacional',               'country': 'México',        'region': 'Ciudad de México'},
    ]

    for user_data in mock_users:
        if User.query.filter_by(username=user_data['username']).first():
            print(f"  ⚠ User '{user_data['username']}' already exists, skipping...")
            continue
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            fullname=user_data['fullname'],
            country=user_data['country'],
            region=user_data['region'],
        )
        user.set_password(user_data['password'])
        db.session.add(user)
        print(f"  ✓ Added user: {user_data['username']}")

    db.session.commit()
    print(f"  Total users: {User.query.count()}")


def insert_subreddits():
    print("\n[Subreddits]")
    mock_subreddits = [
        {'name': 'r/programming',      'category': 'Software Development'},
        {'name': 'r/sysadmin',         'category': 'IT Operations'},
        {'name': 'r/devops',           'category': 'IT Operations'},
        {'name': 'r/cscareerquestions', 'category': 'Career & Workplace'},
        {'name': 'r/learnprogramming', 'category': 'Software Development'},
    ]

    for data in mock_subreddits:
        if Subreddit.query.filter_by(name=data['name']).first():
            print(f"  ⚠ Subreddit '{data['name']}' already exists, skipping...")
            continue
        subreddit = Subreddit(name=data['name'], category=data['category'], is_active=True)
        db.session.add(subreddit)
        print(f"  ✓ Added subreddit: {data['name']}")

    db.session.commit()
    print(f"  Total subreddits: {Subreddit.query.count()}")


def insert_posts():
    print("\n[Posts]")
    # Map subreddit names to their db IDs
    subreddit_map = {s.name: s.id for s in Subreddit.query.all()}

    mock_posts = [
        {
            'external_id': 'abc123',
            'subreddit': 'r/programming',
            'title': 'I burned out after 3 years of crunch time at my job',
            'content': 'I have been working 60+ hour weeks for years and I just cannot do it anymore. Anyone else been through this?',
            'author': 'tired_dev_42',
            'created_utc': datetime(2026, 1, 10, 14, 30, tzinfo=timezone.utc),
            'raw_json': {'score': 1520, 'num_comments': 312, 'upvote_ratio': 0.97},
        },
        {
            'external_id': 'def456',
            'subreddit': 'r/sysadmin',
            'title': 'On-call schedule is destroying my sleep and personal life',
            'content': 'Our team is understaffed and the on-call rotation is brutal. I am constantly anxious even on my days off.',
            'author': 'overworked_sre',
            'created_utc': datetime(2026, 1, 15, 9, 0, tzinfo=timezone.utc),
            'raw_json': {'score': 876, 'num_comments': 198, 'upvote_ratio': 0.95},
        },
        {
            'external_id': 'ghi789',
            'subreddit': 'r/devops',
            'title': 'Finally automated the deployment pipeline – feeling great!',
            'content': 'Spent two weeks building a full CI/CD pipeline and it went live today without a hitch. Super proud of this one.',
            'author': 'pipeline_wizard',
            'created_utc': datetime(2026, 2, 1, 11, 45, tzinfo=timezone.utc),
            'raw_json': {'score': 2300, 'num_comments': 145, 'upvote_ratio': 0.99},
        },
        {
            'external_id': 'jkl012',
            'subreddit': 'r/cscareerquestions',
            'title': 'Rejected from 50 jobs in a row – starting to lose hope',
            'content': 'I have been applying for 6 months and keep getting ghosted or rejected. I do not know what I am doing wrong.',
            'author': 'job_hunt_despair',
            'created_utc': datetime(2026, 2, 10, 16, 20, tzinfo=timezone.utc),
            'raw_json': {'score': 3100, 'num_comments': 520, 'upvote_ratio': 0.96},
        },
        {
            'external_id': 'mno345',
            'subreddit': 'r/learnprogramming',
            'title': 'Just solved my first LeetCode medium problem!',
            'content': 'Been struggling with algorithms for months. Finally cracked a medium problem on my own. Small win but it feels huge.',
            'author': 'newbie_coder99',
            'created_utc': datetime(2026, 2, 18, 8, 0, tzinfo=timezone.utc),
            'raw_json': {'score': 450, 'num_comments': 67, 'upvote_ratio': 0.98},
        },
    ]

    for data in mock_posts:
        if Post.query.filter_by(external_id=data['external_id']).first():
            print(f"  ⚠ Post '{data['external_id']}' already exists, skipping...")
            continue
        post = Post(
            external_id=data['external_id'],
            subreddit_id=subreddit_map.get(data['subreddit']),
            title=data['title'],
            content=data['content'],
            author=data['author'],
            created_utc=data['created_utc'],
            raw_json=data['raw_json'],
        )
        db.session.add(post)
        print(f"  ✓ Added post: {data['external_id']} – {data['title'][:50]}")

    db.session.commit()
    print(f"  Total posts: {Post.query.count()}")


def insert_analysis_results():
    print("\n[Analysis Results]")
    post_map = {p.external_id: p.id for p in Post.query.all()}

    mock_results = [
        {
            'post_external_id': 'abc123',
            'stress_level': 0.85,
            'anxiety_level': 0.72,
            'sentiment': 'Negative',
            'keywords': ['burnout', 'crunch', 'exhaustion', 'overwork'],
            'model_version': 'animus-v0.1',
        },
        {
            'post_external_id': 'def456',
            'stress_level': 0.90,
            'anxiety_level': 0.88,
            'sentiment': 'Negative',
            'keywords': ['on-call', 'anxiety', 'sleep deprivation', 'understaffed'],
            'model_version': 'animus-v0.1',
        },
        {
            'post_external_id': 'ghi789',
            'stress_level': 0.10,
            'anxiety_level': 0.05,
            'sentiment': 'Positive',
            'keywords': ['automation', 'CI/CD', 'achievement', 'proud'],
            'model_version': 'animus-v0.1',
        },
        {
            'post_external_id': 'jkl012',
            'stress_level': 0.78,
            'anxiety_level': 0.82,
            'sentiment': 'Negative',
            'keywords': ['rejection', 'hopeless', 'job search', 'ghosted'],
            'model_version': 'animus-v0.1',
        },
        {
            'post_external_id': 'mno345',
            'stress_level': 0.15,
            'anxiety_level': 0.10,
            'sentiment': 'Positive',
            'keywords': ['achievement', 'progress', 'learning', 'motivation'],
            'model_version': 'animus-v0.1',
        },
    ]

    for data in mock_results:
        post_id = post_map.get(data['post_external_id'])
        if not post_id:
            print(f"  ⚠ Post '{data['post_external_id']}' not found, skipping analysis...")
            continue
        if AnalysisResult.query.filter_by(post_id=post_id).first():
            print(f"  ⚠ Analysis for post '{data['post_external_id']}' already exists, skipping...")
            continue
        result = AnalysisResult(
            post_id=post_id,
            stress_level=data['stress_level'],
            anxiety_level=data['anxiety_level'],
            sentiment=data['sentiment'],
            keywords=data['keywords'],
            model_version=data['model_version'],
        )
        db.session.add(result)
        print(f"  ✓ Added analysis for post: {data['post_external_id']} ({data['sentiment']})")

    db.session.commit()
    print(f"  Total analysis results: {AnalysisResult.query.count()}")


def insert_mock_data():
    with app.app_context():
        print("Inserting mock data...")
        insert_users()
        insert_subreddits()
        insert_posts()
        insert_analysis_results()
        print("\n✓ All mock data inserted successfully!")


if __name__ == '__main__':
    try:
        insert_mock_data()
    except Exception as e:
        print(f"✗ Error inserting mock data: {e}")
        db.session.rollback()
        sys.exit(1)
