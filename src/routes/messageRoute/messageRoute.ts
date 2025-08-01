import express from "express";
const Message = require('../../model/messageModel');
// E:\buldm\backend\buldm\src\model\messageModel.ts

const router = express.Router();

router.get('/users/:userId', async (req, res) => {
	const userId = req.params.userId;
	try {
		// Group messages by the other user (either sender or receiver)
		const messages = await Message.find({
			$or: [{ from: userId }, { to: userId }],
		}).sort({ timestamp: -1 }); // Sort by most recent first

		// Create a map to organize messages by conversation partner
		const messagesByUser = new Map();

		messages.forEach((message: any) => {
			const otherUser = message.from === userId ? message.to : message.from;

			if (!messagesByUser.has(otherUser)) {
				messagesByUser.set(otherUser, []);
			}
			messagesByUser.get(otherUser).push(message);
		});

		// Convert map to array of conversations and sort by latest message
		const conversations = Array.from(messagesByUser.entries())
			.map(([otherUser, messages]) => ({
				user: otherUser,
				messages: messages.sort((a: any, b: any) => b.timestamp - a.timestamp) // Sort messages within each conversation
			}));
		res.json(conversations);
	} catch (error) {
		res.status(500).json({
			message: 'Internal server error',
		});
	}
})

router.get('/users/:user1/:user2', async (req, res) => {
	const { user1, user2 } = req.params;
	console.log(user1, user2);
	try {
		const messages = await Message.find({
			$or: [
				{ from: user1, to: user2 },
				{ from: user2, to: user1 }
			]
		}).sort({ timestamp: -1 }); // Sort by timestamp descending

		res.json(messages);
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
});


export default router;
