import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import fs from 'fs';
import asyncWrapper from "../../middleware/asyncwrapper";
import postModel from "../../model/postModel";
import cloudinary from '../../utils/cloudinaryService';
import ErrorHandler from "../../utils/error";
// Define interface for location and predicted items
interface Location {
	coordinates?: [string, string];
	placeName?: string;
}

interface PredictedItem {
	label?: string;
	confidence?: number;
	category?: string;
}

interface RequestWithFiles extends Request {
	files?: Express.Multer.File[];
	user: { _id: string };
}

const createPost = asyncWrapper(async (req: any, res: Response, next: NextFunction) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const err = ErrorHandler.createError("Validation error", 422, errors.array());
		return next(err);
	}

	const {
		title,
		description,
		status,
		category = "",
		user,
		location = {} as Location,  // Ensures default empty object if not provided
		predictedItems = [],
		contactInfo = ""
	} = req.body;

	// Handling coordinates
	let coordinates: number[] | null = null;
	if (
		Array.isArray(location?.coordinates) &&
		location.coordinates.length === 2 &&
		!isNaN(parseFloat(location.coordinates[0])) &&
		!isNaN(parseFloat(location.coordinates[1]))
	) {
		coordinates = location.coordinates.map((coord: string) => parseFloat(coord));
	}

	const placeName = location.placeName || "";

	const predictedItem: PredictedItem | null = Array.isArray(predictedItems) && predictedItems.length > 0
		? {
			label: predictedItems[0].label || "",
			confidence: parseFloat(predictedItems[0].confidence ?? "0.0"),
			category: predictedItems[0].category || "",
		}
		: null;
	const files = req.files as Express.Multer.File[];
	let images_RUL: string[] = [];
	for (let i = 0; i < files.length; i++) {
		const upload_image: any = await cloudinary.uploader.upload(files[i].path, {
			folder: "posts",
		});
		images_RUL.push(upload_image.secure_url);
		fs.unlinkSync(req.files[i].path);
	}
	// Delete the file after uploading to Cloudinary
	const postData = {
		title,
		description,
		images: images_RUL,
		location: {
			type: "Point",
			coordinates: coordinates,  // Assign coordinates if valid, else it will be null
			placeName: placeName
		},

		status,
		category,
		predictedItems: predictedItem ? [predictedItem] : [],
		contactInfo,
		user_id: req.user._id,
		createdBy: user,
		createdAt: Date.now(),
		updatedAt: Date.now()
	};

	// Creating the post
	const newPost = await postModel.create(postData);

	return res.status(200).json({
		success: true,
		message: "Post created successfully",
		data: newPost,
	});
});

const getPostById = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
	const postId = req.params.id;
	if (!postId) {
		return res.status(400).json({
			success: false,
			message: "Post ID is required",
		});
	}

	const post = await postModel.findById(postId);
	if (!post) {
		return res.status(404).json({
			success: false,
			message: "Post not found",
		});
	}

	return res.status(200).json({
		success: true,
		message: "Post retrieved successfully",
		data: post,
	});
});

const getAllPosts = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
	const posts = await postModel.find();
	if (!posts) {
		const error = ErrorHandler.createError("No posts found", 404, "no data");
		return next(error);
	}

	return res.status(200).json({
		success: true,
		message: "Posts retrieved successfully",
		data: posts,
	});
});

const deletePostById = asyncWrapper(async (req: any, res: Response, next: NextFunction) => {
	const postId = req.params.id;
	if (!postId) {
		const error = ErrorHandler.createError("Post ID is required", 400, "no data");
		return next(error);
	}

	const post = await postModel.findByIdAndDelete(postId);
	if (!post) {
		return res.status(404).json({
			success: false,
			message: "Post not found",
		});
	}

	if (post.user_id !== req.user._id) {
		const error = ErrorHandler.createError("You are not authorized to delete this post", 403, "no data");
		return next(error);
	}

	return res.status(200).json({
		success: true,
		message: "Post deleted successfully",
	});
});

export default {
	createPost, deletePostById, getAllPosts, getPostById
};
