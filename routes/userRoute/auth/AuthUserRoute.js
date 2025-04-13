const AuthUserRoute = require("express").Router();
const controller = require("../../../controller/userController/authuserController");
const { body } = require("express-validator");
const verifyToken = require("../../../middleware/verifyToken");
const {
	registerValidation,
	loginValidation,
	verifyEmailValidation,
	resendVerificationCode,
	forgotPasswordValidation,
	resetPasswordValidation,
} = require("../../../utils/validation");
AuthUserRoute
	.post("/register", registerValidation, controller.register)
	.post("/login", loginValidation, controller.login)
	.post("/refreshtoken", verifyToken, controller.refreshToken)
	.post("/verifyemail", verifyEmailValidation, controller.verifyEmail)
	.post(
		"/resendverificationcode",
		resendVerificationCode,
		controller.resendVerificationCode
	)
	.post("/forgotpassword", forgotPasswordValidation, controller.forgetpassword)
	.post("/resetpassword", resetPasswordValidation, controller.resetpassword);

module.exports = AuthUserRoute;
