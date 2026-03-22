import sys
from datetime import datetime, timezone
from dotenv import load_dotenv

# Import the app, db, and models from the new structure
from infrastructure.app_factory import create_app
from infrastructure.db import db
from models.user import User
from models.analysis_result import AnalysisResult

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


def insert_analysis_results():
    print("\n[Analysis Results]")

    # Get first user for ownership
    user = User.query.first()
    if not user:
        print("  Warning: No users found, cannot insert analysis results")
        return

    mock_results = [
        {
            "user_id": user.id,
            "geographical_region": "México",
            "start_date": datetime(2026, 1, 1).date(),
            "end_date": datetime(2026, 1, 31).date(),
            "age_range": "25-35",
            "topics": ["programming", "tech"],
            "communities": ["r/programming", "r/sysadmin"],
            "stress_level": 0.85,
            "anxiety_level": 0.75,
            "sentiment": "negativo",
            "keywords": [
                "burnout",
                "crunch",
                "exhaustion",
                "overwork",
                "on-call",
                "anxiety",
            ],
            "summary": "Análisis muestra altos niveles de estrés y ansiedad relacionados al agotamiento laboral y responsabilidades de guardia.",
            "post_count": 15,
            "model_version": "gemini-3-flash-preview",
        },
        {
            "user_id": user.id,
            "geographical_region": "México",
            "start_date": datetime(2026, 2, 1).date(),
            "end_date": datetime(2026, 2, 28).date(),
            "age_range": "25-35",
            "topics": ["devops", "automation"],
            "communities": ["r/devops"],
            "stress_level": 0.10,
            "anxiety_level": 0.05,
            "sentiment": "positivo",
            "keywords": ["automation", "CI/CD", "achievement", "proud"],
            "summary": "Sentimiento positivo alrededor de la finalización exitosa del proyecto de automatización.",
            "post_count": 8,
            "model_version": "gemini-3-flash-preview",
        },
        {
            "user_id": user.id,
            "geographical_region": "México",
            "start_date": datetime(2026, 2, 1).date(),
            "end_date": datetime(2026, 2, 28).date(),
            "age_range": "22-28",
            "topics": ["career", "job search"],
            "communities": ["r/cscareerquestions"],
            "stress_level": 0.75,
            "anxiety_level": 0.80,
            "sentiment": "negativo",
            "keywords": ["rejection", "hopeless", "job search", "ghosted"],
            "summary": "Altos niveles de ansiedad relacionados a dificultades en la búsqueda de empleo y rechazos repetidos.",
            "post_count": 12,
            "model_version": "gemini-3-flash-preview",
        },
    ]

    for data in mock_results:
        result = AnalysisResult(
            user_id=data["user_id"],
            geographical_region=data["geographical_region"],
            start_date=data["start_date"],
            end_date=data["end_date"],
            age_range=data["age_range"],
            topics=data["topics"],
            communities=data["communities"],
            post_count=data["post_count"],
            sentiment=data["sentiment"],
            stress_level=data["stress_level"],
            anxiety_level=data["anxiety_level"],
            keywords=data["keywords"],
            summary=data["summary"],
            model_version=data["model_version"],
        )
        db.session.add(result)
        print(
            f"  Added analysis result: {data['sentiment']} ({data['post_count']} posts)"
        )

    db.session.commit()
    print(f"  Total analysis results: {AnalysisResult.query.count()}")


def insert_mock_data():
    with app.app_context():
        print("Inserting mock data...")
        insert_users()
        insert_analysis_results()
        print("\nAll mock data inserted successfully!")


if __name__ == "__main__":
    try:
        insert_mock_data()
    except Exception as e:
        print(f"Error inserting mock data: {e}")
        db.session.rollback()
        sys.exit(1)
