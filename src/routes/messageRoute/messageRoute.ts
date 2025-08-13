import express from "express";
const Message = require('../../model/messageModel');

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         from:
 *           type: string
 *         to:
 *           type: string
 *         message:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *     Conversation:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/chat/users/{userId}:
 *   get:
 *     summary: Get conversations for a user
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversation'
 *       500:
 *         description: Internal server error
 */
router.get('/users/:userId', async (req, res) => {
	const userId = req.params.userId;
	try {
		const messages = await Message.find({
			$or: [{ from: userId }, { to: userId }],
		}).sort({ timestamp: -1 });

		const messagesByUser = new Map();

		messages.forEach((message: any) => {
			const otherUser = message.from === userId ? message.to : message.from;

			if (!messagesByUser.has(otherUser)) {
				messagesByUser.set(otherUser, []);
			}
			messagesByUser.get(otherUser).push(message);
		});

		const conversations = Array.from(messagesByUser.entries())
			.map(([otherUser, messages]) => ({
				user: otherUser,
				messages: messages.sort((a: any, b: any) => b.timestamp - a.timestamp)
			}));
		res.json(conversations);
	} catch (error) {
		res.status(500).json({
			message: 'Internal server error',
		});
	}
});

/**
 * @swagger
 * /api/v1/chat/users/{user1}/{user2}:
 *   get:
 *     summary: Get messages between two users
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: user1
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: user2
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       500:
 *         description: Server error
 */
router.get('/users/:user1/:user2', async (req, res) => {
	const { user1, user2 } = req.params;
	console.log(user1, user2);
	try {
		const messages = await Message.find({
			$or: [
				{ from: user1, to: user2 },
				{ from: user2, to: user1 }
			]
		}).sort({ timestamp: -1 });

		res.json(messages);
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
});

export default router;
