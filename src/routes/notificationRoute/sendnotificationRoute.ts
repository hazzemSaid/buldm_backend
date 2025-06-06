import { Router } from "express";
import sendnotificationController from "../../controller/notificationController/notificationController";
import verifyToken from "../../middleware/verifyToken";
const notificationRouter = Router();

notificationRouter.post("/",verifyToken, sendnotificationController.sendnotification);

export default {
	notificationRouter,
};
