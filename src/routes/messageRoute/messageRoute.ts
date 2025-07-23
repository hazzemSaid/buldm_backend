import express from "express";
const Message = require('../../model/messageModel');
// E:\buldm\backend\buldm\src\model\messageModel.ts

const router = express.Router();

router.get('/users/:userId', async (req, res) => {
	const userId = req.params.userId;
	try {
		const messages = await Message.find({
			$or: [{ from: userId }, { to: userId }],
		});
		res.json(messages);
	} catch (error) {
		res.status(500).json({
			message: 'Internal server error',
		});
	}
})

router.get('/users/:user1/:user2', async (req, res) => {
	const { user1, user2 } = req.params;
	console.log(user1,user2);
	try {
		const messages = await Message.find({
			$or: [
				{ from: user1, to: user2 },
				{ from: user2, to: user1 }
			]
		}).sort({ timestamp: 1 }); // الترتيب حسب الزمن

		res.json(messages);
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
});


export default router;
