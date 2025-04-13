const { body } = require("express-validator");
const registerValidation = [
	body("name").notEmpty().withMessage("name is required"),
	body("email").isEmail().withMessage("email is required"),
	body("password").notEmpty().withMessage("password is required"),
];
const loginValidation = [
	body("email").isEmail().withMessage("email is required"),
	body("password").notEmpty().withMessage("password is required"),
];
const verifyEmailValidation = [
	body("email").isEmail().withMessage("email is required"),
	body("code").notEmpty().withMessage("code is required"),
];
const resendVerificationCode = [
	body("email").isEmail().withMessage("email is required"),
];
const forgotPasswordValidation = [
	body("email").isEmail().withMessage("email is required"),
];
const resetPasswordValidation = [
	body("email").isEmail().withMessage("email is required"),
	body("code").notEmpty().withMessage("code is required"),
	body("password").notEmpty().withMessage("password is required"),
];
const postValidation = [
	body("title").notEmpty().withMessage("title is required"),
	body("description").notEmpty().withMessage("description is required"),
	// body('location').notEmpty().withMessage('location is required'),
	body("status").notEmpty().withMessage("status is required"),
	// body('contactInfo').notEmpty().withMessage('contactInfo is required')
];
module.exports = {
	registerValidation,
	loginValidation,
	verifyEmailValidation,
	resendVerificationCode,
	forgotPasswordValidation,
	resetPasswordValidation,
	postValidation,

}