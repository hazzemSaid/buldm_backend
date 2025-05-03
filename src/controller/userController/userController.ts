import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import asyncWrapper from "../../middleware/asyncwrapper";
import userModel from "../../model/userModel";
import ErrorHandler from "../../utils/error"; // استيراد الخطأ المخصص
// نوع خاص للخطأ مع كود حالة
import Fuse from "fuse.js";
import fs from "fs";
import mongoose from "mongoose";
import cloudinary from "../../utils/cloudinaryService";

export const getUser = asyncWrapper(
	async (req: Request, res: Response, next: NextFunction) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const err = ErrorHandler.createError(
				"Validation error",
				422,
				errors.array()
			);
			return next(err);
		}
		const id = req.params.id;
		const user = await userModel.findById(id);

		if (!user) {
			const err = ErrorHandler.createError("User not found", 404);
			return next(err);
		}

		return res.status(200).json({
			success: true,
			user: user,
		});
	}
);
export const finduser_by_username = asyncWrapper(
	async (req: Request, res: Response, next: NextFunction) => {
		const username = req.params.username;
		const user = await userModel.find({}, { name: 1 });
		const options = {
			keys: ["name"], // ابحث داخل الاسم
			threshold: 0.7, // درجة التقريب (0 = دقيق، 1 = مرن جدًا)
			distance: 100, // المسافة القصوى بين الحروف
			ignoreLocation: true, // مش مهم مكان الكلمة
		};
		const fuse = new Fuse(user, options);
		const result = fuse.search(username);
		if (result.length === 0) {
			return res.status(404).json({
				success: false,
				message: "No users found",
			});
		}
		return res.status(200).json({
			success: true,
			users: result,
		});
	}
);
const updateuser = asyncWrapper(
	async (req: any, res: Response, next: NextFunction) => {
		//name
		//  avatar image
		const userid = new mongoose.Types.ObjectId(req.params.id);
		const user = await userModel.findById(userid);
		if (!user) {
			const err = ErrorHandler.createError("User not found", 404);
			return next(err);
		}
		user.name = req.body.name ?? user.name;
		if (req.file) {
			const result = await cloudinary.uploader.upload(req.file.path, {
				folder: "profile_images",
			});
			user.avatar = result.secure_url;
			await fs.unlinkSync(req.file.path);
		}
		await user.save();
		return res.status(200).json({
			success: true,
			user: user,
		});
	}
);
export default {
	getUser,
	finduser_by_username,
	updateuser,
};
