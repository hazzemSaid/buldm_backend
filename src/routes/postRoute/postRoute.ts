import { Router } from "express";
import multer from "multer";
import path from "path";
import commentController from "../../controller/postController/commentController/commentController";
import likeController from "../../controller/postController/likeController/likeController";
import postController from "../../controller/postController/postController";
import repostController from "../../controller/postController/repostController/repostcontroller";
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
  destination: (req, file, cb) => {
    cb(null, '/tmp'); // writeable directory in Vercel
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
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
  ).get("/:postId/like",
    likeController.getalllikebypostid
  ).post('/:postId/like',likeController.addliketopostbyuserid)
  .get('/:postId/comment',commentController.getallcommentbypostid)
  .post('/:postId/comment',commentController.createComment)
  .post('/:postId/comment/:parentCommentId',commentController.replyComment)
  .delete('/:postId/comment/:commentId',commentController.deleteComment)
  .put('/:postId/comment/:commentId',commentController.updateComment)
.post('/:postId/repost',repostController.addtorepostuser)
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
  .get("/", postController.getAllPosts);

/**
 * @swagger
 * /api/v1/post/{id}:
 *   put:
 *     summary: Update a post by ID
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
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
postRouter.put("/:id", upload.array("images", 12), postValidation, postController.updatepost);

/**
 * @swagger
 * /api/v1/post/{id}:
 *   delete:
 *     summary: Delete a post by ID
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
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
postRouter.delete("/:id", postController.deletePostById);

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
postRouter.get("/user/:id", postController.getallpostByuserid);
postRouter.get("/user/:id/repost", postController.getMyRepostedPosts);
postRouter.get("/description/:description", postController.getpostbydescription);
export default postRouter;
