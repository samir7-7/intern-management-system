# Internship Management System API

A backend system for managing interns and tasks. Admins create and assign tasks to
interns and review their submissions; interns view assigned tasks, update task status,
and submit their work (via a link or an uploaded file).

Built with Node.js, Express, MongoDB (Mongoose), and JWT authentication. A simple
self-contained web frontend is served from the same server for manual testing.

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Roles](#roles)
6. [Authentication](#authentication)
7. [Standard Response Format](#standard-response-format)
8. [API Reference](#api-reference)
   - [Auth / User](#auth--user)
   - [Tasks](#tasks)
   - [Submissions](#submissions)
9. [Data Models](#data-models)
10. [Frontend Usage Guide](#frontend-usage-guide)
11. [End-to-End Workflow](#end-to-end-workflow)
12. [Postman Collection](#postman-collection)

---

## Technology Stack

- Node.js (ES Modules)
- Express.js 5
- MongoDB with Mongoose
- JSON Web Tokens (access + refresh)
- bcrypt for password hashing
- Multer + Cloudinary for file uploads

---

## Project Structure

```
src/
  app.js                      Express app, middleware, route mounting
  index.js                    Server bootstrap + admin seeding
  constant.js                 Database name
  db/index.js                 MongoDB connection
  controllers/
    user.controller.js        Register, login, logout, change password, delete/list interns
    task.controller.js        Create, list, update status, delete tasks
    submission.controller.js  Submit, review, list submissions
  middlewares/
    auth.middleware.js         JWT verification + admin guard
    multer.middleware.js       File upload handling
  models/
    user.models.js             User schema (with auth helper methods)
    task.models.js             Task schema
    submission.models.js       Submission schema
  routes/
    user.routes.js
    task.routes.js
    submission.routes.js
  utils/
    ApiError.js                Error wrapper
    ApiResponse.js             Success wrapper
    cloudinary.js              Cloudinary upload helper
public/
  index.html                   Self-contained test frontend
docs/
  postman_collection.json      Importable Postman collection
  postman_environment.json     Postman environment variables
```

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- A MongoDB database (MongoDB Atlas or local)
- A Cloudinary account (only required if testing file uploads)

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the project root (see [Environment Variables](#environment-variables)).

### Run

```bash
npm run dev
```

On startup the server:

1. Connects to MongoDB.
2. Seeds an admin account from the `ADMIN_*` environment variables if one does not
   already exist.
3. Starts listening on `PORT` (default 8000).

You should see:

```
MongoDB connected: <host>
Admin created successfully   (or: Admin already exists)
Server is running on port 8000
```

The API base URL is `http://localhost:8000/api/v1`.
The test frontend is available at `http://localhost:8000/`.

---

## Environment Variables

| Variable                  | Description                                               |
| ------------------------- | --------------------------------------------------------- |
| `PORT`                    | Port to run the server on (default 8000).                 |
| `DB_CONNECTION_STRING`    | MongoDB connection string (without the database name).    |
| `ORIGIN`                  | Allowed CORS origin for the frontend.                     |
| `ACCESS_TOKEN_SECRET`     | Secret used to sign access tokens.                        |
| `ACCESS_TOKEN_EXPIRATION` | Access token lifetime, e.g. `1d`.                         |
| `REFRESH_TOKEN_SECRET`    | Secret used to sign refresh tokens.                       |
| `REFRESH_TOKEN_EXPIRATION`| Refresh token lifetime, e.g. `10d`.                       |
| `ADMIN_FULL_NAME`         | Full name for the seeded admin account.                   |
| `ADMIN_EMAIL`             | Email for the seeded admin account.                       |
| `ADMIN_PASSWORD`          | Password for the seeded admin account.                    |
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary cloud name (file uploads).                     |
| `CLOUDINARY_API_KEY`      | Cloudinary API key (file uploads).                        |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret (file uploads).                     |

Example `.env`:

```env
PORT=8000
DB_CONNECTION_STRING=mongodb+srv://user:pass@cluster0.example.mongodb.net
ORIGIN=http://localhost:8000

ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRATION=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRATION=10d

ADMIN_FULL_NAME=Site Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme

CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## Roles

There are two roles, stored on the user document:

- `admin` - manages tasks, assigns them to interns, reviews submissions, and can list
  or delete interns. The admin account is seeded automatically on first startup.
- `user` - an intern. Created through the register endpoint. Can view assigned tasks,
  update their status, and submit them.

---

## Authentication

Authentication uses JWT access tokens. On successful login the server returns an
`accessToken` (and a `refreshToken`) in the response body, and also sets them as
HTTP-only cookies.

Protected endpoints require the token. The auth middleware reads it from, in order:

1. The `Authorization` header: `Authorization: Bearer <accessToken>`
2. The `accessToken` cookie (fallback)

The header takes precedence. API clients (Postman, a frontend using `fetch`) should send
the header.

Token payload contains the user id, role, and email. Admin-only endpoints additionally
verify that the authenticated user's role is `admin`.

---

## Standard Response Format

All successful responses use a consistent envelope:

```json
{
  "statusCode": 200,
  "responseMessage": "Human readable message",
  "data": { "...": "endpoint-specific payload" },
  "success": true
}
```

Error responses contain a `statusCode` and a `message` describing the problem.

Common status codes:

| Code | Meaning                                                         |
| ---- | -------------------------------------------------------------- |
| 200  | Success                                                        |
| 201  | Resource created                                              |
| 400  | Validation error / bad request                                |
| 401  | Missing or invalid authentication                             |
| 403  | Authenticated but not authorized (e.g. non-admin on admin route)|
| 404  | Resource not found                                            |
| 500  | Server error                                                  |

---

## API Reference

Base path for all endpoints: `/api/v1`

Legend for the Auth column:

- No - public endpoint
- Yes - any authenticated user
- Yes (admin) - authenticated and must be an admin

### Auth / User

#### Register

```
POST /api/v1/users/register
Auth: No
```

Creates a new intern account (role is always `user`).

Request body:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Notes:
- Password must be at least 6 characters.
- Email must be unique.

Success (201):

```json
{
  "statusCode": 200,
  "responseMessage": "User registered successfully",
  "data": {
    "createdUser": {
      "_id": "...",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "createdAt": "...",
      "updatedAt": "..."
    }
  },
  "success": true
}
```

Errors: 400 (missing fields, duplicate email, short password).

---

#### Login

```
POST /api/v1/users/login
Auth: No
```

Request body:

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Success (200):

```json
{
  "statusCode": 200,
  "responseMessage": "User logged in successfully",
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "loggedInUser": {
      "_id": "...",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "role": "user"
    }
  },
  "success": true
}
```

Errors: 400 (missing fields, invalid email, invalid password).

---

#### Logout

```
POST /api/v1/users/logout
Auth: Yes
```

Clears the stored refresh token and the auth cookies.

Success (200):

```json
{
  "statusCode": 200,
  "responseMessage": "User logged out successfully",
  "data": null,
  "success": true
}
```

---

#### Change Password

```
POST /api/v1/users/change-password
Auth: Yes
```

Request body:

```json
{
  "oldPassword": "secret123",
  "newPassword": "newsecret456"
}
```

Notes:
- The new password cannot equal the old password.

Errors: 400 (missing fields, new equals old, wrong old password).

---

#### List Interns

```
GET /api/v1/users/interns
Auth: Yes (admin)
```

Returns all interns (role `user`) with id, name, and email. Useful for building an
assignment dropdown.

Success (200):

```json
{
  "statusCode": 200,
  "responseMessage": "Interns fetched successfully",
  "data": {
    "interns": [
      { "_id": "...", "fullName": "Jane Doe", "email": "jane@example.com" }
    ]
  },
  "success": true
}
```

---

#### Delete Intern

```
DELETE /api/v1/users/delete-intern/:internId
Auth: Yes (admin)
```

Path parameter: `internId` - the intern's user id.

Notes:
- Fails if the target is not an intern.
- Fails if the intern has tasks in `pending` or `in-progress` status.

Errors: 404 (not found), 400 (not an intern / has active tasks).

---

### Tasks

#### Create Task

```
POST /api/v1/tasks
Auth: Yes (admin)
```

Creates a task and assigns it to an intern. `assignedBy` is set to the authenticated
admin automatically. Status defaults to `pending`.

Request body:

```json
{
  "taskName": "Build login page",
  "description": "Implement the login UI",
  "assignedTo": "<intern user id>",
  "deadline": "2026-07-01"
}
```

Success (201):

```json
{
  "statusCode": 200,
  "responseMessage": "Task created successfully",
  "data": {
    "task": {
      "_id": "...",
      "taskName": "Build login page",
      "description": "Implement the login UI",
      "status": "pending",
      "assignedTo": "<intern id>",
      "assignedBy": "<admin id>",
      "deadline": "2026-07-01T00:00:00.000Z"
    }
  },
  "success": true
}
```

Errors: 400 (missing field, assignee is not an intern), 404 (assignee not found).

---

#### Get All Tasks

```
GET /api/v1/tasks
Auth: Yes (admin)
```

Returns every task, newest first, with `assignedTo` and `assignedBy` populated with the
user's full name.

Success (200):

```json
{
  "statusCode": 200,
  "responseMessage": "All tasks fetched successfully",
  "data": { "tasks": [ { "...": "..." } ] },
  "success": true
}
```

---

#### Get My Tasks

```
GET /api/v1/tasks/my-tasks
Auth: Yes
```

Returns tasks assigned to the authenticated user, newest first, with `assignedBy`
populated (full name and email).

Success (200):

```json
{
  "statusCode": 200,
  "responseMessage": "Tasks fetched successfully",
  "data": { "tasks": [ { "...": "..." } ] },
  "success": true
}
```

---

#### Update Task Status

```
PATCH /api/v1/tasks/:taskId
Auth: Yes
```

Only the assignee may update their task. Allowed status values:
`pending`, `in-progress`, `submitted`, `completed`.

Path parameter: `taskId`.

Request body:

```json
{ "status": "in-progress" }
```

Errors: 400 (missing or invalid status), 404 (task not found or not assigned to caller).

---

#### Delete Task

```
DELETE /api/v1/tasks/:taskId
Auth: Yes (admin)
```

Deletes the task and its associated submission.

Path parameter: `taskId`.

Errors: 404 (task not found).

---

### Submissions

#### Submit Task

```
POST /api/v1/submit/:taskId
Auth: Yes
Content-Type: application/json OR multipart/form-data
```

Only the task's assignee may submit. At least one of `link` or a file must be provided.
On success the task status is set to `submitted`. A task can only be submitted once.

Path parameter: `taskId`.

JSON body (link submission):

```json
{
  "description": "Notes about the work",
  "link": "https://github.com/me/work"
}
```

Multipart body (file submission):

- `submission` - the file (form field name must be `submission`)
- `description` - optional text
- `link` - optional text

Success (201):

```json
{
  "statusCode": 201,
  "responseMessage": "Task submitted successfully",
  "data": {
    "submission": {
      "_id": "...",
      "taskId": "...",
      "internId": "...",
      "description": "Notes about the work",
      "link": "https://github.com/me/work",
      "document": "<cloudinary url or null>"
    }
  },
  "success": true
}
```

Errors: 403 (not the assignee), 404 (task not found), 400 (already submitted, or neither
link nor file provided).

---

#### List Submissions

```
GET /api/v1/submit
Auth: Yes (admin)
```

Returns all submissions, newest first, with the task (name and status) and the intern
(name and email) populated. Useful for building a review dropdown.

Success (200):

```json
{
  "statusCode": 200,
  "responseMessage": "Submissions fetched successfully",
  "data": {
    "submissions": [
      {
        "_id": "...",
        "taskId": { "_id": "...", "taskName": "Build login page", "status": "submitted" },
        "internId": { "_id": "...", "fullName": "Jane Doe", "email": "jane@example.com" },
        "link": "https://github.com/me/work",
        "document": null,
        "review": null
      }
    ]
  },
  "success": true
}
```

---

#### Review Submission

```
PATCH /api/v1/submit/review/:submissionId
Auth: Yes (admin)
```

Saves a review on the submission and sets the associated task status to `completed`.

Path parameter: `submissionId`.

Request body:

```json
{ "review": "Great work, approved." }
```

Errors: 400 (review missing), 404 (submission or associated task not found).

---

## Data Models

### User

| Field        | Type   | Notes                                  |
| ------------ | ------ | -------------------------------------- |
| fullName     | String | Required.                              |
| email        | String | Required, unique, lowercased.          |
| password     | String | Required, min 6, hashed with bcrypt.   |
| role         | String | `admin` or `user`. Defaults to `user`. |
| refreshToken | String | Set on login.                          |

### Task

| Field               | Type        | Notes                                                  |
| ------------------- | ----------- | ------------------------------------------------------ |
| taskName            | String      | Required.                                              |
| description         | String      | Required.                                              |
| status              | String      | `pending`, `in-progress`, `submitted`, `completed`.    |
| assignedTo          | ObjectId    | Reference to the intern.                               |
| assignedBy          | ObjectId    | Reference to the admin.                                |
| deadline            | Date        | Required.                                              |
| supportingDocuments | [String]    | Optional list of file paths.                           |

### Submission

| Field       | Type     | Notes                                |
| ----------- | -------- | ------------------------------------ |
| taskId      | ObjectId | Reference to the task. Unique.       |
| internId    | ObjectId | Reference to the submitting intern.  |
| description | String   | Optional.                            |
| link        | String   | Optional submission link.            |
| document    | String   | Optional uploaded file URL.          |
| review      | String   | Admin review text.                   |

---

## Frontend Usage Guide

A minimal frontend is included at `public/index.html` and is served by the same Express
server at `http://localhost:8000/`. Because it is served from the same origin as the API,
there are no CORS issues.

### How the frontend talks to the API

1. The user logs in. The frontend reads `data.accessToken` from the login response and
   stores it (in `localStorage`).
2. Every protected request sends the token in the `Authorization` header:

   ```js
   fetch("/api/v1/tasks", {
     headers: { "Authorization": "Bearer " + token }
   });
   ```

3. For JSON requests it sets `Content-Type: application/json` and sends a JSON body.
   For file submission it sends a `FormData` object (and does not set `Content-Type`
   manually, so the browser sets the multipart boundary automatically).

### Role-based views

After login the frontend reads `data.loggedInUser.role` and renders the matching view:

- Admin view: create and assign tasks (intern dropdown), review submissions (submission
  dropdown), list all tasks, delete tasks, delete interns.
- Intern view: list assigned tasks, update task status, submit work (link or file).

### Building it into a real frontend (React, etc.)

The same pattern applies if you replace the bundled page with a framework app:

1. Call `POST /api/v1/users/login`, store `accessToken`.
2. Send `Authorization: Bearer <accessToken>` on every protected call.
3. Use `GET /api/v1/users/interns` to populate an assignment dropdown (admin).
4. Use `GET /api/v1/submit` to populate a review dropdown (admin).
5. Use `GET /api/v1/tasks/my-tasks` for the intern dashboard.
6. For file submission, send `multipart/form-data` with the file under the field name
   `submission`.

If hosting the frontend on a different origin than the API, set the `ORIGIN` environment
variable to that origin and keep `credentials: true` on requests if you rely on cookies.

---

## End-to-End Workflow

The intended lifecycle, and the endpoints involved:

1. Intern registers: `POST /users/register`
2. Admin logs in: `POST /users/login`
3. Admin creates and assigns a task: `POST /tasks` (assignee id from `GET /users/interns`)
4. Intern logs in: `POST /users/login`
5. Intern views assigned tasks: `GET /tasks/my-tasks`
6. Intern updates status: `PATCH /tasks/:taskId` (for example to `in-progress`)
7. Intern submits work: `POST /submit/:taskId` (link or file)
8. Admin reviews the submission: `PATCH /submit/review/:submissionId`
   (submission id from `GET /submit`); the task becomes `completed`

Dependencies between steps:

- A task must exist (step 3) before an intern can update or submit it (steps 6, 7).
- A submission must exist (step 7) before it can be reviewed (step 8).
- Admin endpoints require an admin token; intern endpoints require that intern's token.

---

## Postman Collection

An importable collection and environment are provided in the `docs/` folder:

- `docs/postman_collection.json`
- `docs/postman_environment.json`

To use it:

1. Import both files into Postman.
2. Select the imported environment.
3. Set `adminEmail` and `adminPassword` to match the seeded admin (the `ADMIN_*` values
   from your `.env`).
4. Run the requests in order. Login requests automatically save tokens and ids into
   environment variables, which later requests reuse.

The collection is organized into folders by module (Auth/User, Tasks, Submissions, and a
final Cleanup folder for destructive operations) and arranged so the Collection Runner
can execute the full workflow top to bottom.
