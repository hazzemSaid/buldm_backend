import bcrypt from "bcryptjs";
import devenv from "dotenv";
import { validationResult } from "express-validator";
import JWT from "jsonwebtoken";
import mongoose from "mongoose";
import asyncWrapper from "../../middleware/asyncwrapper";
import userModel from "../../model/userModel";
import ErrorHandler from "../../utils/error";
import sendemail from "../../utils/mailersend";

devenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

const register = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body;

  const olduser = await userModel.findOne({ email: email });
  if (olduser) {
    const err = ErrorHandler.createError("user already exists", 422, {});
    return next(err);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = ErrorHandler.createError("validation error", 422, errors.array());
    return next(err);
  }
  const code: string = Math.floor(100000 + Math.random() * 900000).toString();

  // const mail = await sendVerificationEmail(email, code);
  try {
    await sendemail(
      email, code
    );
  }
  catch (err) {
    const error = ErrorHandler.createError("error in sending email", 500, err as any);
    return next(error);
  }

  const hashedpassword = await bcrypt.hashSync(password, 10);
  const newuser = await userModel.create({
    name,
    email,
    password: hashedpassword,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    verificationCode: code,

  });
  const token = JWT.sign(
    { email: newuser.email, _id: newuser._id as mongoose.Types.ObjectId, role: newuser.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  newuser.token = token;
  newuser.save();
  return res.status(200).json({
    success: true,
    massage: "verification code sent to your email",
    user: newuser,
  });
});
const verifyEmail = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = ErrorHandler.createError("validation error", 422, error.array());
    return next(err);
  }
  const { email, code } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    const err = ErrorHandler.createError("user not found", 404, error.array());

    return next(err);
  }
  if (user.verificationCode !== code) {
    const err = ErrorHandler.createError("verification code is invalid", 401, error.array());
    return next(err);
  }
  user.verified = true;
  user.verificationCode = null;
  await user.save();
  return res.status(200).json({
    success: true,
    user: user,
  });
});
const resendVerificationCode = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = ErrorHandler.createError("validation error", 422, error.array());

    return next(err);
  }
  const { email } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    const err = ErrorHandler.createError("user not found", 404, error.array());
    return next(err);
  }
  if (user.verified) {
    const err = ErrorHandler.createError("user already verified", 404, error.array());

    return next(err);
  }
  const code: string = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = code;
  await user.save();
  try {
    await sendemail(
      email, code
    )
  }
  catch (err) {
    const error = ErrorHandler.createError("error in sending email", 500, err as any);
    return next(error);
  }
  return res.status(200).json({
    success: true,
    message: "verification code sent to your email,please check your email",
  });
});
const forgotPassword = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = ErrorHandler.createError("validation error", 422, error.array());
    return next(err);
  }
  const { email } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    const err = ErrorHandler.createError(" user not found", 404, error.array());
    return next(err);
  }
  const code: string = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = code;
  await user.save();
  try {
    await sendemail(
      email, code
    );
  }
  catch (err) {
    const error = ErrorHandler.createError("error in sending email", 500, err as any);
    return next(error);
  }
  return res.status(200).json({
    success: true,
    message: "verification code sent to your email, please check your email",
  });

}
);
const resetpassword = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = ErrorHandler.createError("validation error", 422, error.array());
    return next(err);
  }
  const { email, password, code } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    const err = ErrorHandler.createError(" user not found", 422, error.array());

    return next(err);
  }
  if (user.verificationCode !== code) {
    const err = ErrorHandler.createError(" verification code is invalid", 422, error.array());
    return next(err);
  }
  const hashedpassword = await bcrypt.hashSync(password, 10);
  user.password = hashedpassword;
  user.verificationCode = null;
  user.verified = true;

  await user.save();
  return res.status(200).json({
    success: true,
    message: "password reset successfully",
  });
});
const login = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = ErrorHandler.createError("validation error", 422, error.array());
    return next(err);
  }
  const { email, password } = req.body;

  const user = await userModel.findOne({ email: email });
  if (!user) {

    const err = ErrorHandler.createError("user not found", 422, error.array());
    return next(err);
  }
  if (user.verified === false) {
    const err = ErrorHandler.createError("user not verified", 422, error.array());
    return next(err);
  }
  const matchpassword = await bcrypt.compare(password, user.password);
  if (!matchpassword) {
    const err = ErrorHandler.createError("password is incorrect", 422, error.array());
    return next(err);
  }
  const token = JWT.sign(
    { email: user.email, _id: user._id as mongoose.Types.ObjectId, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  user.token = token;
  await user.save();
  return res.status(200).json({
    success: true,
    user: user,
  });
});
const refreshToken = asyncWrapper(async (req: any, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = ErrorHandler.createError("validation error", 422, error.array());
    return next(err);
  }

  const { email } = req.user;
  const user = await userModel.findOne({ email: email });
  const token: string = req.headers.authorization?.split(" ")[1] as string;
  if (token != user?.token) {
    const err = ErrorHandler.createError("this is not your token", 401, error.array());
    return next(err);
  }


  const newToken = JWT.sign(
    { email: user?.email, _id: user?._id as mongoose.Types.ObjectId, role: user?.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  if (user) {
    user.token = newToken;
  }
  await user?.save();
  return res.status(200).json({
    success: true,
    user: user,
  });
});
export default {
  register,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetpassword,
  login,
  refreshToken
};