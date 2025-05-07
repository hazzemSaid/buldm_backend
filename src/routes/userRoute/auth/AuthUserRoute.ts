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
	.post(
		"/resendverificationcode",
		resendVerificationCode,
		limit(5),
		controller.resendVerificationCode
	)
	.post(
		"/forgotpassword",
		limit(5),
		forgotPasswordValidation,
		controller.forgotPassword
	)
	.post("/verifycode", verifyEmailValidation, controller.verifyCode)
	.post("/resetpassword", resetPasswordValidation, controller.resetPassword);

export default AuthUserRoute;
