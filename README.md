# AF_SLIIT_Project — Community Donation Platform

A full-stack web application that connects **donors** with **underprivileged individuals** in local communities. Built with Express.js (Node.js) + MongoDB on the backend and React (Vite) on the frontend.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Getting Started (Local Setup)](#getting-started-local-setup)
5. [Environment Variables](#environment-variables)
6. [API Endpoint Documentation](#api-endpoint-documentation)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## Project Overview

| Role          | Capabilities                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------- |
| **Donor**     | Create item listings, browse need requests, make cash/card/goods donations, message recipients |
| **Recipient** | Post need requests with verification docs, track funding progress                              |
| **Admin**     | Verify users & documents, approve needs, manage all data, view dashboard statistics            |

### Components

| #   | Component                      | Owner   | Description                                                                      |
| --- | ------------------------------ | ------- | -------------------------------------------------------------------------------- |
| 1   | **Auth & User Management**     | Venura  | Signup/login (JWT), profile management, admin user controls, NIC document upload |
| 2   | **Needs & Donations**          | Lochana | Need requests (CRUD), donation flow (Cash/Card/Goods), fulfillment tracking      |
| 3   | **Item Listings & Messaging**  | Risini  | Donor item listings, browse/search, real-time-style messaging per item           |
| 4   | **Feedback & Admin Dashboard** | Heyli   | Need feedback, platform reviews, admin stats, OpenWeather integration            |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                │
│  AuthContext (Context API) → PrivateRoute → Pages        │
│  Services layer (axios) → Backend REST API               │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────┐
│               Express.js REST API (Node.js)              │
│  Routes → Controllers → Services → Mongoose Models      │
│  Middleware: JWT Auth, RBAC, Verified-Recipient guard    │
└──────────┬──────────────────────┬───────────────────────┘
           │                      │
    ┌──────▼──────┐        ┌──────▼──────────────┐
    │  MongoDB    │        │  Third-Party Services │
    │  Atlas      │        │  • Cloudinary (images)│
    └─────────────┘        │  • Firebase FCM (push)│
                           │  • OpenWeather API    │
                           └──────────────────────┘
```

---

## Tech Stack

| Layer              | Technology                                                    |
| ------------------ | ------------------------------------------------------------- |
| Backend            | Node.js, Express.js 4                                         |
| Database           | MongoDB (Mongoose 7)                                          |
| Auth               | JWT (jsonwebtoken), bcryptjs                                  |
| File Storage       | Cloudinary, Multer                                            |
| Push Notifications | Firebase Admin SDK (FCM)                                      |
| API Docs           | Swagger UI (OpenAPI 3.0)                                      |
| Frontend           | React 18, Vite, Tailwind CSS                                  |
| State Management   | React Context API                                             |
| Testing            | Jest, Supertest (unit + integration), Artillery (performance) |

---

## Getting Started (Local Setup)

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A running MongoDB instance (Atlas or local)

### 1. Clone the repository

```bash
git clone https://github.com/venura449/AF_SLIIT_Project.git
cd AF_SLIIT_Project
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Configure backend environment variables

```bash
cp .env.example .env
# Edit .env with your values (see Environment Variables section below)
```

### 4. Start the backend server

```bash
npm run dev        # Development (nodemon, auto-restart)
npm start          # Production
```

The API will be available at `http://localhost:5001`.  
Swagger docs: `http://localhost:5001/api-docs`

### 5. Install frontend dependencies

```bash
cd frontend
npm install
```

### 6. Configure frontend environment variables

```bash
cp .env.example .env
# Edit .env with your values
```

### 7. Start the frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### Backend (`.env`)

| Variable                | Required | Description                                                       |
| ----------------------- | -------- | ----------------------------------------------------------------- |
| `PORT`                  | No       | Port to listen on (default: `5001`)                               |
| `MONGO_URI`             | Yes      | MongoDB connection string                                         |
| `JWT_SECRET`            | Yes      | Secret key for signing JWT tokens                                 |
| `CLOUDINARY_NAME`       | Yes      | Cloudinary cloud name                                             |
| `CLOUDINARY_KEY`        | Yes      | Cloudinary API key                                                |
| `CLOUDINARY_SECRET`     | Yes      | Cloudinary API secret                                             |
| `FIREBASE_PROJECT_ID`   | Yes      | Firebase project ID (for FCM)                                     |
| `FIREBASE_PRIVATE_KEY`  | Yes      | Firebase service account private key (include `\n`)               |
| `FIREBASE_CLIENT_EMAIL` | Yes      | Firebase service account client email                             |
| `OPENWEATHER_API_KEY`   | Yes      | OpenWeather API key (Current Weather 2.5)                         |
| `FRONTEND_URL`          | No       | Deployed frontend URL for CORS (default: `http://localhost:5173`) |
| `NODE_ENV`              | No       | `development` / `production` / `test`                             |

### Frontend (`frontend/.env`)

| Variable                            | Required | Description                                              |
| ----------------------------------- | -------- | -------------------------------------------------------- |
| `VITE_API_URL`                      | Yes      | Backend API base URL e.g. `http://localhost:5001/api/v1` |
| `VITE_FIREBASE_API_KEY`             | Yes      | Firebase web API key                                     |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Yes      | Firebase auth domain                                     |
| `VITE_FIREBASE_PROJECT_ID`          | Yes      | Firebase project ID                                      |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Yes      | Firebase storage bucket                                  |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes      | Firebase sender ID                                       |
| `VITE_FIREBASE_APP_ID`              | Yes      | Firebase app ID                                          |
| `VITE_FIREBASE_VAPID_KEY`           | Yes      | VAPID key for web push notifications                     |

---

## API Endpoint Documentation

Interactive documentation is available at `/api-docs` (Swagger UI) when the server is running.

### Auth (`/api/v1/auth`)

| Method   | Endpoint   | Auth   | Description           |
| -------- | ---------- | ------ | --------------------- |
| `POST`   | `/signup`  | None   | Register a new user   |
| `POST`   | `/login`   | None   | Login and receive JWT |
| `GET`    | `/profile` | Bearer | Get own profile       |
| `PUT`    | `/profile` | Bearer | Update own profile    |
| `DELETE` | `/profile` | Bearer | Delete own account    |

### User Management (`/api/v1/users`) — Admin only

| Method   | Endpoint          | Auth  | Description                |
| -------- | ----------------- | ----- | -------------------------- |
| `GET`    | `/`               | Admin | Get all users              |
| `PUT`    | `/:userId/status` | Admin | Activate / deactivate user |
| `PUT`    | `/:userId`        | Admin | Update user details        |
| `DELETE` | `/:userId`        | Admin | Delete user                |

### Documents (`/api/v1/documents`)

| Method | Endpoint          | Auth   | Description               |
| ------ | ----------------- | ------ | ------------------------- |
| `POST` | `/upload`         | Bearer | Upload NIC document       |
| `GET`  | `/status`         | Bearer | Get own document status   |
| `GET`  | `/pending`        | Admin  | List pending documents    |
| `GET`  | `/unverified`     | Admin  | List unverified users     |
| `PUT`  | `/verify/:userId` | Admin  | Approve / reject document |
| `GET`  | `/:userId`        | Admin  | Get user document         |

### Needs (`/api/v1/needs`)

| Method   | Endpoint                       | Auth        | Description                                                                        |
| -------- | ------------------------------ | ----------- | ---------------------------------------------------------------------------------- |
| `GET`    | `/getall`                      | None        | Get all verified needs (filters: category, urgency, status, location, page, limit) |
| `GET`    | `/my-needs`                    | Bearer      | Get own needs                                                                      |
| `POST`   | `/create`                      | Bearer      | Create need request                                                                |
| `PATCH`  | `/update/:needId`              | Admin/Donor | Update need progress                                                               |
| `PATCH`  | `/upload-verification/:needId` | Bearer      | Upload verification docs                                                           |
| `PATCH`  | `/approve/:needId`             | Admin       | Approve need                                                                       |
| `GET`    | `/pending`                     | Admin       | Get pending needs                                                                  |
| `PUT`    | `/update-need/:needId`         | Recipient   | Edit own need                                                                      |
| `DELETE` | `/delete/:needId`              | Recipient   | Delete own need                                                                    |

### Donations (`/api/v1/donation`)

| Method   | Endpoint           | Auth   | Description                   |
| -------- | ------------------ | ------ | ----------------------------- |
| `POST`   | `/`                | Donor  | Create donation               |
| `PATCH`  | `/:id/confirm`     | Admin  | Confirm donation              |
| `GET`    | `/my`              | Donor  | Get own donations             |
| `GET`    | `/`                | Admin  | Get all donations             |
| `GET`    | `/by-need/:needId` | Bearer | Donations for a specific need |
| `GET`    | `/fulfilled-needs` | Admin  | Fulfilled needs log           |
| `GET`    | `/:id`             | Bearer | Get donation by ID            |
| `DELETE` | `/:id`             | Admin  | Delete donation               |

### Item Listings (`/api/v1/items`)

| Method   | Endpoint     | Auth   | Description                                     |
| -------- | ------------ | ------ | ----------------------------------------------- |
| `POST`   | `/`          | Donor  | Create item listing (multipart, up to 5 images) |
| `GET`    | `/my-items`  | Donor  | Get own listings                                |
| `GET`    | `/available` | Bearer | Browse all available items                      |
| `GET`    | `/all`       | Admin  | Get all items                                   |
| `GET`    | `/:id`       | Bearer | Get single item                                 |
| `PUT`    | `/:id`       | Donor  | Update own item                                 |
| `DELETE` | `/:id`       | Donor  | Delete own item                                 |

### Messages (`/api/v1/messages`)

| Method | Endpoint            | Auth   | Description               |
| ------ | ------------------- | ------ | ------------------------- |
| `POST` | `/`                 | Bearer | Send a message            |
| `GET`  | `/item/:itemId`     | Bearer | Get conversation for item |
| `GET`  | `/my-conversations` | Bearer | Get all conversations     |

### Feedback (`/api/v1/feedbacks`)

| Method   | Endpoint              | Auth   | Description            |
| -------- | --------------------- | ------ | ---------------------- |
| `POST`   | `/createFeedback`     | Bearer | Add feedback on a need |
| `GET`    | `/fetchFeedbacks`     | Bearer | Get all feedbacks      |
| `PUT`    | `/updateFeedback/:id` | Bearer | Update feedback        |
| `DELETE` | `/deleteFeedback/:id` | Bearer | Delete feedback        |
| `POST`   | `/reviews`            | Bearer | Submit platform review |
| `GET`    | `/reviews`            | None   | Get platform reviews   |

### Admin Dashboard (`/api/v1/admin`) — Admin only

| Method | Endpoint             | Auth  | Description                       |
| ------ | -------------------- | ----- | --------------------------------- |
| `GET`  | `/dashboard`         | Admin | Get dashboard statistics          |
| `GET`  | `/weather?lat=&lon=` | Admin | Get current weather (OpenWeather) |

### Notifications (`/api/v1/notifications`)

| Method  | Endpoint            | Auth   | Description              |
| ------- | ------------------- | ------ | ------------------------ |
| `PATCH` | `/save-fcm-token`   | Bearer | Save Firebase push token |
| `POST`  | `/sendNotification` | Bearer | Send push notification   |

---

## Testing

### Unit & Integration Tests

Tests use **Jest** + **Supertest** and require a running MongoDB instance.

```bash
# Set your test database URI
set MONGO_URI=mongodb://localhost:27017/af_sliit_test   # Windows
export MONGO_URI=...                                     # Mac/Linux

# Run all tests
npm test
```

| Test File                                    | Type          | Coverage                    |
| -------------------------------------------- | ------------- | --------------------------- |
| `tests/Venura/server.test.js`                | Integration   | Health check endpoints      |
| `tests/Venura/authController.test.js`        | Integration   | Signup, login, validation   |
| `tests/Venura/usermanagement.test.js`        | Integration   | Admin user management, RBAC |
| `tests/Heyli/adminDash.test.js`              | Unit (mocked) | Admin dashboard stats       |
| `tests/Heyli/feedbackController.test.js`     | Integration   | Feedback CRUD               |
| `tests/Lochana/needController.test.js`       | Integration   | Need CRUD, filters          |
| `tests/Risini/itemListingController.test.js` | Integration   | Item listing CRUD, RBAC     |

### Performance Tests (Artillery)

```bash
# Make sure the backend is running on localhost:5001 first
npm run dev

# In a separate terminal, run the load test
npm run test:perf

# Generate an HTML report
npm run test:perf:report
```

The test config at `tests/performance/load-test.yml` runs three phases:

| Phase          | Duration | Virtual Users |
| -------------- | -------- | ------------- |
| Warm-up        | 30 s     | 1 → 10 (ramp) |
| Sustained Load | 60 s     | 10            |
| Spike          | 20 s     | 30            |

---

## Deployment

### Backend — Render

**Platform:** [Render](https://render.com)

**Live URL:** `https://af-sliit-project.onrender.com`

**Setup steps:**

1. Push the repository to GitHub.
2. Create a new **Web Service** on Render, connect your GitHub repo.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add all backend environment variables in Render's **Environment** tab (see [Environment Variables](#environment-variables)).
6. Deploy — Render will auto-deploy on every push to `main`.

### Frontend — Vercel

**Platform:** [Vercel](https://vercel.com)

**Live URL:** `https://af-sliit-project.vercel.app` _(update with your actual URL)_

**Setup steps:**

1. Import the repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add all `VITE_*` environment variables in Vercel's **Environment Variables** settings.
6. Deploy — Vercel auto-deploys on push to `main`.

The `frontend/vercel.json` catches all client-side routes and redirects them to `index.html` (SPA support).

### Environment Variables in Production

> **Never commit real secrets.** Use the platform's environment variable settings.

| Secret                | Where to Set                 |
| --------------------- | ---------------------------- |
| `MONGO_URI`           | Render Environment tab       |
| `JWT_SECRET`          | Render Environment tab       |
| `CLOUDINARY_*`        | Render Environment tab       |
| `FIREBASE_*`          | Render Environment tab       |
| `OPENWEATHER_API_KEY` | Render Environment tab       |
| `VITE_API_URL`        | Vercel Environment Variables |
| `VITE_FIREBASE_*`     | Vercel Environment Variables |
