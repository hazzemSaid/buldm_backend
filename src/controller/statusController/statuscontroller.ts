import console from "console";
import fs from "fs";
import mongoose from "mongoose";
import asyncWrapper from "../../middleware/asyncwrapper";
import statusModel from "../../model/statusModel";
import cloudinary from "../../utils/cloudinaryService";
import ErrorHandler from "../../utils/error";
export const createStatus = asyncWrapper(async (req: any, res: any) => {
	if (!req.file) {
		const err = ErrorHandler.createError("No image file provided", 400, {});
		return res.status(400).json({ message: err.message });
	}

	const { text } = req.body;
	if (!text?.trim()) {
		const err = ErrorHandler.createError("Status text is required", 400, {});
		return res.status(400).json({ message: err.message });
	}

	try {
		const image = req.file;
		const userId = req.user._id;

		const uploadResult = await cloudinary.uploader.upload(image.path, {
			folder: "status_images",
			resource_type: 'auto'
		});

		try {
			await fs.promises.unlink(image.path);
		} catch (cleanupError) {
			console.error('Failed to delete temporary file:', cleanupError);
			const err = ErrorHandler.createError("Failed to delete temporary file", 500, cleanupError);
			return res.status(500).json({ message: err.message });
		}

		const status = await statusModel.create({
			userId,
			text: text,
			status: uploadResult.secure_url,
			expiresAt: new Date(Date.now() +1000 * 60),
		});

		res.status(201).json({
			success: true,
			data: status
		});
	} catch (error: any) {
		// Handle duplicate key error
		if (error.code === 11000) {
			const err = ErrorHandler.createError("Duplicate status detected", 409, error);
			return res.status(409).json({
				success: false,
				message: err.message
			});
		}

		// Handle validation errors
		if (error.name === 'ValidationError') {
			const messages = Object.values(error.errors).map((val: any) => val.message);
			const err = ErrorHandler.createError("Validation Error", 400, messages);
			return res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors: messages
			});
		}

		// Handle Cloudinary errors
		if (error.http_code) {
			const err = ErrorHandler.createError("Failed to upload image to cloud storage", 500, error);
			return res.status(500).json({
				success: false,
				message: err.message
			});
		}

		// Generic error handler
		const err = ErrorHandler.createError("Failed to create status", 500, error);
		res.status(500).json({
			success: false,
			message: err.message
		});
	}
});
export const getStatus = asyncWrapper(async (req: any, res: any) => {
	let { limit, page } = req.query;
	if(!limit){
		limit = 10;
	}
	if(!page){
		page = 0;
	}
	try {
		const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
		const statuses = await statusModel.aggregate([
			{
				$match: {
					createdAt: { $gt: oneDayAgo },
					expiresAt: { $gt: new Date() }
				}
			},
			{
				$lookup: {
					from: 'users',
					localField: 'userId',
					foreignField: '_id',
					as: 'user'
				}
			},
			{
				$unwind: '$user'
			},
			{
				$project: {
					_id: 1,
					userId: '$user._id',
					status: 1,
					text: 1,
					createdAt: 1,
					expiresAt: 1,
					user: {
						_id: '$user._id',
						username: '$user.username',
						avatar: '$user.avatar',
						name: '$user.name',
						email: '$user.email',
						
					}
				}
			}
			, {
				$skip: Number(page) * Number(limit)
			}, {
				$limit: Number(limit)
			}
		]).sort({ createdAt: -1 });

		if (!statuses || statuses.length === 0) {
			return res.status(200).json({
				success: true,
				message: 'No statuses found',
				data: []
			});
		}

		res.status(200).json({
			success: true,
			count: statuses.length,
			data: statuses
		});
	} catch (error) {
		const err = ErrorHandler.createError("Failed to fetch statuses", 500, error as any);
		res.status(500).json({
			success: false,
			message: err.message
		});
	}
});

export const deleteStatus = asyncWrapper(async (req: any, res: any) => {
	const { id } = req.params;

	if (!id.match(/^[0-9a-fA-F]{24}$/)) {
		const err = ErrorHandler.createError("Invalid status ID format", 400, {});
		return res.status(400).json({
			success: false,
			message: err.message
		});
	}

	try {
		const status = await statusModel.findById(id);

		if (!status) {
			const err = ErrorHandler.createError("Status not found", 404, {});
			return res.status(404).json({
				success: false,
				message: err.message
			});
		}

		if (req.user._id.toString() !== status.userId.toString()) {
			const err = ErrorHandler.createError(
				"You are not authorized to delete this status",
				403,
				{}
			);
			return res.status(403).json({
				success: false,
				message: err.message
			});
		}



		await statusModel.findByIdAndDelete(id);

		res.status(200).json({
			success: true,
			message: "Status deleted successfully"
		});
	} catch (error) {
		const err = ErrorHandler.createError("Failed to delete status", 500, error as any);
		res.status(500).json({
			success: false,
			message: err.message
		});
	}
});

export const getStatusById = asyncWrapper(async (req: any, res: any) => {
	const { user_id } = req.params;

	if (!user_id.match(/^[0-9a-fA-F]{24}$/)) {
		const err = ErrorHandler.createError("Invalid user ID format", 400, {});
		return res.status(400).json({
			success: false,
			message: err.message
		});
	}

	try {
		const result = await statusModel.aggregate([
			{
			  $match: {
				 userId: new mongoose.Types.ObjectId(user_id),
				 expiresAt: { $gt: new Date() },
			  }
			},
			{
			  $lookup: {
				 from: 'users',
				 localField: 'userId',
				 foreignField: '_id',
				 as: 'user'
			  }
			},
			{ $unwind: '$user' },
			{
			  $project: {
				 _id: 1,
				 status: 1,
				 text: 1,
				 createdAt: 1,
				 expiresAt: 1,
				 user: {
					_id: '$user._id',
					username: '$user.username',
					avatar: '$user.avatar',
					name: '$user.name',
					email: '$user.email'
				 }
			  }
			}
		 ]);
		 

		
		console.log(await statusModel.listIndexes())
		res.status(200).json({
			success: true,
			data: result[0] ?? []
		});
	} catch (error) {
		const err = ErrorHandler.createError("Failed to fetch status", 500, error);
		res.status(500).json({
			success: false,
			message: err.message 
		});
	}
});
