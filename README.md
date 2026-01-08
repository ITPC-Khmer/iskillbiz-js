# iskillbiz-js API auth quickstart

This Express app now uses Sequelize + MySQL with JWT and session-backed auth.

## Environment
Set these (or rely on defaults in parentheses):
- `DB_NAME` (iskillbiz)
- `DB_USER` (root)
- `DB_PASSWORD` (empty)
- `DB_HOST` (127.0.0.1)
- `DB_PORT` (3306)
- `SESSION_SECRET` (change-me)
- `JWT_SECRET` (change-me)
- `JWT_EXPIRES_IN` (1d)

## Install & run
```bash
cd /Users/globesosuperapp/PhpstormProjects/iskillbiz-js
npm install
npm run build:css
npm start
```

The server waits for MySQL connection and syncs tables (users + session store) before listening.

## Auth endpoints
Base path: `/auth`

- `POST /auth/register`
  - Body JSON: `{ "phone": "string", "password": "string", "email?": "string", "name?": "string", "photo?": "string", "gender?": "male|female|other|prefer_not_to_say", "dob?": "YYYY-MM-DD", "bio?": "string" }`
  - Returns: `{ user, token }` with password stripped; sets session.

- `POST /auth/login`
  - Body JSON: `{ "phone": "string", "password": "string" }`
  - Returns: `{ user, token }`; sets session.

JWT tokens are Bearer tokens (Authorization header). Session cookies use the Sequelize store.

