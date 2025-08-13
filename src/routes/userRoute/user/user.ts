import { Router } from 'express';
import { param } from "express-validator";
import multer from "multer";
import path from 'path';
import usercontroller from '../../../controller/userController/userController';
import verifyToken from '../../../middleware/verifyToken';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

const router = Router();

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
 * /api/v1/user/ID/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/ID/:id', verifyToken, param('id').isString().withMessage('ID is required').trim(), usercontroller.getUser);

/**
 * @swagger
 * /api/v1/user/find/{username}:
 *   get:
 *     summary: Find user by username
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/find/:username', verifyToken, usercontroller.finduser_by_username);

/**
 * @swagger
 * /api/v1/user/ID/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put('/ID/:id', verifyToken, upload.single('avatar'), usercontroller.updateuser);

export default router;