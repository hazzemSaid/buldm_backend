import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import fs from "fs";
import Fuse from "fuse.js";
import mongoose from "mongoose";
import asyncWrapper from "../../middleware/asyncwrapper";
import postModel from "../../model/postModel";
import cloudinary from "../../utils/cloudinaryService";
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
const hide = {
	allComments: 0,
	"user.role": 0,
	"user.createdAt": 0,
	"user.updatedAt": 0,
	"user.forgotPasswordToken": 0,
	"user.verificationCode": 0,
	"user.password": 0,
	"user.verified": 0,
	__v: 0,
}
interface RequestWithFiles extends Request {
	files?: Express.Multer.File[];
	user: { _id: string };
}

const createPost = asyncWrapper(
	async (req: any, res: Response, next: NextFunction) => {
		console.log(req.body);

		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			const err = ErrorHandler.createError(
				"Validation error",
				422,
				errors.array()
			);
			return next(err);
		}
		console.log(req.body);
		const {
			title,
			description,
			status,
			category = "",
			user,
			location = {} as Location, // Ensures default empty object if not provided
			predictedItems = [],
			contactInfo = "",
			when,
		} = req.body;
		// Handling coordinates
		let coordinates: number[] | null = null;
		if (
			Array.isArray(location?.coordinates) &&
			location.coordinates.length === 2 &&
			!isNaN(parseFloat(location.coordinates[0])) &&
			!isNaN(parseFloat(location.coordinates[1]))
		) {
			coordinates = location.coordinates.map((coord: string) =>
				parseFloat(coord)
			);
		}

		const placeName = location.placeName || "";

		const predictedItem: PredictedItem | null =
			Array.isArray(predictedItems) && predictedItems.length > 0
				? {
					label: predictedItems[0].label || "",
					confidence: parseFloat(predictedItems[0].confidence ?? "0.0"),
					category: predictedItems[0].category || "",
				}
				: null;
		const files = req.files as Express.Multer.File[];
		let images_RUL: string[] = [];

		for (let i = 0; i < files.length; i++) {
			const upload_image: any = await cloudinary.uploader.upload(
				files[i].path,
				{
					folder: "posts",
				}
			);
			images_RUL.push(upload_image.secure_url);
			fs.unlinkSync(files[i].path);

		}
		// Delete the file after uploading to Cloudinary

		const postData = {
			title,
			description,
			images: images_RUL,
			location: {
				type: "Point",
				coordinates: coordinates, // Assign coordinates if valid, else it will be null
				placeName: placeName,

			},
			when,
			status,
			category,
			predictedItems: predictedItem ? [predictedItem] : [],
			contactInfo,
			user_id: req.user._id,
			createdBy: user,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		// Creating the post
		const createdPost = await postModel.create(postData);
		const newPost = await postModel.aggregate([
			{
				$match: { _id: createdPost._id }
			},
			{
				$lookup: {
					from: "users",
					localField: "user_id",
					foreignField: "_id",
					as: "user"
				}
			},
			{
				$project: {
					"user.name": 1,
					"user.avatar": 1,
					"user.email": 1,
					"user.role": 1,
					"user.createdAt": 1,
					"user.updatedAt": 1,
					"title": 1,
					"description": 1,
					"images": 1,
					"location": 1,
					"when": 1,
					"status": 1,
					"category": 1,
					"predictedItems": 1,
					"contactInfo": 1,
					"user_id": 1,
					"createdBy": 1,
					"createdAt": 1,
					"updatedAt": 1

				}
			},
			// Likes
			{
				$lookup: {
					from: "likes",
					localField: "_id",
					foreignField: "postId",
					as: "likes"
				}
			},
			{
				$addFields: {
					likes: {
						count: { $size: { $ifNull: ["$likes.usersIDs", []] } },
						usersIDs: { $ifNull: ["$likes.usersIDs", []] },
						isLiked: false
					}
				}
			},
			// Comments
			{
				$lookup: {
					from: "comments",
					localField: "_id",
					foreignField: "postId",
					as: "comments"
				}
			},
			{
				$addFields: {
					comments: {
						count: { $size: "$comments" },
						recent: { $slice: ["$comments", 2] } // 👈 أول 2 كومنت فقط
					}
				}
			}
		]);



		return res.status(200).json({
			success: true,
			message: "Post created successfully",
			data: newPost,
		});
	}
);

