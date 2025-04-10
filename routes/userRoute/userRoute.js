const userRoute = require('express').Router();
const controller = require('../../controller/userController/userController');
const { body } = require('express-validator');
const verifyToken = require('../../middleware/verifyToken');
const registerValidation = [
	body("name").notEmpty().withMessage("name is required"),
	body("email").isEmail().withMessage("email is required"),
	body("password").notEmpty().withMessage("password is required"),
];
const loginValidation = [
	body("email").isEmail().withMessage("email is required"),
	body("password").notEmpty().withMessage("password is required"),
]
userRoute.post("/register",registerValidation, controller.register).post("/login", loginValidation,controller.login).post(
	"/refreshtoken",verifyToken,
	controller.refreshToken
);

module.exports = userRoute;