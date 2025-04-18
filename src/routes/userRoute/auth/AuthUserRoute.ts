import { Router } from "express";
import { body } from "express-validator";
import controller from "../../../controller/userController/authuserController";
import verifyToken from "../../../middleware/verifyToken";
import {
	registerValidation,
	loginValidation,
	verifyEmailValidation,
	resendVerificationCode,
	forgotPasswordValidation,
	resetPasswordValidation,
} from "../../../utils/validation";

const AuthUserRoute = Router();

AuthUserRoute
	.post("/register", registerValidation, controller.register)
	.post("/login", loginValidation, controller.login)
	.post("/refreshtoken", verifyToken, controller.refreshToken)
	.post("/verifyemail", verifyEmailValidation, controller.verifyEmail)
	.post("/resendverificationcode", resendVerificationCode, controller.resendVerificationCode)
	.post("/forgotpassword", forgotPasswordValidation, controller.forgotPassword)
	.post("/resetpassword", resetPasswordValidation, controller.resetpassword);

export default AuthUserRoute;
