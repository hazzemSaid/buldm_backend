import { NextFunction } from 'express';
import asyncWrapper from '../../../middleware/asyncwrapper';
import commentModel from '../../../model/comments';

const createComment = asyncWrapper(async (req: any, res: any, next: NextFunction) => {
	const { postId } = req.params;
	const { comment } = req.body;
	const userId = req.user._id;
	const result = await commentModel.create({
		postId,
		userId,
		comment,
		parentCommentId: null,
	});
	return res.status(200).json({
		"status": "successfly",
		"data": result
	});
});

const getallcommentbypostid = asyncWrapper(async (req: any, res: any, next: NextFunction) => {
	const { postId } = req.params;
	const page = parseInt(req.query.page) || 2;
	const limit = parseInt(req.query.limit) || 10;
	const skip = (page - 1) * limit;
	const result = await commentModel.find({ postId }).sort({ createdAt: -1 }).limit(limit).skip(skip);
	return res.status(200).json({
		"status": "successfly",
		'data': result
	});
});

const replyComment = asyncWrapper(async (req: any, res: any, next: NextFunction) => {
	const { postId, parentCommentId } = req.params;
	const { comment } = req.body;
	const userId = req.user._id;
	const result = await commentModel.create({
		postId,
		userId,
		comment,
		parentCommentId: parentCommentId
	});
	return res.status(200).json({
		"status": "successfly",
		"data": result
	});
});

const deleteComment = asyncWrapper(async (req: any, res: any, next: NextFunction) => {
	const { postId } = req.params;
	const { commentId } = req.body;
	const result = await commentModel.deleteOne({ postId, commentId });
	return res.status(200).json({
		"status": "successfly",
		"data": result
	});
});

const updateComment = asyncWrapper(async (req: any, res: any, next: NextFunction) => {
	const { postId } = req.params;
	const { commentId } = req.body;
	const result = await commentModel.updateOne({ postId, commentId }, { comment: req.body.comment });
	return res.status(200).json({
		"status": "successfly",
		"data": result
	});
});

export default { createComment, getallcommentbypostid, replyComment, deleteComment, updateComment };
