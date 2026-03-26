# Animus Backend

Flask REST API for the Animus mental health analytics platform.

---

## Prerequisites

- **Python 3.10+**
- **Docker Desktop** (for PostgreSQL)
- **pip** (Python package manager)

---

## Setup Instructions

### 1. Start the PostgreSQL Database

Navigate to the backend directory and start the PostgreSQL container:

```bash
cd backend
docker-compose up -d
```

This starts a PostgreSQL 15 container on port `5432` with the following default credentials:
- **Database**: `animus_db`
- **User**: `admin`
- **Password**: `Eva01`

To verify the container is running:

```bash
docker ps
```

### 2. Create and Activate a Virtual Environment

**Windows (PowerShell):**
```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```bash
python -m venv .venv
.venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
python -m venv .venv
source .venv/bin/activate
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend/` directory with the following content:

```env
DATABASE_URL=postgresql://admin:Eva01@localhost:5432/animus_db
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-this-in-production
```

**Note**: The `.env` file is git-ignored. Never commit credentials to version control.

### 5. Initialize the Database

Run the database initialization script to create all tables:

```bash
python init_db.py
```

This creates the following tables:
- `users` - User accounts
- `analysis_results` - Mental health analysis results and parameters

### 6. (Optional) Insert Mock Data

To populate the database with test data for development:

```bash
python insert_mock_data.py
```

This script creates sample users and analysis results for testing.

### 7. Start the Development Server

```bash
python app.py
```

The API will be available at `http://localhost:5000`

### 8. Verify the API is Running

Open your browser or use curl to test:

```bash
curl http://localhost:5000
```

You should receive a JSON response with API information and available endpoints.

---

## Environment Variables Reference

| Variable       | Description                                    | Default Value                                       |
|----------------|------------------------------------------------|-----------------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string                   | `postgresql://admin:Eva01@localhost:5432/animus_db` |
| `FLASK_ENV`    | Flask environment (development/production)     | `development`                                       |
| `SECRET_KEY`   | Secret key for JWT token signing               | `dev-secret-key`                                    |

---

## Development Scripts

| Script                | Description                                  |
|-----------------------|----------------------------------------------|
| `python app.py`       | Start the Flask development server           |
| `python init_db.py`   | Initialize/reset all database tables         |
| `python insert_mock_data.py` | Insert sample data for testing      |

---

## Database Management

### Stopping the Database

To stop the PostgreSQL container:

```bash
docker-compose down
```

### Removing All Data

To stop the container and delete all data:

```bash
docker-compose down -v
```

**Warning**: This will permanently delete all data in the database.

### Accessing the Database

You can connect to the PostgreSQL database using any PostgreSQL client:

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `animus_db`
- **Username**: `admin`
- **Password**: `Eva01`

Example using `psql`:

```bash
psql -h localhost -p 5432 -U admin -d animus_db
```

---

## Testing the API

### Register a New User

```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "country": "USA",
    "region": "California"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

Save the `access_token` from the response to use in authenticated requests.

### Make an Authenticated Request

```bash
curl -X GET http://localhost:5000/api/analysis \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## Troubleshooting

### PostgreSQL Connection Error

If you see database connection errors:

1. Verify Docker is running: `docker ps`
2. Check if PostgreSQL container is running: `docker-compose ps`
3. Verify credentials in `.env` match `docker-compose.yml`
4. Restart the container: `docker-compose restart`

### Port Already in Use

If port 5000 is already in use, you can change it in `app.py`:

```python
app.run(host="0.0.0.0", port=5001, debug=True)
```

### Module Not Found Error

Make sure your virtual environment is activated and all dependencies are installed:

```bash
pip install -r requirements.txt
```

---

## Project Structure

```
backend/
├── app.py                      # Application entry point
├── init_db.py                  # Database initialization script
├── insert_mock_data.py         # Mock data script
├── requirements.txt            # Python dependencies
├── docker-compose.yml          # PostgreSQL container config
├── .env                        # Environment variables (git-ignored)
├── controllers/                # Request handlers
├── infrastructure/             # App factory, config, database
├── middlewares/                # JWT authentication
├── models/                     # Database models
├── routes/                     # API blueprints
├── schemas/                    # Serialization schemas
└── services/                   # Business logic (scraping, AI analysis)
    └── yars/                   # Reddit scraping engine
```

---

## API Endpoints

For complete API documentation, see the [main README](../README.md#api-documentation).

---

## Security Notes

- Passwords are hashed using Werkzeug's `generate_password_hash`
- JWT tokens are used for authentication
- Never commit the `.env` file with production credentials
- Change `SECRET_KEY` in production
- Consider adding rate limiting for production deployments

---

## Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PyJWT Documentation](https://pyjwt.readthedocs.io/)