const getPostById = asyncWrapper(
	async (req: Request, res: Response, next: NextFunction) => {
		const postId = req.params.id;
		if (!postId) {
			return res.status(400).json({
				success: false,
				message: "Post ID is required",
			});
		}

		const mongoose = require("mongoose");
		if (!mongoose.Types.ObjectId.isValid(postId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid Post ID format",
			});
		}

		const postWithAll = await postModel.aggregate([
			{ $match: { _id: new mongoose.Types.ObjectId(postId) } },

			// Join user
			{
				$lookup: {
					from: "users",
					localField: "user_id",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },

			// Likes
			{
				$lookup: {
					from: "likes",
					let: { pId: "$_id" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$postId", "$$pId"] } } },
						{ $project: { _id: 0, usersIDs: { $ifNull: ["$usersIDs", []] } } },
					],
					as: "likesDocs",
				},
			},
			{
				$set: {
					likesUsers: {
						$reduce: {
							input: "$likesDocs.usersIDs",
							initialValue: [],
							in: { $concatArrays: ["$$value", "$$this"] },
						},
					},
				},
			},
			{
				$set: {
					likes: {
						count: { $size: "$likesUsers" },
						usersIDs: "$likesUsers",
					},
				},
			},
			{ $project: { likesDocs: 0, likesUsers: 0 } },

			// Comments
			{
				$lookup: {
					from: "comments",
					let: { postId: "$_id" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
						{ $sort: { createdAt: -1 } },
						{ $limit: 2 },
					],
					as: "recentComments",
				},
			},
			{
				$lookup: {
					from: "comments",
					localField: "_id",
					foreignField: "postId",
					as: "allComments",
				},
			},
			{
				$addFields: {
					comments: {
						count: { $size: "$allComments" },
						recent: "$recentComments",
					},
				},
			},
			{
				$project: hide
			},
		]);

		if (!postWithAll || postWithAll.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Post not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Post retrieved successfully",
			data: postWithAll[0], // ✅ return one document
		});
	}
);

