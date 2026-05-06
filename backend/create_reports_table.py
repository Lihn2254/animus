from dotenv import load_dotenv
from infrastructure.app_factory import create_app
from infrastructure.db import db
from sqlalchemy import inspect

load_dotenv()

app = create_app()

def create_reports_table():
    with app.app_context():
        print("Creating missing tables (non-destructive)...")
        # create_all is idempotent and will only create missing tables
        db.create_all()
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print("Current tables:", tables)

if __name__ == '__main__':
    try:
        create_reports_table()
        print("Done.")
    except Exception as e:
        print("Error creating tables:", e)
        raise
