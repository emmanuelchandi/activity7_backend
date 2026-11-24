# Activity 7 - Campus Maintenance Requests API

Node.js + Express + PostgreSQL backend for the same system as Activity 6.
Routes: GET /, GET /health, GET/POST /api/records, GET/PUT/DELETE /api/records/:id

## A. Run it on your computer

1. Unzip, then open the `activity7-backend` folder in VS Code (File > Open Folder).
2. Open a terminal in VS Code (Terminal > New Terminal) and install the packages:
   `npm install`
   (On Windows PowerShell, if it says npm.ps1 is blocked, use `npm.cmd install` and `npm.cmd` for every npm command below.)
3. Create a free PostgreSQL database (see section B) and copy its connection URL.
4. Copy `.env.example` to a new file named `.env`, then paste your URL after `DATABASE_URL=`.
5. Create the table and the 8 starting records (once):
   `npm run setup`
6. Start the server:
   `npm start`
   Open http://localhost:3000 - you should see the API guide. Stop with Ctrl+C.
7. With the server running, open a second terminal and run the automatic tests:
   `npm run test:api`
   All lines should say PASS.

## B. Get a free PostgreSQL database

Your assignment says Render's files are temporary, so records must live in a hosted database.
Option 1 - Render: Dashboard > New > PostgreSQL > Free plan. Copy the "External Database URL".
Option 2 - Neon (neon.tech): create a project, copy the connection string.
Check each plan's limits when you create the account (some free databases expire).

## C. Test with Postman (Section 7 of the assignment)

Use Content-Type: application/json for POST and PUT.

    {
      "title": "Broken classroom light",
      "category": "Electrical",
      "description": "The light in Room B12 does not switch on.",
      "status": "Pending"
    }

| Test | Expected |
|------|----------|
| GET /health | 200 |
| GET /api/records | 200 and an array |
| POST /api/records (valid body) | 201 and a new id - write it down |
| GET /api/records/ID | 200 and the same record |
| PUT /api/records/ID (all four fields) | 200, same id, new values |
| DELETE /api/records/ID | 200 {"message":"Record deleted."} then GET gives 404 |
| POST with title missing, or status "Done" | 400 and a message |
| GET /api/records/abc or malformed JSON | 400 and a message |
| GET, PUT, DELETE /api/records/99999 | 404 each |
| Create a record, stop and restart `npm start`, then GET it | still there |

## D. Put it online

1. Create a GitHub repository and upload this folder's files (package.json and package-lock.json
   included; `.env` and `node_modules` are excluded by .gitignore).
2. In Render: New > Web Service > connect the repository.
   - Root Directory: leave empty (or the folder that holds package.json)
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Instance type: Free
3. Under Environment, add:
   - `DATABASE_URL` = your database URL (the one you used in .env)
   - `STUDENT_NUMBER` = your student number
   - `CLIENT_ORIGINS` = leave empty for now (Activity 8: your Netlify address)
4. Deploy, open your https://....onrender.com address, check /health, then run:
   `node test-api.js https://your-backend.onrender.com`
5. Submit the base URL (no /api/records at the end) in the Activity 7 field.
   The free service sleeps when idle, so the first request can take up to a minute.

## Files
server.js (app, guide page, health, error handling) - routes/records.js (the five record routes)
db.js (connection pool) - validate.js (field rules) - schema.sql, seed.sql, setup.js (database)
test-api.js (automatic tests) - .env.example - .gitignore