const getAllPosts = asyncWrapper(
	async (req: any, res: Response, next: NextFunction) => {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 2;
		const skip = (page - 1) * limit;

		// sort newest first
		const posts = await postModel.aggregate([
			{ $sort: { createdAt: -1 } },
			{ $skip: skip },
			{ $limit: limit },

			// user
			{
				$lookup: {
					from: "users",
					localField: "user_id",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },

			// total comments count
			{
				$lookup: {
					from: "comments",
					localField: "_id",
					foreignField: "postId",
					as: "allComments",
				},
			},
			{
				$addFields: {
					commentsCount: { $size: "$allComments" },
				},
			},
			{ $project: { allComments: 0 } }, // نخفي بس الـ allComments الكبيرة

			// last 10 comments
			{
				$lookup: {
					from: "comments",
					let: { postId: "$_id" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
						{ $sort: { createdAt: -1 } },
						{ $limit: 10 },
					],
					as: "recentComments",
				},
			},

			// likes
			{
				$lookup: {
					from: "likes",
					localField: "_id",
					foreignField: "postId",
					as: "likes",
				},
			},
			{
				$addFields: {
					likesCount: { $size: "$likes" },
				},
			},

			// clean response (ensure recentComments not hidden)
			{
				$project: {
					...hide,
				},
			},
		]);


		//   if (!posts || posts.length === 0) {
		// 	 const error = ErrorHandler.createError("No posts found", 404, "no data");
		// 	 return next(error);
		//   }

		return res.status(200).json({
			success: true,
			message: "Posts retrieved successfully",
			data: posts,
		});
	}
);


const deletePostById = asyncWrapper(
	async (req: any, res: Response, next: NextFunction) => {
		const postId = req.params.id;

		if (!postId) {
			const error = ErrorHandler.createError(
				"Post ID is required",
				400,
				"no data"
			);
			return next(error);
		}

		const post = await postModel.findById(postId);
		if (!post) {
			return res.status(404).json({
				success: false,
				message: "Post not found",
			});
		}

		console.log(post.user_id + " " + req.user._id);
		if (post.user_id?.toString() !== req.user._id.toString()) {
			const error = ErrorHandler.createError(
				"You are not authorized to delete this post",
				403,
				"no data"
			);
			return next(error);
		}

		await postModel.deleteOne({ _id: postId });
		return res.status(200).json({
			success: true,
			message: "Post deleted successfully",
		});
	}
);

const updatepost = asyncWrapper(
	async (req: any, res: Response, next: NextFunction) => {
		const postId = req.params.id;
		const updatedPost = req.body;
		const post = await postModel.findById(postId);
		if (!post) {
			const error = ErrorHandler.createError("Post not found", 404, "no data");
			return next(error);
		}
		if (!req.body) {
			const error = ErrorHandler.createError(
				"No data provided",
				400,
				"must add one or more fields"
			);
			return next(error);
		}
		if (post.user_id?.toString() !== req.user._id.toString()) {
			const error = ErrorHandler.createError(
				"You are not authorized to update this post",
				403,
				"no data"
			);
			return next(error);
		}
		if (req.files) {
			const files = req.files as Express.Multer.File[];
			let images_RUL: string[] = [];
			for (let i = 0; i < files.length; i++) {
				const upload_image: any = await cloudinary.uploader.upload(
					files[i].path,
					{
						folder: "posts",
					}
				);
				images_RUL.push(upload_image.secure_url);
				fs.unlinkSync(req.files[i].path);
			}
			updatedPost.images = images_RUL;
		}
		updatedPost.updatedAt = Date.now();
		const updatedPostData = await postModel.findByIdAndUpdate(
			postId,
			updatedPost,
			{ new: true }
		);

		return res.status(200).json({
			success: true,
			message: "Post updated successfully",
			data: updatedPostData,
		});
	}
);
const getallpostByuserid = asyncWrapper(
	async (req: any, res: Response, next: NextFunction) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			const err = ErrorHandler.createError(
				"Validation error",
				422,
				errors.array()
			);
			return next(err);
		}
		const userid = req.params.id;
		console.log(userid);
		const posts = await postModel.aggregate([
			{
				$match: { user_id: new mongoose.Types.ObjectId(userid) },
			},
			{
				$lookup: {
					from: "users",
					localField: "user_id",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				$unwind: "$user",
			},
			{
				$project: hide,
			},
			{
				$sort: { createdAt: -1 },
			},
			//like and comment
			{
				$lookup: {
					from: "likes",
					localField: "_id",
					foreignField: "postId",
					as: "likes",
				},
			},
			{
				$addFields: {
					likesCount: { $size: "$likes" },
				},
			},
			{
				$lookup: {
					from: "comments",
					localField: "_id",
					foreignField: "postId",
					as: "comments",
				},
			},
			{
				$addFields: {
					commentsCount: { $size: "$comments" },
				},
			},
		])
		if (!posts) {
			const error = ErrorHandler.createError("No posts found", 404, "no data");
			return next(error);
		}
		return res.status(200).json({
			success: true,
			message: "Posts retrieved successfully",
			data: posts,
		});
	}
);
// Get posts that the authenticated user has reposted
const getMyRepostedPosts = asyncWrapper(
	async (req: any, res: Response, next: NextFunction) => {
		try {
			const userId = req.user?._id;
			if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
				return res.status(401).json({ success: false, message: "Unauthorized" });
			}

			const posts = await postModel.aggregate([
				{ $match: { repost: { $in: [new mongoose.Types.ObjectId(userId)] } } },
				{ $sort: { createdAt: -1 } },
				{
					$lookup: {
						from: "users",
						localField: "user_id",
						foreignField: "_id",
						as: "user",
					},
				},
				{ $unwind: "$user" },
				{
					$lookup: {
						from: "likes",
						localField: "_id",
						foreignField: "postId",
						as: "likes",
					},
				},
				{ $addFields: { likesCount: { $size: "$likes" } } },
				{
					$lookup: {
						from: "comments",
						let: { postId: "$_id" },
						pipeline: [
							{ $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
							{ $sort: { createdAt: -1 } },
							{ $limit: 2 }
						],
						as: "comments",
					},
				},

				{ $addFields: { commentsCount: { $size: "$comments" } } },
				{ $addFields: { repostsCount: { $size: { $ifNull: ["$repost", []] } } } },
				{ $project: hide },
			]);

			return res.status(200).json({
				success: true,
				message: "Reposted posts retrieved successfully",
				data: posts,
			});
		} catch (err) {
			return next(err);
		}
	}
);
const getpostbydescription = asyncWrapper(async (req: any, res: any) => {
    const description = req.params.description;
    const user = await postModel.find({}, { description: 1 });
    const options = {
        keys: ["description"],
        includeScore: true,
        threshold: 0.4,
        distance: 100,
    };
    const fuse = new Fuse(user, options);
    const result = fuse.search(description);
    
    if (result.length === 0) {
        return res.status(200).json({
            success: true,
            posts: []
        });
    }
    
    const postIds = result.map(r => r.item._id);
    
    const posts = await postModel.aggregate([
        { $match: { _id: { $in: postIds } } },
        { $sort: { createdAt: -1 } },
        // user lookup
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: "$user" },
        // total comments count
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "postId",
                as: "allComments",
            },
        },
        {
            $addFields: {
                commentsCount: { $size: "$allComments" },
            },
        },
        { $project: { allComments: 0 } },
        // recent comments
        {
            $lookup: {
                from: "comments",
                let: { postId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
                    { $sort: { createdAt: -1 } },
                    { $limit: 10 },
                ],
                as: "recentComments",
            },
        },
        // likes
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "postId",
                as: "likes",
            },
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $gt: [{ $size: { $filter: { input: "$likes.usersIDs", as: "userId", cond: { $eq: ["$$userId", req.user?._id] } } } }, 0] },
                        then: true,
                        else: false
                    }
                }
            },
        },
        // clean response
        {
            $project: {
                ...hide,
            },
        },
    ]);

    return res.status(200).json({
        success: true,
        posts: posts,
    });
})
export default {
	createPost,
	deletePostById,
	getAllPosts,
	getPostById,
	updatepost,
	getallpostByuserid,
	getMyRepostedPosts,
	getpostbydescription
};
