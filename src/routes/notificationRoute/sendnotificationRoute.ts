import { Router } from "express";
import sendnotificationController from "../../controller/notificationController/notificationController";
import verifyToken from "../../middleware/verifyToken";

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management endpoints
 */

/**
 * @swagger
 * /api/v1/notification:
 *   post:
 *     summary: Send a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - message
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: The ID of the recipient
 *               message:
 *                 type: string
 *                 description: The notification message
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
const notificationRouter = Router();

notificationRouter.post("/",verifyToken, sendnotificationController.sendnotification);

export default {
	notificationRouter,
};
