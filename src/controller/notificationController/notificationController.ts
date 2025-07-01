import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import asyncWrapper from "../../middleware/asyncwrapper";
import sendNotificationService from "../../services/oneSignal";
import ErrorHandler from "../../utils/error";
const sendnotification = asyncWrapper(
	async (req: any, res: Response, next: NextFunction) => {
		const error = validationResult(req);
		if (!error.isEmpty()) {
			const err = ErrorHandler.createError("validation error", 422, error.array());
			return next(err);
		}
		if (req.user.role !== "admin") {
			const err = ErrorHandler.createError("you are not authorized", 403);
			return next(err);
		}
		const { title, message, token }: { title: string; message: string; token?: string } = req.body;
		await sendNotificationService.sendNotificationService(
			title,
			message,
		);
		res.status(200).json({
			status: "success",
			message: "Notification sent successfully",
		});

	}
);

export default { sendnotification };