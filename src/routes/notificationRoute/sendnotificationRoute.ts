import { Router } from "express";
import sendnotificationController from "../../controller/notificationController/notificationController";
const notificationRouter = Router();

notificationRouter.post("/", sendnotificationController.sendnotification);

export default {
	notificationRouter,
};
