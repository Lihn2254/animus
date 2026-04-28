# Animus

**Animus** is a mental health demographics analyzer that collects and processes Reddit posts from technology and computer science communities to track mental health indicators such as stress levels, anxiety, sentiment, and trending topics. It provides valuable insights for research, education, and public policy decision-making.

---

## Table of Contents

- [Overview](#overview)
- [Project Architecture](#project-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)

---

## Overview

Animus extracts posts from Reddit communities related to software development, IT operations, and career topics. The platform enables users to:

- Scrape Reddit posts from specific subreddits, search queries, or user profiles
- Analyze mental health indicators from collected data using AI
- Store and retrieve historical analysis results
- Visualize trends through an interactive web dashboard

Each analysis generates metrics including:
- **Stress Level** (normalized score 0–1)
- **Anxiety Level** (normalized score 0–1)
- **Sentiment** (positive / negative / neutral)
- **Keywords** extracted from post content
- **Summary** of analyzed data

---

## Project Architecture

Animus follows a modern full-stack architecture with a clear separation between frontend and backend:

### Backend Architecture
The Flask backend uses a layered architecture pattern:

```
Client Request → Routes (Blueprint) → Middleware (JWT Auth) → Controllers → Services → Models → Database
```

- **Routes**: Flask blueprints that map HTTP endpoints to controllers
- **Middlewares**: JWT authentication and request/response processing
- **Controllers**: Handle request validation, business logic coordination, and response formatting
- **Services**: Business logic layer including:
  - `scraping_service.py` - YARS wrapper for Reddit data collection
  - `ai_analysis_service.py` - Google Gemini AI integration for mental health analysis
  - `yars/` - Embedded Reddit scraping engine (no API credentials required)
- **Models**: SQLAlchemy ORM models mapping to PostgreSQL tables
- **Infrastructure**: Application factory, configuration, and database setup

### Frontend Architecture
The Next.js frontend uses React Server Components and App Router:

```
├── (auth)/          - Authentication pages (login, signup)
├── (main)/          - Protected dashboard pages
├── components/      - Reusable UI components
├── context/         - React Context for auth state management
├── services/        - API client functions
├── lib/             - Utilities (fetchWithAuth)
└── types/           - TypeScript type definitions
```

---

## Technology Stack

| Layer          | Technology                                      |
|----------------|-------------------------------------------------|
| Backend        | Python 3.10+, Flask 3.1, Flask-SQLAlchemy       |
| Database       | PostgreSQL 15 (via Docker Compose)              |
| ORM            | SQLAlchemy 2.0                                  |
| Authentication | JWT (PyJWT)                                     |
| AI Analysis    | Google Gemini AI (google-genai)                 |
| Reddit Scraping| YARS (embedded engine, no API keys required)    |
| Frontend       | Next.js 16, React 19, TypeScript 5              |
| Styling        | Tailwind CSS v4                                 |
| Forms          | react-hook-form + Zod validation                |
| Icons          | react-icons                                     |
| Containerization | Docker, Docker Compose                        |

---

## Project Structure

```
animus/
├── backend/
│   ├── app.py                      # Application entry point
│   ├── init_db.py                  # Database initialization script
│   ├── insert_mock_data.py         # Mock data insertion script
│   ├── requirements.txt            # Python dependencies
│   ├── docker-compose.yml          # PostgreSQL container definition
│   ├── controllers/                # Request handlers and business logic
│   │   ├── account_controller.py   # User account management
│   │   ├── analysis_controller.py  # Analysis retrieval and execution
│   │   ├── auth_controller.py      # Login and registration
│   │   ├── home_controller.py      # API info endpoint
│   │   └── scraping_controller.py  # Reddit scraping operations
│   ├── infrastructure/             # App factory, config, and DB setup
│   │   ├── app_factory.py          # Flask application factory
│   │   ├── config.py               # Environment configuration
│   │   └── db.py                   # SQLAlchemy instance
│   ├── middlewares/                # Request/response middleware
│   │   └── jwt_required.py         # JWT authentication decorator
│   ├── models/                     # SQLAlchemy ORM models
│   │   ├── analysis_result.py      # Analysis results and parameters
│   │   └── user.py                 # User accounts
│   ├── routes/                     # Flask blueprints
│   │   ├── account_routes.py       # /api/account/* endpoints
│   │   ├── analysis_routes.py      # /api/analysis/* endpoints
│   │   ├── auth_routes.py          # /api/register, /api/login
│   │   ├── home_routes.py          # / endpoint
│   │   └── scraping_routes.py      # /api/scrape/* endpoints
│   ├── schemas/                    # Response/request schemas
│   │   └── user_schema.py
│   └── services/                   # Business logic services
│       ├── ai_analysis_service.py  # Google Gemini AI integration
│       ├── scraping_service.py     # YARS wrapper and DB persistence
│       └── yars/                   # Embedded Reddit scraping engine
│           ├── agents.py
│           ├── sessions.py
│           └── yars.py
│
└── frontend/
    ├── next.config.ts              # Next.js configuration
    ├── package.json                # Node.js dependencies
    ├── tsconfig.json               # TypeScript configuration
    └── src/
        └── app/
            ├── globals.css         # Global styles
            ├── api.ts              # API base URL configuration
            ├── (auth)/             # Authentication pages
            │   ├── layout.tsx      # Auth layout wrapper
            │   ├── login/          # Login page
            │   └── signup/         # Registration page
            ├── (main)/             # Protected application pages
            │   ├── layout.tsx      # Main layout with header/footer
            │   ├── page.tsx        # Dashboard/home page
            │   ├── reports/        # Analysis results page
            │   └── settings/       # User settings page
            ├── components/         # Reusable UI components
            │   ├── Footer.tsx
            │   ├── Header.tsx
            │   └── RequireAuth.tsx # Auth guard component
            ├── context/            # React Context providers
            │   └── AuthContext.tsx # Authentication state management
            ├── lib/                # Utility functions
            │   └── fetchWithAuth.ts # Authenticated fetch wrapper
            ├── services/           # API client functions
            │   ├── analysis.ts     # Analysis API calls
            │   ├── auth.ts         # Authentication API calls
            │   └── userAccount.ts  # Account management API calls
            └── types/              # TypeScript type definitions
                ├── analysis.ts
                └── user.ts
```

---

## Key Features

### User Management
- Secure user registration and authentication with JWT tokens
- Account management (update profile, change password, delete account)
- User profile includes fullname, username, email, country, and region

### Reddit Data Collection
- **Subreddit Scraping**: Fetch posts from specific subreddits (hot/top/new)
- **Reddit Search**: Search across all of Reddit or within specific communities
- **User Profile Analysis**: Retrieve and analyze a Reddit user's post/comment history
- Built-in YARS scraping engine requires no Reddit API credentials

### AI-Powered Analysis
- Mental health analysis using Google Gemini AI
- Generates stress levels, anxiety levels, sentiment, keywords, and summaries
- Configurable analysis parameters (region, date range, age range, topics, communities)
- Historical analysis storage and retrieval

### Interactive Dashboard
- View past analysis results
- Filter and search through historical data
- User-friendly forms with validation

---

## Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 20+**
- **Docker Desktop** (for PostgreSQL)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd animus
   ```

2. **Set up the backend**

   See [backend/README.md](backend/README.md) for detailed setup instructions.

3. **Set up the frontend**

   See [frontend/README.md](frontend/README.md) for detailed setup instructions.

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint                  | Description                                    | Auth Required |
|--------|---------------------------|------------------------------------------------|---------------|
| POST   | `/api/register`           | Create a new user account                      | No            |
| POST   | `/api/login`              | Authenticate and receive JWT token             | No            |

### Account Management

| Method | Endpoint                  | Description                                    | Auth Required |
|--------|---------------------------|------------------------------------------------|---------------|
| PUT    | `/api/account/<user_id>`  | Update user profile (name, email, password)    | Yes           |
| DELETE | `/api/account/<user_id>`  | Delete user account                            | Yes           |

### Reddit Scraping

| Method | Endpoint                        | Description                                  | Auth Required |
|--------|---------------------------------|----------------------------------------------|---------------|
| POST   | `/api/scrape/subreddit/<name>`  | Scrape posts from a subreddit                | Yes           |
| POST   | `/api/scrape/search`            | Search Reddit posts                          | Yes           |
| POST   | `/api/scrape/user`              | Fetch a Reddit user's posts/comments         | Yes           |
| POST   | `/api/scrape/analyze/user`      | AI analysis of a Reddit user's profile       | Yes           |

### Analysis

| Method | Endpoint              | Description                                        | Auth Required |
|--------|-----------------------|----------------------------------------------------|---------------|
| GET    | `/api/analysis`       | Retrieve user's historical analysis results        | Yes           |
| POST   | `/api/analysis/run`   | Execute new mental health analysis                 | Yes           |

---

## Contributing

For setup instructions specific to backend or frontend development, please refer to:
- [Backend Setup Guide](backend/README.md)
- [Frontend Setup Guide](frontend/README.md)

---

## License

This project is for educational and research purposes.

