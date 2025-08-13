import { Router } from "express";
import controller from "../../../controller/userController/authuserController";
import verifyToken from "../../../middleware/verifyToken";
import limit from "../../../utils/ratelimit";
import {
	forgotPasswordValidation,
	googleauthtoken,
	loginValidation,
	registerValidation,
	resendVerificationCode,
	resetPasswordValidation,
	verifyEmailValidation,
} from "../../../utils/validation";

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         verificationCode:
 *           type: string
 *         verificationCodeExpires:
 *           type: string
 *           format: date-time
 *         resetPasswordToken:
 *           type: string
 *         resetPasswordExpires:
 *           type: string
 *           format: date-time
 */

const AuthUserRoute = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
AuthUserRoute.post("/register", registerValidation, controller.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 */
AuthUserRoute.post("/login", loginValidation, controller.login);

/**
 * @swagger
 * /api/v1/auth/refreshToken:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Unauthorized
 */
AuthUserRoute.post("/refreshToken", verifyToken, controller.refreshToken);

/**
 * @swagger
 * /api/v1/auth/verifyemail:
 *   post:
 *     summary: Verify email with code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid code
 */
AuthUserRoute.post("/verifyemail", verifyEmailValidation, controller.verifyEmail);

/**
 * @swagger
 * /api/v1/auth/resendverificationcode:
 *   post:
 *     summary: Resend verification code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification code resent
 *       429:
 *         description: Too many requests
 */
AuthUserRoute.post("/resendverificationcode", resendVerificationCode, limit(5), controller.resendVerificationCode);

/**
 * @swagger
 * /api/v1/auth/forgotpassword:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent
 *       429:
 *         description: Too many requests
 */
AuthUserRoute.post("/forgotpassword", limit(5), forgotPasswordValidation, controller.forgotPassword);

/**
 * @swagger
 * /api/v1/auth/verifycode:
 *   post:
 *     summary: Verify reset code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code verified
 *       400:
 *         description: Invalid code
 */
AuthUserRoute.post("/verifycode", verifyEmailValidation, controller.verifyCode);

/**
 * @swagger
 * /api/v1/auth/resetpassword:
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid input
 */
AuthUserRoute.post("/resetpassword", resetPasswordValidation, controller.resetPassword);

/**
 * @swagger
 * /api/v1/auth/google_auth:
 *   post:
 *     summary: Authenticate with Google
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google authentication successful
 *       400:
 *         description: Invalid token
 */
AuthUserRoute.post("/google_auth", googleauthtoken, controller.googleAuth);

export default AuthUserRoute;
