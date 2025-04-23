import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import asyncWrapper from "../../middleware/asyncwrapper";
import sendNotificationService from "../../services/oneSignal";
import ErrorHandler from "../../utils/error";
const sendnotification = asyncWrapper(
	async (req: Request, res: Response, next: NextFunction) => {
		const error = validationResult(req);
		if (!error.isEmpty()) {
			const err = ErrorHandler.createError("validation error", 422, error.array());
			return next(err);
		}
		const { title, massage, token }: { title: string; massage: string; token?: string } = req.body;
		await sendNotificationService.sendNotificationService(
			title,
			massage,
		);
		res.status(200).json({
			status: "success",
			message: "Notification sent successfully",
		});

	}
);

export default { sendnotification };