# Case Study: Social Bookmark Manager

A fullstack social bookmarking app built with Express, Postgres, and vanilla JavaScript. Users can register, share bookmarks, and like each other's links.

- [Tech Stack](#tech-stack)
- [Setup](#setup)
  - [1. Create a local Postgres database](#1-create-a-local-postgres-database)
  - [2. Configure environment variables](#2-configure-environment-variables)
  - [3. Install dependencies](#3-install-dependencies)
  - [4. Initialize the database schema](#4-initialize-the-database-schema)
  - [5. Start the server](#5-start-the-server)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
  - [Auth](#auth)
    - [`POST /api/auth/register`](#post-apiauthregister)
    - [`POST /api/auth/login`](#post-apiauthlogin)
    - [`GET /api/auth/me`](#get-apiauthme)
    - [`DELETE /api/auth/logout`](#delete-apiauthlogout)
  - [Bookmarks](#bookmarks)
    - [`GET /api/bookmarks`](#get-apibookmarks)
    - [`POST /api/bookmarks`](#post-apibookmarks)
    - [`DELETE /api/bookmarks/:bookmark_id`](#delete-apibookmarksbookmark_id)
    - [`POST /api/bookmarks/:bookmark_id/like`](#post-apibookmarksbookmark_idlike)
    - [`DELETE /api/bookmarks/:bookmark_id/like`](#delete-apibookmarksbookmark_idlike)
  - [Users](#users)
    - [`GET /api/users/:user_id/bookmarks`](#get-apiusersuser_idbookmarks)


## Tech Stack

- **Backend:** Node.js, Express, PostgreSQL, `pg`, `bcrypt`, `cookie-session`
- **Frontend:** Vanilla JavaScript (ES modules), HTML, CSS

## Setup

### 1. Create a local Postgres database

```sh
createdb social_bookmarks
```

### 2. Configure environment variables

```sh
# Copy the server/.env.template file to create a new file called server/.env
cp server/.env.template server/.env
```

Open `server/.env` and fill in your Postgres credentials and a random `SESSION_SECRET`.

### 3. Install dependencies

```sh
cd server
npm install
```

### 4. Seed the database

```sh
npm run db:seed
```

This drops and recreates the `users`, `bookmarks`, and `bookmark_likes` tables, then inserts sample data. It is safe to run multiple times.

### 5. Start the server

```sh
npm run dev
```

The app will be running at [http://localhost:8080](http://localhost:8080).

## Project Structure

```
├── server/
│   ├── index.js                        # Express app, middleware, routes
│   ├── db/
│   │   ├── pool.js                     # Shared Postgres connection pool
│   │   └── seed.js                     # Drops, recreates schema, and inserts sample data
│   ├── models/
│   │   ├── userModel.js                # User data access and password validation
│   │   └── bookmarkModel.js            # Bookmark data access with JOIN queries
│   ├── controllers/
│   │   ├── authControllers.js          # Register, login, me, logout
│   │   └── bookmarkControllers.js      # Bookmark CRUD and likes
│   └── middleware/
│       └── checkAuthentication.js      # Auth guard middleware
└── frontend/
    ├── index.html
    └── src/
        ├── main.js                     # Page load logic and event handlers
        ├── fetch-helpers.js            # Functions that call the API
        ├── dom-helpers.js              # Functions that update the DOM
        └── styles.css
```

## API Endpoints

### Auth

#### `POST /api/auth/register`

Creates a new user account and starts a session.

- **Auth required:** No
- **Body:** `{ username, password }`
- **Success `201`:** `{ user_id, username }`
- **Errors:**
  - `400` — `{ error: "Username and password are required." }`
  - `400` — `{ error: "Username already taken." }`

#### `POST /api/auth/login`

Logs in with existing credentials and starts a session.

- **Auth required:** No
- **Body:** `{ username, password }`
- **Success `200`:** `{ user_id, username, password_hash }`
- **Errors:**
  - `401` — `{ error: "Invalid credentials." }`

#### `GET /api/auth/me`

Returns the currently logged-in user.

- **Auth required:** No
- **Success `200`:** `{ user_id, username }`
- **Errors:**
  - `401` — _(no body)_

#### `DELETE /api/auth/logout`

Ends the current session.

- **Auth required:** No
- **Success `204`:** _(no body)_

---

### Bookmarks

#### `GET /api/bookmarks`

Returns all bookmarks sorted by like count descending.

- **Auth required:** No
- **Success `200`:** Array of `{ bookmark_id, title, url, user_id, username, like_count }`

#### `POST /api/bookmarks`

Creates a new bookmark owned by the logged-in user.

- **Auth required:** Yes
- **Body:** `{ title, url }`
- **Success `201`:** `{ bookmark_id, title, url, user_id }`
- **Errors:**
  - `400` — `{ error: "Title and URL are required." }`
  - `401` — `{ error: "You must be logged in." }`

#### `DELETE /api/bookmarks/:bookmark_id`

Deletes a bookmark. Only the owner may delete it.

- **Auth required:** Yes
- **Success `204`:** _(no body)_
- **Errors:**
  - `401` — `{ error: "You must be logged in." }`
  - `403` — `{ error: "You do not have permission to delete this bookmark." }`
  - `404` — `{ error: "Bookmark not found." }`

#### `POST /api/bookmarks/:bookmark_id/like`

Likes a bookmark. Silently succeeds if already liked.

- **Auth required:** Yes
- **Success `201`:** `{ bookmark_id, user_id }` _(new like row)_
- **Success `200`:** _(no body — bookmark was already liked)_
- **Errors:**
  - `401` — `{ error: "You must be logged in." }`

#### `DELETE /api/bookmarks/:bookmark_id/like`

Removes a like from a bookmark.

- **Auth required:** Yes
- **Success `204`:** _(no body)_
- **Errors:**
  - `401` — `{ error: "You must be logged in." }`

---

### Users

#### `GET /api/users/:user_id/bookmarks`

Returns all bookmarks created by a specific user.

- **Auth required:** No
- **Success `200`:** Array of `{ bookmark_id, title, url }`
