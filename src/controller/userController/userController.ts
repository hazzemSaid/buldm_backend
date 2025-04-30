import { NextFunction, Request, Response } from "express";
import asyncWrapper from "../../middleware/asyncwrapper";
import userModel from "../../model/userModel";
import ErrorHandler from "../../utils/error"; // استيراد الخطأ المخصص
// نوع خاص للخطأ مع كود حالة
import Fuse from "fuse.js";
export const getUser = asyncWrapper(
	async (req: Request, res: Response, next: NextFunction) => {
		const id = req.params.id;

		if (!id) {
			const err = ErrorHandler.createError("User ID is required", 400);
			return next(err);
		}

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
			keys: ['name'],         // ابحث داخل الاسم
			threshold: 0.7,         // درجة التقريب (0 = دقيق، 1 = مرن جدًا)
			distance: 100,          // المسافة القصوى بين الحروف
			ignoreLocation: true    // مش مهم مكان الكلمة
		};
		const fuse = new Fuse(user, options);
		const result = fuse.search(username);
		if (result.length === 0) {
			return res.status(404).json({
				success: false,
				message: "No users found"
			});
		}
		return res.status(200).json({
			success: true,
			users: result
		})
	}
);

export default {
	getUser,
	finduser_by_username,
}
