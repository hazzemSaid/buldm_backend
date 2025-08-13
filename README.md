# buldm_backend

Backend service powering a lost & found platform, built with **TypeScript**, **Express**, and **MongoDB**.  
Provides secure APIs for user authentication, lost/found item management, geolocation, notifications, and reporting.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Core API Endpoints](#core-api-endpoints)
- [Validation & Error Handling](#validation--error-handling)
- [Deployment](#deployment)
- [Contribution](#contribution)
- [License](#license)

---

## Features

- **User Authentication & Authorization**
  - Secure authentication using JWT
  - Role-based access control middleware
  - Password strength enforcement & email verification

- **User Management**
  - Register, login, profile update (including avatar upload)
  - Find user by ID or username

- **Lost & Found Post Management**
  - CRUD for posts with title, description, images, category, and location
  - Geospatial queries for location-based searching
  - Status tracking: lost, found, claimed
  - Contact info, predicted items, and more

- **Notifications**
  - Email notifications (e.g., for verification) via MailerSend integration

- **Reporting System**
  - Users can report posts or other users

- **Validation**
  - Rigorous input validation via express-validator for all endpoints

- **Robust Error Handling**
  - Consistent JSON error responses with status codes and messages

---

## Deployment

### Deploying to Vercel

This project is configured for deployment on Vercel. Follow these steps to deploy:

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Deploy to Vercel**
   ```bash
   vercel
   ```

5. **Set Environment Variables**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add all the required environment variables from `.env.example`

6. **Production Deployment**
   ```bash
   vercel --prod
   ```

The project is already configured with the necessary `vercel.json` file for proper routing and serverless function configuration.

- **Extensible & Modular**
  - Clean codebase with clear separation of concerns

---

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js (Express)
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT
- **Email:** MailerSend API
- **Validation:** express-validator
- **File Uploads:** multer
- **Geospatial:** MongoDB 2dsphere indexes

---

## Getting Started

```bash
git clone https://github.com/hazzemSaid/buldm_backend.git
cd buldm_backend
npm install
```

### Build & Run

```bash
npm run build         # Compile TypeScript
npm start             # Start the production server
# or, for development:
npm run dev
```

---

## Environment Variables

Create a `.env` file with:

```env
PORT=3000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
api_mailsender=your_mailersend_api_key
sender_email=your_verified_sender_email
```

---

## Project Structure

```
src/
  app.ts                        # Main Express setup
  middleware/                   # Auth, error, async wrappers, etc.
  model/                        # Mongoose schemas (Post, User, etc.)
  routes/
    postRoute/                  # Post CRUD endpoints
    userRoute/                  # User auth & profile endpoints
    notificationRoute/          # Notification endpoints
    reportRoute/                # Report endpoints
  utils/                        # Validation, error, mailer logic
  uploads/, static/             # Uploaded files and static content
```

---

## Core API Endpoints

| Method | Endpoint                             | Description                                 | Auth |
|--------|--------------------------------------|---------------------------------------------|------|
| POST   | `/api/v1/user/register`              | Register new user                           | No   |
| POST   | `/api/v1/user/login`                 | User login                                  | No   |
| POST   | `/api/v1/user/verify`                | Verify email                                | No   |
| POST   | `/api/v1/user/forgot-password`       | Request password reset                      | No   |
| POST   | `/api/v1/user/reset-password`        | Reset password                              | No   |
| GET    | `/api/v1/user/:id`                   | Get user by ID                              | Yes  |
| PUT    | `/api/v1/user/:id`                   | Update user (name, avatar, etc.)            | Yes  |
| GET    | `/api/v1/user/find/:username`        | Find user by username                       | Yes  |
| POST   | `/api/v1/post`                       | Create a new post                           | Yes  |
| GET    | `/api/v1/post`                       | List/search posts (location/query/status)    | Yes  |
| PUT    | `/api/v1/post/:id`                   | Update post                                 | Yes  |
| DELETE | `/api/v1/post/:id`                   | Delete post                                 | Yes  |
| POST   | `/api/v1/notification`               | Send notification (email, etc.)             | No   |
| POST   | `/api/v1/report`                     | Submit a report                             | Yes  |

*Many endpoints require an `Authorization: Bearer <token>` header.*

---

## Validation & Error Handling

- All requests are validated (`express-validator`) for required fields, email/password format, etc.
- Errors are returned in a unified JSON format:
  ```json
  {
    "status": "error",
    "error": "Error message",
    "statuscode": 400,
    "data": "no data"
  }
  ```
- Centralized error and "not found" handlers for reliability.

---

## Contribution

Contributions are welcome!  
Please fork, open issues, or submit PRs for new features, bug fixes, or improvements.

---

## License

_No license file provided yet. For usage or distribution, contact the repository owner._

---

> **Note:** This README is based on an automated scan of the codebase. For full details, review the code in the [GitHub repository](https://github.com/hazzemSaid/buldm_backend).
