# BULDM Backend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [API Documentation](#api-documentation)
   - [Authentication](#authentication)
   - [Posts](#posts)
   - [Likes](#likes)
   - [Reposts](#reposts)
3. [Database Schema](#database-schema)
4. [Environment Variables](#environment-variables)
5. [Error Handling](#error-handling)
6. [Deployment](#deployment)
7. [Testing](#testing)

## Project Overview

BULDM (Bring Up Lost or Discovered Material) is a platform for managing lost and found items with AI-powered features and real-time communication capabilities. This documentation covers the backend implementation built with Node.js, Express, TypeScript, and MongoDB.

## API Documentation

### Base URL
All API routes are prefixed with `/api/v1`

### Authentication

#### Login
```http
POST /api/v1/auth/login
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "jwt.token.here",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### Posts

#### Create Post
```http
POST /api/v1/posts
```
**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (form-data):**
- `title`: String (required)
- `description`: String (required)
- `category`: String (optional)
- `location`: JSON string of location object (optional)
- `images[]`: Array of image files (optional)

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "post123",
    "title": "Lost Wallet",
    "description": "Black leather wallet lost near central park",
    "user": "user123",
    "createdAt": "2023-08-26T12:00:00Z"
  }
}
```

#### Get Post by ID
```http
GET /api/v1/posts/:id
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "post123",
    "title": "Lost Wallet",
    "description": "Black leather wallet lost near central park",
    "user": {
      "_id": "user123",
      "name": "John Doe"
    },
    "createdAt": "2023-08-26T12:00:00Z",
    "likes": 5,
    "reposts": 2
  }
}
```

### Likes

#### Like/Unlike Post
```http
POST /api/v1/posts/:postId/like
```
**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "postId": "post123",
    "liked": true,
    "totalLikes": 6
  }
}
```

### Comments

#### Add Comment
```http
POST /api/v1/posts/:postId/comments
```
**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "comment": "This is a comment on the post",
  "parentCommentId": "optional_parent_comment_id"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "comment123",
    "postId": "post123",
    "userId": "user123",
    "comment": "This is a comment on the post",
    "createdAt": "2023-08-26T12:00:00Z"
  }
}
```

#### Get Post Comments
```http
GET /api/v1/posts/:postId/comments
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "comment123",
      "postId": "post123",
      "user": {
        "_id": "user123",
        "name": "John Doe",
        "avatar": "avatar_url"
      },
      "comment": "This is a comment on the post",
      "createdAt": "2023-08-26T12:00:00Z",
      "replies": [
        {
          "_id": "reply123",
          "user": {
            "_id": "user456",
            "name": "Jane Smith",
            "avatar": "avatar_url"
          },
          "comment": "This is a reply to the comment",
          "createdAt": "2023-08-26T12:05:00Z"
        }
      ]
    }
  ]
}
```

### User Management

#### Get User Profile
```http
GET /api/v1/users/:userId
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "avatar_url",
    "bio": "Software Developer",
    "createdAt": "2023-01-01T00:00:00Z",
    "stats": {
      "posts": 15,
      "followers": 120,
      "following": 85
    }
  }
}
```

#### Update User Profile
```http
PATCH /api/v1/users/me
```
**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Updated",
  "bio": "Senior Software Developer",
  "private": false
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "user123",
    "name": "John Updated",
    "email": "john@example.com",
    "avatar": "avatar_url",
    "bio": "Senior Software Developer",
    "private": false,
    "updatedAt": "2023-08-26T12:00:00Z"
  }
}
```

### Reposts

#### Repost a Post
```http
POST /api/v1/posts/:postId/repost
```
**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "postId": "post123",
    "reposted": true,
    "totalReposts": 3
  }
}
```

## Database Schema

### User Schema
```typescript
{
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["admin", "user"], 
    default: "user" 
  },
  avatar: { 
    type: String, 
    default: "default_avatar_url" 
  },
  private: { 
    type: Boolean, 
    default: false 
  },
  backgroundImage: { 
    type: String, 
    default: "default_background_url" 
  },
  bio: { 
    type: String, 
    maxlength: 500 
  },
  verificationCode: String,
  forgotPasswordToken: String,
  verified: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}
```

### Comment Schema
```typescript
{
  postId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  comment: { 
    type: String, 
    required: true, 
    trim: true 
  },
  parentCommentId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}
```

### Post Schema
```typescript
{
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  category: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    coordinates: { type: [Number], index: '2dsphere' },
    placeName: String
  },
  predictedItems: [{
    label: String,
    confidence: Number,
    category: String
  }],
  images: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}
```

### Like Schema
```typescript
{
  postId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true 
  },
  usersIDs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/buldm

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
JWT_COOKIE_EXPIRES_IN=30

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
```

## Error Handling

The API returns errors in the following format:

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "statusCode": 400,
  "errors": [
    {
      "msg": "Specific error message",
      "param": "fieldName",
      "location": "body"
    }
  ]
}
```

### Common HTTP Status Codes
- `200 OK` - Request was successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Deployment

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
3. Set up environment variables (see [Environment Variables](#environment-variables))
4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Production Build

```bash
# Build the TypeScript code
npm run build

# Start the production server
npm start
```

## Testing

Run tests using the following command:

```bash
npm test
# or
yarn test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
