# Animus Backend API

A REST API built with Flask and PostgreSQL for user account management.

## Features

- **User Registration**: Create new user accounts
- **User Login**: Authenticate existing users
- **Account Deletion**: Delete user accounts

## Prerequisites

- Python 3.8+
- Docker and Docker Compose
- pip (Python package manager)

## Architecture Overview

This backend follows a lightweight MVC architecture:

- **Models**: SQLAlchemy models that represent database tables and encapsulate data rules.
- **Controllers**: Request handlers with business logic; they validate input, call models, and shape responses.
- **Routes**: Flask blueprints that bind HTTP endpoints to controllers.
- **Infrastructure**: App factory, configuration, and shared services (database setup).
- **Schemas**: Small serialization helpers for consistent API responses.
- **Middlewares**: Reserved for cross-cutting concerns (logging, auth, rate limiting).

The app is created through an application factory to make initialization consistent for both runtime and scripts.

## Setup Instructions

These steps assume a fresh clone of the repository.

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd animus/backend
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv
```

Windows (PowerShell):

```bash
./.venv/Scripts/Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

### 3. Start PostgreSQL Database

Start the PostgreSQL container using Docker Compose:

```bash
docker-compose up -d
```

This will start PostgreSQL on port 5432 with the following credentials:
- **Database**: animus_db
- **User**: animus_user
- **Password**: animus_password

### 4. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 5. Initialize Database Tables

Run the initialization script to create the database tables:

```bash
python init_db.py
```

### 6. Insert Mock Data (Optional)

Insert sample users for testing:

```bash
python insert_mock_data.py
```

This will create 5 test users with the following credentials:
- john_doe / password123
- jane_smith / securepass456
- bob_wilson / mypassword789
- alice_brown / alicepass321
- charlie_davis / charlie2024

### 7. Start the API Server

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### GET /
Get API information and available endpoints

**Response:**
```json
{
  "message": "Welcome to Animus API",
  "version": "1.0.0",
  "endpoints": {
    "POST /api/register": "Create a new account",
    "POST /api/login": "Login to an existing account",
    "DELETE /api/account/<user_id>": "Delete an account"
  }
}
```

### POST /api/register
Create a new user account

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "securepassword"
}
```

**Success Response (201):**
```json
{
  "message": "Account created successfully",
  "user": {
    "id": 1,
    "username": "newuser",
    "email": "newuser@example.com",
    "created_at": "2026-02-16T12:00:00"
  }
}
```

**Error Responses:**
- 400: Missing required fields
- 409: Username or email already exists

### POST /api/login
Login to an existing account

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john.doe@example.com",
    "created_at": "2026-02-16T12:00:00"
  }
}
```

**Error Responses:**
- 400: Missing required fields
- 401: Invalid username or password

### DELETE /api/account/<user_id>
Delete a user account

**Success Response (200):**
```json
{
  "message": "Account for user \"john_doe\" deleted successfully"
}
```

**Error Responses:**
- 404: User not found

## Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

### Login:
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"password\":\"test123\"}"
```

### Delete account:
```bash
curl -X DELETE http://localhost:5000/api/account/1
```

## Environment Variables

Edit the `.env` file to configure the application:

```
DATABASE_URL=postgresql://animus_user:animus_password@localhost:5432/animus_db
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-this-in-production
```

## Stopping the Database

To stop the PostgreSQL container:

```bash
docker-compose down
```

To stop and remove all data:

```bash
docker-compose down -v
```

## Project Structure

```
backend/
├── app.py                 # App entry point
├── controllers/          # Route handlers
├── infrastructure/       # Config and database setup
├── middlewares/          # Request/response middleware
├── models/               # Database models
├── routes/               # Blueprint routes
├── schemas/              # Response/request schemas
├── init_db.py            # Database initialization script
├── insert_mock_data.py   # Mock data insertion script
├── docker-compose.yml    # Docker Compose configuration
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables
└── README.md            # This file
```

## Security Notes

- Passwords are hashed using Werkzeug's security functions
- Never commit the `.env` file with production credentials
- Change the `SECRET_KEY` in production
- Consider adding JWT tokens for authentication in production
- Add rate limiting for API endpoints in production
