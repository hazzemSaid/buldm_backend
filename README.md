# BULDM

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=nodedotjs)](https://nodejs.org/) 
[![TypeScript](https://img.shields.io/badge/TypeScript-v5+-3178C6?logo=typescript)](https://www.typescriptlang.org/) 
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/) 
[![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express)](https://expressjs.com/) 
[![Contributors](https://img.shields.io/github/contributors/hazzemSaid/buldm_backend)](https://github.com/hazzemSaid/buldm_backend/graphs/contributors) 
[![Forks](https://img.shields.io/github/forks/hazzemSaid/buldm_backend)](https://github.com/hazzemSaid/buldm_backend/network/members) 
[![Stars](https://img.shields.io/github/stars/hazzemSaid/buldm_backend)](https://github.com/hazzemSaid/buldm_backend/stargazers) 
[![Watchers](https://img.shields.io/github/watchers/hazzemSaid/buldm_backend)](https://github.com/hazzemSaid/buldm_backend/watchers) 

Backend service powering the **BULDM** (Bring Up Lost or Discovered Material) platform - a TypeScript/Express/MongoDB solution for lost/found item management with AI-powered features and real-time communication.

🔗 **Frontend Repository**: [buldm_frontend](https://github.com/hazzemSaid/buldm_frontend)

## 📋 Table of Contents
- [🚀 Key Features](#-key-features)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [🏗️ Project Structure](#%EF%B8%8F-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔧 Environment Variables](#-environment-variables)
- [🔌 Core API Endpoints](#-core-api-endpoints)
- [✅ Validation & Error Handling](#-validation--error-handling)
- [🤝 Contribution](#-contribution)
- [📜 License](#-license)

## 🚀 Key Features

### 🔐 Identity Management
- JWT authentication with refresh tokens
- Google OAuth 2.0 integration
- Email verification with Resend API
- Password strength validation & reset flow
- Role-based access control (Admin/User)

### 📦 Post Management
- **CRUD operations** for lost/found items
- **Geospatial queries** with 2dsphere indexes
- Status tracking: `lost` → `found` → `claimed`
- Category-based filtering & search
- Contact information masking

### 📸 Intelligent Processing
- **AI Item Prediction** via Hugging Face API
- **NSFW Detection** using nsfwjs
- Cloudinary media storage with Multer
- Automated content moderation

### 💬 Real-time System
- Socket.IO powered messaging
- User-to-user chat channels
- Message persistence with read receipts
- Notification system (OneSignal)

### ⚙️ Operational Excellence
- Swagger API documentation
- Rate limiting protection
- Reporting system for users/posts
- Fuse.js fuzzy user search
- Robust error handling

## 🛠️ Tech Stack
| Category          | Technologies                          |
|-------------------|---------------------------------------|
| **Core**          | Node.js, Express, TypeScript         |
| **Database**      | MongoDB, Mongoose                    |
| **Auth**          | JWT, OAuth2, bcrypt                  |
| **Realtime**      | Socket.IO                            |
| **AI Services**   | Hugging Face, nsfwjs                 |
| **Media**         | Cloudinary, Multer                   |
| **Validation**    | express-validator                    |
| **Communication** | Resend (Email), OneSignal (Push)     |
| **Utilities**     | Swagger, Fuse.js, Express Rate Limit |

## 🏗️ Project Structure
```bash
buldm_backend/
├── src/
│   ├── controllers/      # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # Express routers
│   ├── middleware/       # Auth, validation, etc.
│   ├── services/         # Business logic
│   ├── utils/            # Helpers & utilities
│   └── config/           # Configuration setup
├── public/               # Static assets
├── swagger/              # API documentation specs
├── .env.sample           # Environment template
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js v20+
- MongoDB Atlas cluster
- Cloudinary account
- Resend API key

```bash
# Clone repository
git clone https://github.com/hazzemSaid/buldm_backend.git
cd buldm_backend

# Install dependencies
npm install

# Build and run
npm run build
npm start

# Development mode (hot reload)
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file with:

```env
# ======== CORE ========
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/buldm
JWT_SECRET=your_secure_jwt_secret
REFRESH_TOKEN_SECRET=your_secure_refresh_secret

# ======== MEDIA ========
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# ======== SERVICES ========
RESEND_API_KEY=your_resend_key
SENDER_EMAIL=verified@email.com
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_API_KEY=your_onesignal_key
HUGGING_FACE_API_TOKEN=your_token
```
<img width="228" height="422" alt="Image" src="https://github.com/user-attachments/assets/11e369a1-ee1f-4212-b0a1-2cabe4172cd0" />

## 🔌 Core API Endpoints

| Method | Endpoint                        | Description                   | Auth |
|--------|---------------------------------|-------------------------------|------|
| POST   | /api/v1/user/register           | Register new user             | No   |
| POST   | /api/v1/user/login              | User login                    | No   |
| POST   | /api/v1/user/verify             | Verify email                  | No   |
| POST   | /api/v1/user/forgot-password    | Request password reset        | No   |
| POST   | /api/v1/user/reset-password     | Reset password                | No   |
| GET    | /api/v1/user/:id                | Get user by ID                | Yes  |
| PUT    | /api/v1/user/:id                | Update user profile           | Yes  |
| POST   | /api/v1/post                    | Create new post               | Yes  |
| GET    | /api/v1/post                    | Search posts (geo/status)     | Yes  |
| PUT    | /api/v1/post/:id                | Update post                   | Yes  |
| DELETE | /api/v1/post/:id                | Delete post                   | Yes  |
| POST   | /api/v1/report                  | Submit report                 | Yes  |
| POST   | /api/v1/chat                    | Initiate chat                 | Yes  |

> Most endpoints require `Authorization: Bearer <token>` header

## ✅ Validation & Error Handling

- Rigorous input validation via express-validator
- Unified error response format:

```json
{
  "status": "error",
  "error": "Descriptive message",
  "statuscode": 400,
  "data": null
}
```

- Centralized error handlers for:
  - Authentication failures
  - Permission errors
  - Database constraints
  - Rate limiting

## 🤝 Contribution

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📜 License

For usage and distribution terms, please contact the repository owner.
