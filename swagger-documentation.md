# Swagger API Documentation Guide

## Overview

This guide explains how to document your API endpoints using Swagger JSDoc annotations in your BULDM application. The Swagger configuration has been updated to read both route and controller files for generating API documentation.

## How to Document API Endpoints

You can add Swagger JSDoc annotations to your controller files to document your API endpoints. Here's how to do it:

### 1. Define Schemas

First, define the schemas for your data models at the top of your controller files:

```javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     ModelName:
 *       type: object
 *       required:
 *         - requiredField1
 *         - requiredField2
 *       properties:
 *         field1:
 *           type: string
 *           description: Description of field1
 *         field2:
 *           type: number
 *           description: Description of field2
 */
```

### 2. Document Endpoints

Add documentation for each endpoint before the function that handles it:

```javascript
/**
 * @swagger
 * /api/v1/path/to/endpoint:
 *   post: (or get, put, delete, etc.)
 *     summary: Short description of what this endpoint does
 *     tags: [CategoryName]
 *     parameters: (for GET requests with URL parameters)
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The resource ID
 *     requestBody: (for POST, PUT requests)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requiredField
 *             properties:
 *               field1:
 *                 type: string
 *               field2:
 *                 type: number
 *     responses:
 *       200:
 *         description: Success response description
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ModelName'
 *       400:
 *         description: Error response description
 */
```

### 3. Common Tags

Organize your endpoints using tags:

```javascript
/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication endpoints
 *   - name: Posts
 *     description: Post management endpoints
 *   - name: Reports
 *     description: Report management endpoints
 */
```

## Examples

Examples have been added to the `authuserController.ts` file for the following endpoints:

1. `/api/v1/user/auth/register` - User registration
2. `/api/v1/user/auth/login` - User login
3. `/api/v1/user/auth/google_auth` - Google authentication

You can use these as templates for documenting the rest of your API endpoints.

## Accessing the API Documentation

After adding documentation to your controllers, you can access the Swagger UI at:

```
http://localhost:3000/api-docs
```

## Tips

1. Be consistent with your documentation style across all endpoints
2. Document all possible response codes
3. Use schemas to avoid repeating the same data structures
4. Group related endpoints under the same tag
5. Include authentication requirements for protected endpoints

```javascript
/**
 * @swagger
 * /api/v1/protected/endpoint:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     ...
 */
```

## Security Definitions

Add this to your main controller file to define authentication methods:

```javascript
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
```