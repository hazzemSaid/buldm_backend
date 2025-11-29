# BULDM API Reference

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Posts](#posts)
4. [Comments](#comments)
5. [Likes](#likes)
6. [Reposts](#reposts)
7. [Messages](#messages)
8. [Reports](#reports)
9. [Status](#status)
10. [Image Prediction](#image-prediction)
11. [Notifications](#notifications)

## Authentication

### Login
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

### Register
```http
POST /api/v1/auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

## Users

### Get User Profile
```http
GET /api/v1/users/:userId
```

### Update Profile
```http
PATCH /api/v1/users/me
```
**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Posts

### Create Post
```http
POST /api/v1/posts
```
**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Get All Posts
```http
GET /api/v1/posts
```

### Get Post by ID
```http
GET /api/v1/posts/:id
```

### Update Post
```http
PUT /api/v1/posts/:id
```

### Delete Post
```http
DELETE /api/v1/posts/:id
```

## Comments

### Add Comment
```http
POST /api/v1/posts/:postId/comments
```
**Request Body:**
```json
{
  "comment": "This is a comment"
}
```

### Get Post Comments
```http
GET /api/v1/posts/:postId/comments
```

## Likes

### Like/Unlike Post
```http
POST /api/v1/posts/:postId/like
```

### Get Post Likes
```http
GET /api/v1/posts/:postId/likes
```

## Reposts

### Repost a Post
```http
POST /api/v1/posts/:postId/repost
```

### Get Reposts
```http
GET /api/v1/posts/:postId/reposts
```

## Messages

### Send Message
```http
POST /api/v1/messages
```
**Request Body:**
```json
{
  "to": "recipientId",
  "message": "Hello!"
}
```

### Get Conversation
```http
GET /api/v1/messages/:userId
```

## Reports

### Report Content
```http
POST /api/v1/reports
```
**Request Body:**
```json
{
  "type": "post",
  "id": "post123",
  "reason": "Inappropriate content"
}
```

## Status

### Create Status
```http
POST /api/v1/status
```
**Request Body:**
```json
{
  "status": "active",
  "text": "Feeling great today!"
}
```

## Image Prediction

### Predict Image Content
```http
POST /api/v1/predict/image
```
**Request Headers:**
```
Content-Type: multipart/form-data
```

## Notifications

### Get Notifications
```http
GET /api/v1/notifications
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    {
      "msg": "Invalid email",
      "param": "email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Please authenticate"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Post not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Something went wrong"
}
```

## Rate Limiting
- All endpoints are rate limited
- Default limit: 100 requests per 15 minutes
- Exceeding the limit will result in a 429 Too Many Requests response

## Authentication
- Most endpoints require authentication
- Include the JWT token in the Authorization header:
  ```
  Authorization: Bearer <token>
  ```

## Pagination
Endpoints that return lists support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)

Example:
```
GET /api/v1/posts?page=2&limit=20
```

## Sorting
Some endpoints support sorting:
- `sort`: Field to sort by
- `order`: `asc` or `desc` (default: `desc`)

Example:
```
GET /api/v1/posts?sort=createdAt&order=asc
```

## Filtering
Endpoints that return lists may support filtering:
```
GET /api/v1/posts?status=open&category=electronics
```
