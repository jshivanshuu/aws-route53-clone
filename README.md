# Route 53 Clone

A deployable full-stack DNS management console inspired by Amazon Route 53. It includes authenticated hosted-zone management, DNS record CRUD, persistent storage, API documentation, and a responsive dark console UI.

## Stack

- Frontend: Next.js + TypeScript
- Backend: FastAPI + SQLAlchemy
- Database: SQLite locally; set `DATABASE_URL` to PostgreSQL for durable production storage
- Authentication: signed JWT bearer tokens

## Run locally

Start the API in one terminal:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

Start the web app in another:

```powershell
cd frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

Use Node.js 20.9 or later for the frontend.

Open `http://localhost:3000`; use any email and a password of at least six characters. The demo sign-in endpoint creates a local account when it does not exist. Interactive API documentation is at `http://localhost:8000/docs`.

## Architecture

```text
Next.js browser console
        │  JSON over HTTP + JWT bearer token
        ▼
FastAPI API
  ├── Authentication router
  ├── Hosted zones router
  └── DNS records router
        │  SQLAlchemy ORM
        ▼
SQLite database (backend/route53.db)
```

The frontend keeps the signed-in user and JWT in browser local storage. Every protected request includes that token; the API scopes hosted zones and DNS records to the authenticated user. SQLite is the default local datastore, so zones and records survive server restarts.

## Database schema

```text
users
  id (PK) · email (unique) · password_hash · created_at
    └── hosted_zones
          id (PK) · owner_id (FK users.id) · domain_name
          description · is_private · created_at
            └── dns_records
                  id (PK) · hosted_zone_id (FK hosted_zones.id)
                  name · type · value · ttl · description · created_at
```

Deleting a hosted zone cascades to its DNS records. Each user can access only their own zones and the records within those zones.

## API

All hosted-zone and record endpoints require `Authorization: Bearer <token>`.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth/register` | Create an account |
| `POST /api/auth/login` | Sign in with an existing account |
| `POST /api/auth/login-demo` | Sign in/create a demo account |
| `GET /api/auth/me` | Current user |
| `GET, POST /api/hosted-zones` | List/create zones |
| `GET, PUT, DELETE /api/hosted-zones/{id}` | Read/update/delete a zone |
| `GET, POST /api/dns-records/zone/{id}` | List/create records |
| `PUT, DELETE /api/dns-records/record/{id}` | Update/delete a record |

Supported record types: A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, and CAA.

## Deploy

The `backend/Dockerfile` is ready for Render, Railway, Fly.io, or any Docker host. Set:

```text
SECRET_KEY=<long-random-secret>
DATABASE_URL=<managed-postgresql-connection-url>
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

For the frontend, import the `frontend` directory into Vercel and set:

```text
NEXT_PUBLIC_API_URL=https://your-api-domain
```

Deploy the backend first, then configure the frontend URL in `CORS_ORIGINS`. For production, use a managed PostgreSQL instance—the local SQLite file is suitable for development only and ephemeral service disks may not preserve it.

## Project layout

```text
backend/app/       FastAPI app, models, schemas, routers, authentication
frontend/pages/    Login, dashboard, hosted-zone list and zone detail views
frontend/components/ Reusable layout, tables and forms
```

## Route 53 workflows included

- Mocked sign-in, sign-out, and persisted browser session
- Hosted-zone create, view, search, filter, edit, delete, and pagination
- DNS-record create, view, search, type filtering, edit, delete, and pagination
- A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, and CAA record validation
- Mocked Traffic Policies, Health Checks, Resolver, and Profiles navigation pages
