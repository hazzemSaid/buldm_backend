import { Router } from "express";
import multer from "multer";
import path from "path";
import postController from "../../controller/postController/postController";
import verifyToken from "../../middleware/verifyToken";
import limiter from "../../utils/ratelimit";
import { postValidation } from "../../utils/validation";

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         description:
 *           type: string
 *           description: The description of the post
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the post was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the post was last updated
 */

// إعداد التخزين للصور باستخدام multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (_req, file, cb) {
    cb(null, "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management endpoints
 */

const postRouter = Router();

/**
 * @swagger
 *
 * /api/v1/post:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the post
 *               description:
 *                 type: string
 *                 description: The description of the post
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: The images for the post (up to 12)
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       422:
 *         description: Validation error
 */
postRouter
  .post(
    "/",
    upload.array("images", 12),
    postValidation,
    limiter(5),
    postController.createPost
  )
  /**
   * @swagger
   * /api/v1/post/{id}:
   *   get:
   *     summary: Get a post by ID
   *     tags: [Posts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The post ID
   *     responses:
   *       200:
   *         description: Post retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 post:
   *                   $ref: '#/components/schemas/Post'
   *       404:
   *         description: Post not found
   *       401:
   *         description: Unauthorized - missing or invalid token
   */
  .get("/:id", postController.getPostById)
  /**
   * @swagger
   * /api/v1/post:
   *   get:
   *     summary: Get all posts
   *     tags: [Posts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of posts per page
   *     responses:
   *       200:
   *         description: List of posts retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 posts:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Post'
   *                 totalPosts:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   *                 currentPage:
   *                   type: integer
   *       401:
   *         description: Unauthorized - missing or invalid token
   */
  .get("/", postController.getAllPosts)
  .put(
    "/:id",
    upload.array("images", 12),
    postValidation,
    postController.updatepost
  )
  .delete("/:id", postController.deletePostById)
  /**
   * @swagger
   * /api/v1/post/user/{id}:
   *   get:
   *     summary: Get all posts by user ID
   *     tags: [Posts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The user ID
   *       - in: header
   *         name: Authorization
   *         schema:
   *           type: string
   *         required: true
   *         description: Bearer token for authentication (Format - Bearer <token>)
   *     responses:
   *       200:
   *         description: List of posts for the specified user retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 posts:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Post'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *       404:
   *         description: User not found
   */
  .get("/user/:id", verifyToken, postController.getallpostByuserid);
export default postRouter;
