import { Router } from "express";
import controller from "../../../controller/userController/authuserController";
import verifyToken from "../../../middleware/verifyToken";
import limit from "../../../utils/ratelimit";
import {
	forgotPasswordValidation,
	loginValidation,
	registerValidation,
	resendVerificationCode,
	resetPasswordValidation,
	verifyEmailValidation,
} from "../../../utils/validation";
const AuthUserRoute = Router();

AuthUserRoute
	.post("/register", registerValidation, controller.register)
	.post("/login", loginValidation, controller.login)
	.post("/refreshtoken", verifyToken, controller.refreshToken)
	.post("/verifyemail", verifyEmailValidation, controller.verifyEmail)
	.post("/resendverificationcode", resendVerificationCode, controller.resendVerificationCode)
	.post("/forgotpassword", limit(5), forgotPasswordValidation, controller.forgotPassword)
	.post("/resetpassword", resetPasswordValidation, controller.resetpassword);

export default AuthUserRoute;
