# Knowledge Portal

A full-stack knowledge management platform with JWT authentication, role-based access control, document CRUD, full-text search, and an admin dashboard.

**Stack:** Flask · SQLAlchemy · MySQL 8 · React · Vite · Tailwind CSS · Docker · AWS EC2

---

## Architecture

```
                        ┌─────────────────────────────────────────────┐
                        │            AWS EC2 (t3.micro)               │
                        │         Docker Compose Orchestration        │
                        │                                             │
  Browser ──────────▶   │  ┌───────────┐    ┌────────────┐            │
  (Port 5174)           │  │ Frontend  │    │  Backend   │            │
                        │  │ React     │───▶│  Flask     │            │
                        │  │ Vite      │    │  Gunicorn  │            │
                        │  │ Tailwind  │    │  JWT Auth  │            │
                        │  └───────────┘    └─────┬──────┘            │
                        │                         │                   │
                        │                   ┌─────▼──────┐            │
                        │                   │  MySQL 8.0 │            │
                        │                   │  FULLTEXT   │            │
                        │                   │  Indexing   │            │
                        │                   └────────────┘            │
                        └─────────────────────────────────────────────┘
```

---

## Features

- **JWT Authentication** — Login with access tokens, auto-logout on 401
- **Role-Based Access Control** — Admin and User roles with protected routes
- **Admin Dashboard** — Create, update, delete users; promote/demote roles with last-admin safeguards
- **Document Management** — Create and list knowledge documents with role tagging
- **Full-Text Search** — MySQL FULLTEXT indexing with boolean mode search across titles and body content
- **Glassmorphism UI** — Modern Tailwind CSS design with glass-morphism effects
- **Dockerized** — One-command deployment with Docker Compose (MySQL + Flask + React)
- **Production-Ready Backend** — Gunicorn WSGI server with multi-worker configuration

---

## Quick Start (Docker Compose)

```bash
git clone https://github.com/gaurav-3232/knowledge-portal.git
cd knowledge-portal
cp .env.example .env        # edit passwords/secrets
docker compose up --build -d
```

| Service  | URL                              |
|----------|----------------------------------|
| Frontend | http://localhost:5174             |
| Backend  | http://localhost:5001/api/health  |
| MySQL    | localhost:3307 (host-side)        |

Default login: **admin / admin123** (seeded on first run — change in production).

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
python app.py                 # runs at http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:5000
npm install
npm run dev                   # runs at http://localhost:5173
```

---

## Project Structure

```
knowledge-portal/
├── backend/
│   ├── app.py                # Flask app — routes, JWT auth, RBAC
│   ├── db.py                 # SQLAlchemy engine, session, retry logic
│   ├── models.py             # User, Document, Attachment models
│   ├── gunicorn.conf.py      # Production WSGI config (2 workers, 4 threads)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── uploads/              # File upload directory
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main app with routing
│   │   ├── api.js            # Axios instance with JWT interceptor
│   │   ├── pages/
│   │   │   ├── Login.jsx     # Authentication page
│   │   │   ├── Documents.jsx # Document CRUD interface
│   │   │   ├── SearchPage.jsx # Full-text search UI
│   │   │   └── AdminUsers.jsx # User management dashboard
│   │   ├── components/
│   │   │   ├── Sidebar.jsx   # Navigation sidebar
│   │   │   └── Toast.jsx     # Notification component
│   │   └── hooks/
│   │       └── useAuth.jsx   # Authentication hook
│   ├── tailwind.config.js    # Custom Tailwind theme
│   ├── vite.config.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## API Endpoints

| Method   | Path                  | Auth   | Description              |
|----------|-----------------------|--------|--------------------------|
| `GET`    | `/api/health`         | —      | Health check             |
| `POST`   | `/api/login`          | —      | Login → JWT token        |
| `GET`    | `/api/users/me`       | Bearer | Current user info        |
| `GET`    | `/api/users`          | Admin  | List all users           |
| `POST`   | `/api/users`          | Admin  | Create new user          |
| `PATCH`  | `/api/users/:id`      | Admin  | Update user role/password|
| `DELETE` | `/api/users/:id`      | Admin  | Delete user              |
| `GET`    | `/api/docs`           | Bearer | List documents           |
| `POST`   | `/api/docs`           | Bearer | Create document          |
| `GET`    | `/api/search?q=`      | Bearer | Full-text search         |

---

## Environment Variables

### Root `.env` (Docker Compose)

| Variable             | Default              | Description           |
|----------------------|----------------------|-----------------------|
| `MYSQL_ROOT_PASSWORD`| `rootpass`           | MySQL root password   |
| `MYSQL_DATABASE`     | `knowledge_portal`   | Database name         |
| `MYSQL_USER`         | `kp_user`            | Database user         |
| `MYSQL_PASSWORD`     | `kp_password`        | Database password     |
| `JWT_SECRET`         | `supersecretkey-...` | JWT signing key       |

### Backend `.env`

| Variable      | Default                 |
|---------------|-------------------------|
| `DB_HOST`     | `127.0.0.1`             |
| `DB_PORT`     | `3306`                  |
| `DB_NAME`     | `knowledge_portal`      |
| `DB_USER`     | `kp_user`               |
| `DB_PASSWORD` | `kp_password`           |
| `JWT_SECRET`  | `change-me`             |

### Frontend `.env`

| Variable       | Default                 |
|----------------|-------------------------|
| `VITE_API_URL` | `http://localhost:5000`  |

---

## Deployment

### AWS EC2 (Current Setup)

This project is deployed on **AWS EC2** in `eu-north-1` (Stockholm) using Docker Compose on a `t3.micro` instance.

**Infrastructure:**
- EC2 instance with Amazon Linux 2023
- Security group with ports 22 (SSH), 80, 443, 5001 (API), 5174 (frontend)
- 20 GB gp3 EBS volume
- Docker Compose orchestrating 3 containers

**Deploy steps:**

```bash
# SSH into EC2
ssh -i ~/.ssh/your-key.pem ec2-user@<PUBLIC-IP>

# Clone and configure
git clone https://github.com/gaurav-3232/knowledge-portal.git
cd knowledge-portal
cp .env.example .env          # set strong passwords + JWT secret

# Update frontend API URL
# In docker-compose.yml, set VITE_API_URL to http://<PUBLIC-IP>:5001

# Launch
docker compose up --build -d

# Verify
docker compose ps
curl http://localhost:5001/api/health
```

### Docker Compose (Any Server)

```bash
cp .env.example .env          # set strong secrets
docker compose up --build -d
```

- Backend runs via Gunicorn (2 workers, 4 threads)
- MySQL data persists in `kp_mysql_data` Docker volume

### Production Hardening

- Add Nginx reverse proxy with SSL (Let's Encrypt)
- Build frontend as static assets (`npm run build`) and serve via Nginx
- Store secrets in AWS Secrets Manager or Parameter Store
- Set up automated EBS snapshots or MySQL backups to S3

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Axios             |
| Backend   | Flask, SQLAlchemy, Gunicorn, PyJWT, Passlib      |
| Database  | MySQL 8.0 with FULLTEXT indexing                 |
| DevOps    | Docker, Docker Compose, AWS EC2, GitHub          |

---

## License

MIT
