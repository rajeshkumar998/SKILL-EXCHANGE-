# Skill Exchange Platform — Mini Project

A full-stack web app where users list skills they can teach ("offer") and skills
they want to learn ("want"), browse other members, and send/accept skill-swap
requests.

## Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (no framework, no build step)
- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`) — a single file, no separate DB server needed
- **Auth:** JWT (JSON Web Tokens) + bcrypt password hashing

## Folder Structure
```
skill-exchange-platform/
├── backend/
│   ├── server.js            # Express app entry point (also serves the frontend)
│   ├── db.js                 # SQLite connection + schema (auto-creates tables)
│   ├── middleware/auth.js    # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js           # register / login / me
│   │   ├── skills.js         # add / edit / delete / browse skills
│   │   ├── users.js          # public profile
│   │   └── requests.js       # send / accept / reject exchange requests
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html            # landing page
    ├── register.html / login.html
    ├── dashboard.html        # manage your own skills
    ├── browse.html           # search/browse everyone else's skills, send requests
    ├── requests.html         # received / sent requests, accept or reject
    ├── profile.html           # public profile page
    ├── css/style.css
    └── js/api.js              # shared fetch helper + navbar + session handling
```

## Database Schema

**users** — id, name, email (unique), password_hash, bio, location, created_at

**skills** — id, user_id (FK), skill_name, category, type (`offer`/`want`), description, level, created_at

**requests** — id, from_user_id (FK), to_user_id (FK), skill_id (FK), message, status (`pending`/`accepted`/`rejected`), created_at

The database file (`skillexchange.db`) is created automatically the first time
you run the server — no manual setup needed.

## Setup & Run

1. Install Node.js (v18+) if you don't have it.
2. Open a terminal in the `backend` folder:
   ```bash
   cd skill-exchange-platform/backend
   npm install
   ```
3. (Optional) Copy `.env.example` to `.env` and set your own `JWT_SECRET`:
   ```bash
   cp .env.example .env
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open your browser at **http://localhost:5000** — the backend also serves
   the frontend files directly, so nothing else needs to run.

## API Endpoints

| Method | Endpoint                | Auth? | Description |
|--------|--------------------------|-------|-------------|
| POST   | /api/auth/register       | No    | Create account |
| POST   | /api/auth/login          | No    | Log in, get JWT |
| GET    | /api/auth/me             | Yes   | Current user info |
| GET    | /api/skills              | No    | Browse skills (filters: `type`, `search`, `category`) |
| GET    | /api/skills/mine         | Yes   | Your own skills |
| POST   | /api/skills              | Yes   | Add a skill |
| PUT    | /api/skills/:id          | Yes   | Edit your skill |
| DELETE | /api/skills/:id          | Yes   | Delete your skill |
| GET    | /api/users/:id           | No    | Public profile + their skills |
| POST   | /api/requests            | Yes   | Send a skill-exchange request |
| GET    | /api/requests/received   | Yes   | Requests sent to you |
| GET    | /api/requests/sent       | Yes   | Requests you sent |
| PUT    | /api/requests/:id        | Yes   | Accept/reject a request (recipient only) |

## Features
- Register / login with hashed passwords and JWT sessions
- Add, edit, delete your own skills (offer or want, with category/level/description)
- Browse and search everyone else's skills by keyword or type
- Send a skill-exchange request to another user
- Accept or reject received requests; track sent requests
- Public profile pages showing a user's bio and listed skills
- Fully responsive, clean UI with no external CSS/JS frameworks required

## Notes for Viva / Demo
- All passwords are hashed with bcrypt before storing — never stored in plain text.
- Auth uses stateless JWTs sent as `Authorization: Bearer <token>` headers.
- SQLite was chosen over MySQL/MongoDB so the whole project runs with zero
  external database setup — ideal for a mini project / demo. Swapping in
  MySQL or PostgreSQL would only require changing `db.js` and the SQL
  parameter style, since the route logic is plain SQL.
