import { NextFunction, Request, Response } from "express";
import asyncWrapper from "../../middleware/asyncwrapper";
import userModel from "../../model/userModel";
import ErrorHandler from "../../utils/error"; // استيراد الخطأ المخصص
// نوع خاص للخطأ مع كود حالة

const getUser = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
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
});

export { getUser };
