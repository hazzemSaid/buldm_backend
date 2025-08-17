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
		
		const { title, message, token, toPlayerId, sender, senderId, senderName, senderAvatar, androidChannelId, androidSound }:
			{ title: string; message: string; token?: string; toPlayerId?: string; sender?: { id?: string | number; name?: string; avatar?: string }; senderId?: string | number; senderName?: string; senderAvatar?: string; androidChannelId?: string; androidSound?: string } = req.body;

		const playerId = token || toPlayerId; // support either field name

		// Build data from either nested sender object or top-level fields
		const rawData: Record<string, any> = {
			type: 'chat',
			senderId: sender?.id ?? senderId,
			senderName: sender?.name ?? senderName,
			senderAvatar: sender?.avatar ?? senderAvatar,
			deeplink: '/chat',
			androidChannelId,
			androidSound,
		};

		// Remove undefined/null keys so OneSignal doesn't receive them
		const data = Object.fromEntries(
			Object.entries(rawData).filter(([, v]) => v !== undefined && v !== null)
		);

		// Sanitize android fields and default sound if not provided
		const sanitize = (v: any) => (v === undefined || v === null || v === '' || v === 'undefined' || v === 'null' ? undefined : v);

		// Build final payload for logging/debugging per request (omit undefined)
		const finalPayload = Object.fromEntries(Object.entries({
			title,
			message,
			token: playerId,
			senderId: rawData.senderId,
			senderName: rawData.senderName,
			senderAvatar: rawData.senderAvatar,
			android_channel_id: "2e83d57c-8760-46da-8f76-8708012e0cbe",
			android_sound: "sound",
			data,
		}).filter(([, v]) => v !== undefined));
		console.log('Sending OneSignal notification with payload:', finalPayload);

		await sendNotificationService.sendNotificationService(
			title,
			message,
			playerId,
			data,
			"2e83d57c-8760-46da-8f76-8708012e0cbe",
			"sound",
		);
		res.status(200).json({
			status: "success",
			message: "Notification sent successfully",
		});

	}
);

export default { sendnotification };