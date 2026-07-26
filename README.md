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
