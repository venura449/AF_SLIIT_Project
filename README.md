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
9. [Team Contributions](#team-contributions)
10. [Git Workflow](#git-workflow)

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
**Base URL:** `http://localhost:5001/api/v1` (local) or `https://af-sliit-project.onrender.com/api/v1` (production)

### Auth (`/api/v1/auth`)

| Method   | Endpoint   | Auth   | Description           |
| -------- | ---------- | ------ | --------------------- |
| `POST`   | `/signup`  | None   | Register a new user   |
| `POST`   | `/login`   | None   | Login and receive JWT |
| `GET`    | `/profile` | Bearer | Get own profile       |
| `PUT`    | `/profile` | Bearer | Update own profile    |
| `DELETE` | `/profile` | Bearer | Delete own account    |

#### Example Requests & Responses

**Signup Request:**

```bash
curl -X POST http://localhost:5001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_donor",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "Donor"
  }'
```

**Signup Response (201 Created):**

```json
{
  "message": "Signup successful",
  "user": {
    "_id": "60d5ec49f1b2c72d8c8e4a1a",
    "username": "john_donor",
    "email": "john@example.com",
    "role": "Donor",
    "isVerified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Login Request:**

```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Get Profile (Protected Route):**

```bash
curl -X GET http://localhost:5001/api/v1/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Profile Response (200 OK):**

```json
{
  "user": {
    "_id": "60d5ec49f1b2c72d8c8e4a1a",
    "username": "john_donor",
    "email": "john@example.com",
    "role": "Donor",
    "isVerified": false,
    "createdAt": "2026-04-10T11:30:00Z"
  }
}
```

---

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

### Test Environment Configuration

**Testing Framework:** Jest 30.2.0  
**HTTP Client:** Supertest 7.2.2  
**Load Testing:** Artillery.io 2.0.30  
**Node.js Version:** ≥ 18

**Test Database:** MongoDB  
**Timeout:** 60 seconds (standard) / 120 seconds (CI environments)

### Unit & Integration Tests

Tests use **Jest** + **Supertest** to verify API endpoints, business logic, and database integration.

#### Setup

1. **Configure test environment:**

   ```bash
   # Windows
   set NODE_ENV=test
   set MONGO_URI=mongodb://localhost:27017/af_sliit_test

   # Mac/Linux
   export NODE_ENV=test
   export MONGO_URI=mongodb://localhost:27017/af_sliit_test
   ```

2. **Run all tests:**

   ```bash
   npm test
   ```

   This command:
   - Sets `NODE_ENV=test` automatically
   - Skips MongoDB connection in `Server.js`
   - Uses `jest.setup.js` for test configuration
   - Exits after all tests complete (`--forceExit`)

3. **Run specific test file:**
   ```bash
   npx jest tests/Venura/authController.test.js
   ```

#### Test Coverage

| Test File                                    | Type          | Component       | Test Cases                                        |
| -------------------------------------------- | ------------- | --------------- | ------------------------------------------------- |
| `tests/Venura/server.test.js`                | Integration   | Server/Health   | Health check, root endpoint, API structure        |
| `tests/Venura/authController.test.js`        | Integration   | Auth            | Signup validation, login flow, JWT token handling |
| `tests/Venura/usermanagement.test.js`        | Integration   | User Mgmt       | Admin controls, user deactivation, RBAC           |
| `tests/Heyli/adminDash.test.js`              | Unit (mocked) | Admin Dashboard | Dashboard stats aggregation, weather API calls    |
| `tests/Heyli/feedbackController.test.js`     | Integration   | Feedback        | Feedback CRUD, review submission, rating logic    |
| `tests/Lochana/needController.test.js`       | Integration   | Needs           | Need creation, filtering, approval workflow       |
| `tests/Risini/itemListingController.test.js` | Integration   | Item Listings   | Item CRUD, image upload, browse with filters      |

#### Expected Test Output

Successful test run example:

```
 PASS  tests/Venura/server.test.js
 PASS  tests/Venura/authController.test.js
 PASS  tests/Venura/usermanagement.test.js
 PASS  tests/Heyli/adminDash.test.js
 PASS  tests/Heyli/feedbackController.test.js
 PASS  tests/Lochana/needController.test.js
 PASS  tests/Risini/itemListingController.test.js

Test Suites: 7 passed, 7 total
Tests:       XX passed, XX total
Snapshots:   0 total
Time:        XX.XXXs
```

### Performance Testing (Artillery)

#### Setup

1. **Start the backend server:**

   ```bash
   npm run dev      # Terminal 1
   ```

   Verify it's running: `curl http://localhost:5001/health`

2. **Run load test:**

   ```bash
   npm run test:perf    # Terminal 2
   ```

3. **Generate HTML report:**
   ```bash
   npm run test:perf:report
   ```
   Report is saved to: `tests/performance/report.json`

#### Load Test Configuration

**File:** `tests/performance/load-test.yml`

The test runs 3 phases to simulate realistic traffic patterns:

| Phase          | Duration | VU Range   | Purpose                                |
| -------------- | -------- | ---------- | -------------------------------------- |
| Warm-up        | 30 s     | 1 → 10     | Ramp up gradually, cache warm          |
| Sustained Load | 60 s     | 10 (const) | Normal operation baseline              |
| Spike          | 20 s     | 30 (peak)  | Test system under sudden traffic surge |

**Endpoints Tested:**

- `GET /health` (health check)
- `GET /api/v1/needs/getall` (fetch needs with filters)
- `GET /api/v1/items/available` (browse items)
- `POST /api/v1/auth/login` (authentication)

**Performance Thresholds:**

- Response time p95: < 500ms
- Error rate: < 1%
- Throughput: > 50 requests/sec

#### Interpreting Results

```
Summary report:
  Scenarios launched:  100
  Scenarios completed: 98
  Requests launched:   1,200
  Requests completed:  1,190

Response time (ms):
  min: 45
  max: 2,340
  p50: 120
  p95: 450
  p99: 1,200
```

High p95/p99 values indicate latency under peak load. Adjust database indexes or add caching if needed.

### CI/CD Testing (GitHub Actions)

Tests are configured to run in GitHub Actions with extended timeouts for slower CI environments:

- **Local Testing:** 60 second timeout
- **CI Testing:** 120 second timeout
- **Global Setup:** Database seeding before test suite runs

---

## Deployment

This section documents the deployment of both backend and frontend applications to production environments.

### Deployment Summary

| Component | Platform | Status    | Live URL                                |
| --------- | -------- | --------- | --------------------------------------- |
| Backend   | Render   | ✅ Active | `https://af-sliit-project.onrender.com` |
| Frontend  | Vercel   | ✅ Active | `https://af-sliit-project.vercel.app`   |

### Deployment Evidence

#### Backend Deployment (Render)

**Status:** ✅ Live and operational

**Evidence:** [Backend_server_log.png](Images/Backend_server_log.png)

- Build: ✅ Successful
- MongoDB: ✅ Connected
- Service: ✅ Live on port 5001
- Auto-deployment: ✅ Enabled

**Health Check:**

```bash
curl https://af-sliit-project.onrender.com/health
# Response: {"status":"ok","message":"Server is running","timestamp":"2026-04-10T..."}
```

#### Frontend Deployment (Vercel)

**Status:** ✅ Live and operational

**Evidence:** [Frontend.png](Images/Frontend.png) | [Frontend_logs.png](Images/Frontend_logs.png)

- Build: ✅ Successful (Vite)
- Deployment: ✅ Ready
- Domain: ✅ af-sliit-project.vercel.app
- Analytics: ✅ 26 edge requests

**Live App:** https://af-sliit-project.vercel.app

- Application Name: BridgeConnect
- Features: All functional (Donor Dashboard, Item Listings, Notifications)

---

### Backend Deployment Setup (Render)

#### Prerequisites

- Free or paid Render account
- GitHub repository with code
- All environment variables configured

#### Step-by-Step Setup

**1. Create a new Web Service on Render**

- Login to [Render Dashboard](https://dashboard.render.com)
- Click **New** → **Web Service**
- Select **Build and deploy from a Git repository**
- Connect your GitHub account and authorize Render
- Select the `AF_SLIIT_Project` repository
- Select `main` branch

**2. Configure the service**

- **Name:** `af-sliit-project`
- **Runtime:** `Node`
- **Region:** Choose closest to your users (e.g., Singapore, Mumbai)
- **Branch:** `main`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**3. Add environment variables**

In Render Dashboard → **Environment** tab, add all backend variables:

```
PORT=5001
NODE_ENV=production
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-jwt-secret>
CLOUDINARY_NAME=<cloudinary-cloud-name>
CLOUDINARY_KEY=<cloudinary-api-key>
CLOUDINARY_SECRET=<cloudinary-api-secret>
FIREBASE_PROJECT_ID=<firebase-project-id>
FIREBASE_PRIVATE_KEY=<firebase-private-key>
FIREBASE_CLIENT_EMAIL=<firebase-client-email>
OPENWEATHER_API_KEY=<openweather-api-key>
FRONTEND_URL=https://af-sliit-project.vercel.app
```

**4. Deploy**

- Click **Create Web Service**
- Render automatically builds and deploys
- Wait for "Your service is live" message
- Service accessible at: `https://af-sliit-project.onrender.com`

**5. Enable auto-deployment**

- Every push to `main` branch triggers automatic rebuild and deployment
- Monitor deployment status in Render Dashboard → **Events** tab

#### Render Configuration Details

| Setting               | Value                 |
| --------------------- | --------------------- |
| **Memory**            | Standard (0.5 GB)     |
| **CPU**               | Shared                |
| **Max Connections**   | 100                   |
| **Health Check URL**  | `/health`             |
| **Health Check Path** | Enable                |
| **Auto-Deploy**       | Enabled (on Git push) |

---

### Frontend Deployment Setup (Vercel)

#### Prerequisites

- Free or pro Vercel account
- GitHub repository connected to Vercel
- All VITE\_\* environment variables ready

#### Step-by-Step Setup

**1. Import project to Vercel**

- Login to [Vercel Dashboard](https://vercel.com/dashboard)
- Click **Add New** → **Project**
- Select **GitHub** (or connect account if not done)
- Choose `AF_SLIIT_Project` repository
- Click **Import**

**2. Configure build settings**

- **Framework:** React
- **Root Directory:** `frontend` ✅ (Auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**3. Add environment variables**

In Vercel Dashboard → **Settings** → **Environment Variables**, add:

```
VITE_API_URL=https://af-sliit-project.onrender.com/api/v1
VITE_FIREBASE_API_KEY=<firebase-web-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<firebase-auth-domain>
VITE_FIREBASE_PROJECT_ID=<firebase-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<firebase-storage-bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<firebase-sender-id>
VITE_FIREBASE_APP_ID=<firebase-app-id>
VITE_FIREBASE_VAPID_KEY=<firebase-vapid-key>
```

**4. Deploy**

- Click **Deploy**
- Vite builds the React application
- Deployment completes in ~2-3 minutes
- Live at: `https://af-sliit-project.vercel.app`

**5. Enable auto-deployment**

- Default: Every push to `main` branch auto-deploys
- Automatic git integration handles all deployments

#### Vercel Configuration Files

**`frontend/vercel.json`** - SPA Routing Configuration

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This ensures all client-side routes redirect to `index.html` for single-page app routing.

#### Vercel Settings Details

| Setting              | Value                       |
| -------------------- | --------------------------- |
| **Domains**          | af-sliit-project.vercel.app |
| **Environment**      | Production                  |
| **Auto-Deploy**      | Enabled on git push         |
| **Instant Rollback** | Available                   |
| **Analytics**        | Enabled (Web Vitals)        |
| **Speed Insights**   | Enabled                     |

---

### Production Environment Variables

> ⚠️ **SECURITY WARNING:** Never commit `.env` files or secrets to version control.

#### Backend Environment Variables

All variables should be set in **Render Dashboard → Environment** tab:

| Variable                | Type   | Notes                                                       |
| ----------------------- | ------ | ----------------------------------------------------------- |
| `PORT`                  | Number | Set to `5001` (Render assigns automatically if omitted)     |
| `NODE_ENV`              | String | Must be `production` for production deployment              |
| `MONGO_URI`             | Secret | MongoDB Atlas connection string (includes auth credentials) |
| `JWT_SECRET`            | Secret | Use strong random string (min 32 characters)                |
| `CLOUDINARY_NAME`       | String | From Cloudinary Dashboard                                   |
| `CLOUDINARY_KEY`        | Secret | From Cloudinary API Keys                                    |
| `CLOUDINARY_SECRET`     | Secret | From Cloudinary API Keys (keep private)                     |
| `FIREBASE_PROJECT_ID`   | String | From Firebase Console                                       |
| `FIREBASE_PRIVATE_KEY`  | Secret | From Firebase Service Account (include literal `\n`)        |
| `FIREBASE_CLIENT_EMAIL` | String | From Firebase Service Account                               |
| `OPENWEATHER_API_KEY`   | Secret | From OpenWeather API (free tier sufficient)                 |
| `FRONTEND_URL`          | String | Production frontend URL for CORS                            |

#### Frontend Environment Variables

All variables should be set in **Vercel Dashboard → Settings → Environment Variables** tab:

| Variable                            | Type   | Notes                                                  |
| ----------------------------------- | ------ | ------------------------------------------------------ |
| `VITE_API_URL`                      | String | Backend API base URL (use production Render URL)       |
| `VITE_FIREBASE_API_KEY`             | String | Web API key from Firebase Console                      |
| `VITE_FIREBASE_AUTH_DOMAIN`         | String | Firebase auth domain (e.g., `project.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID`          | String | Firebase project ID                                    |
| `VITE_FIREBASE_STORAGE_BUCKET`      | String | Firebase storage bucket                                |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | String | Firebase sender ID                                     |
| `VITE_FIREBASE_APP_ID`              | String | Firebase app ID                                        |
| `VITE_FIREBASE_VAPID_KEY`           | String | VAPID key for push notifications                       |

---

### Post-Deployment Checklist

After deployment, verify:

- [ ] Backend health check: `curl https://af-sliit-project.onrender.com/health`
- [ ] Frontend loads without 404 errors
- [ ] API calls work from frontend (check Network tab in DevTools)
- [ ] Authentication works (signup/login)
- [ ] File uploads work (Cloudinary integration)
- [ ] Push notifications work (Firebase FCM tested)
- [ ] Swagger docs load: `https://af-sliit-project.onrender.com/api-docs`

### Rolling Back Deployments

**Render:** Click **Deploys** → Select previous deployment → **Redeploy**  
**Vercel:** Click **Deployments** → Select previous build → Click **...** → **Promote to Production**

### Monitoring Deployed Applications

**Render:**

- Dashboard → **Metrics** tab: CPU, memory, requests
- Dashboard → **Logs** tab: Real-time application logs
- Dashboard → **Events** tab: Deployment history

**Vercel:**

- Dashboard → **Analytics** tab: Web Vitals, Core Web Performance
- Dashboard → **Logs** tab: Build and deployment logs
- Dashboard → **Observability** → **Speed Insights**: Page performance

---

## Team Contributions

The project was developed collaboratively by a team of four members. Each member contributed to specific components of the system:

### Team Structure

| Member      | Role                 | Components                 | Responsibilities                                                                         |
| ----------- | -------------------- | -------------------------- | ---------------------------------------------------------------------------------------- |
| **Venura**  | Backend Developer    | Auth & User Management     | JWT authentication, user signup/login/profile, NIC document verification, admin controls |
| **Lochana** | Backend Developer    | Needs & Donations          | Need request CRUD, donation flow (cash/card/goods), fulfillment tracking, filtering      |
| **Risini**  | Full-Stack Developer | Item Listings & Messaging  | Donor item listings, browse/search, image uploads, messaging system per item             |
| **Heyli**   | Frontend & Backend   | Feedback & Admin Dashboard | Feedback/reviews CRUD, admin statistics, OpenWeather API integration, dashboard UI       |

### Individual Contributions Summary

#### Venura - Authentication & User Management (40%)

- **Backend Services:**
  - User signup with validation (username, email, password)
  - JWT token generation and verification
  - Login with secure password hashing (bcryptjs)
  - Profile management (GET, UPDATE, DELETE)
  - Password reset functionality
  - Admin user management endpoints
  - NIC document upload and storage

- **Tests Written:**
  - `tests/Venura/server.test.js` - Server health checks & endpoints
  - `tests/Venura/authController.test.js` - Authentication flow testing
  - `tests/Venura/usermanagement.test.js` - Admin controls & RBAC testing

- **Commits:** Regular meaningful commits tracking auth feature development

#### Lochana - Needs & Donations (30%)

- **Backend Services:**
  - Need request creation with verification docs
  - Donation flow (cash, card, goods)
  - Donation confirmation and fulfillment tracking
  - Advanced filtering (category, urgency, status, location)
  - Pagination support for large datasets
  - Needs approval workflow

- **Tests Written:**
  - `tests/Lochana/needController.test.js` - Need CRUD & filtering

- **Commits:** Consistent commits for needs and donations features

#### Risini - Item Listings & Messaging (25%)

- **Backend Services:**
  - Item listing CRUD operations
  - Multi-image upload (up to 5 per listing) with Cloudinary
  - Item browsing with search and filters
  - Real-time style messaging per item
  - Conversation tracking

- **Tests Written:**
  - `tests/Risini/itemListingController.test.js` - Item CRUD & uploads
  - `tests/Risini/donationController.test.js` - Donation endpoint testing

- **Commits:** Regular updates for item and messaging features

#### Heyli - Feedback & Admin Dashboard (25%)

- **Backend Services:**
  - Feedback CRUD operations
  - Platform reviews submission
  - Admin dashboard statistics aggregation
  - OpenWeather API integration for location-based weather
  - User activity tracking

- **Frontend Work:**
  - Admin dashboard UI design
  - Statistics visualization
  - Feedback display components

- **Tests Written:**
  - `tests/Heyli/adminDash.test.js` - Dashboard stats calculation
  - `tests/Heyli/feedbackController.test.js` - Feedback CRUD testing

- **Commits:** Regular commits for feedback and admin features

---

## Git Workflow

All team members follow a standard Git workflow to ensure clean commit history and effective collaboration.

### Repository

- **URL:** https://github.com/venura449/AF_SLIIT_Project
- **Primary Branch:** `main`
- **Development Branch:** `develop` (when needed for feature integration)

### Commit Message Standards

Each commit follows the conventional commits format for clarity:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Viewing Commit History

```bash
# View all commits
git log --oneline

# View commits by author
git log --oneline --author="Venura"

# View commits for specific date range
git log --oneline --since="2026-02-27" --until="2026-04-12"

# View detailed commit information
git log -p --follow src/auth/authController.js
```

### Deployment Workflow

1. All changes merged to `main` branch
2. Tests pass in CI/CD pipeline
3. Automatic deployment to Render (backend) and Vercel (frontend)
4. Verify deployment health: `curl https://af-sliit-project.onrender.com/health`
