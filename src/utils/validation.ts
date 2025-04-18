import { body } from "express-validator";

export const registerValidation = [
	body("name").notEmpty().withMessage("name is required"),
	body("email").isEmail().withMessage("email is required"),
	body("password").notEmpty().withMessage("password is required"),
];

export const loginValidation = [
	body("email").isEmail().withMessage("email is required"),
	body("password").notEmpty().withMessage("password is required"),
];

export const verifyEmailValidation = [
	body("email").isEmail().withMessage("email is required"),
	body("code").notEmpty().withMessage("code is required"),
];

export const resendVerificationCode = [
	body("email").isEmail().withMessage("email is required"),
];

export const forgotPasswordValidation = [
	body("email").isEmail().withMessage("email is required"),
];

export const resetPasswordValidation = [
	body("email").isEmail().withMessage("email is required"),
	body("code").notEmpty().withMessage("code is required"),
	body("password").notEmpty().withMessage("password is required"),
];

export const postValidation = [
	body("title").notEmpty().withMessage("title is required"),
	body("description").notEmpty().withMessage("description is required"),
	body("status").notEmpty().withMessage("status is required"),
	// يمكن إضافة location و contactInfo في المستقبل إذا صارت مطلوبة
];
