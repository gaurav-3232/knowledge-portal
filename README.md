# Knowledge Portal

A full-stack knowledge management application with JWT authentication, document CRUD, and full-text search.

**Stack:** Flask · SQLAlchemy · MySQL · React · Vite · Docker

---

## Quick Start (Docker Compose)

```bash
cp .env.example .env        # edit passwords/secrets as needed
docker compose up --build
```

| Service  | URL                              |
|----------|----------------------------------|
| Frontend | http://localhost:5173             |
| Backend  | http://localhost:5000/api/health  |
| MySQL    | localhost:3307 (host-side)        |

Default login: **admin / admin123** (seeded automatically on first run).

---

## Local Development (Without Docker)

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0 running locally

### Backend

```bash
cd backend
cp .env.example .env          # edit DB_* values for your local MySQL
pip install -r requirements.txt
python app.py
```

Runs at http://localhost:5000

### Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

Runs at http://localhost:5173

---

## Project Structure

```
knowledge-portal/
├── backend/
│   ├── app.py                # Flask app, routes, JWT auth
│   ├── db.py                 # SQLAlchemy engine, session, retry logic
│   ├── models.py             # User, Document, Attachment models
│   ├── gunicorn.conf.py      # Production WSGI config
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api.js            # Axios instance with JWT interceptor
│   │   └── pages/
│   │       ├── Login.jsx
│   │       └── Documents.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## API Endpoints

| Method | Path                   | Auth   | Description          |
|--------|------------------------|--------|----------------------|
| GET    | /api/health            | —      | Health check         |
| POST   | /api/login             | —      | Login → JWT          |
| GET    | /api/users/me          | Bearer | Current user info    |
| GET    | /api/users             | Admin  | List users           |
| POST   | /api/users             | Admin  | Create user          |
| PATCH  | /api/users/:id         | Admin  | Update user          |
| DELETE | /api/users/:id         | Admin  | Delete user          |
| GET    | /api/docs              | Bearer | List documents       |
| POST   | /api/docs              | Bearer | Create document      |
| GET    | /api/search?q=keyword  | Bearer | Full-text search     |

---

## Environment Variables

### Root `.env` (Docker Compose)

| Variable             | Default      | Description       |
|----------------------|--------------|-------------------|
| MYSQL_ROOT_PASSWORD  | rootpass     | MySQL root pw     |
| MYSQL_DATABASE       | knowledge_portal | DB name       |
| MYSQL_USER           | kp_user      | DB user           |
| MYSQL_PASSWORD       | kp_password  | DB password       |
| JWT_SECRET           | supersecret… | JWT signing key   |

### Backend `.env`

| Variable    | Default                    |
|-------------|----------------------------|
| DB_HOST     | 127.0.0.1                  |
| DB_PORT     | 3306                       |
| DB_NAME     | knowledge_portal           |
| DB_USER     | kp_user                    |
| DB_PASSWORD | kp_password                |
| JWT_SECRET  | supersecretkey-change-…    |
| PORT        | 5000                       |

### Frontend `.env`

| Variable     | Default                |
|--------------|------------------------|
| VITE_API_URL | http://localhost:5000  |

---

## Deployment

### Docker Compose (Production)

1. Set strong secrets in `.env`
2. `docker compose up --build -d`
3. Backend runs via Gunicorn (2 workers, 4 threads)
4. MySQL data persists in `kp_mysql_data` volume

### Render / Railway

- **Backend**: Deploy `backend/` as Docker service. Set DB + JWT env vars. Gunicorn starts automatically.
- **Frontend**: Deploy `frontend/`. Build: `npm run build`, output: `dist/`. Set `VITE_API_URL` to backend URL.

### VPS / AWS / DigitalOcean

1. Install Docker + Docker Compose
2. Clone repo → `cp .env.example .env` → edit secrets
3. `docker compose up --build -d`
4. Add reverse proxy (Nginx/Caddy) for HTTPS

---

## Default Credentials

On first startup with an empty database, a default admin is created:

- **Username:** admin
- **Password:** admin123

Change this immediately in production.
