import devenv from "dotenv";
import { validationResult } from "express-validator";
import { OAuth2Client } from "google-auth-library";
import JWT from "jsonwebtoken";
import mongoose from "mongoose";
import asyncWrapper from "../../middleware/asyncwrapper";
import userModel from "../../model/userModel";
import { compare, hash } from "../../utils/bcryptcodegen";
import ErrorHandler from "../../utils/error";
import sendemail from "../../utils/mailersend";
devenv.config();
if (
  !process.env.JWT_SECRET ||
  !process.env.SALT_ROUNDS ||
  !process.env.GOOGLE_CLIENT_ID
) {
  throw new Error("Missing required environment variables");
}
const webClientId = process.env.GOOGLE_CLIENT_ID;
const webClient = new OAuth2Client(webClientId);

const JWT_SECRET = process.env.JWT_SECRET as string;
export interface usersafe {
  name: string;
  email: string;
  avatar: string;
  token: string;
}
const register = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = ErrorHandler.createError(
      "validation error",
      422,
      errors.array()
    );
    return next(err);
  }
  const { email } = req.body;

  const olduser = await userModel.findOne({ email: email });
  if (olduser) {
    const err = ErrorHandler.createError("user already exists", 422, {});
    return next(err);
  }

  const code: string = Math.floor(100000 + Math.random() * 900000).toString();

  const bcryptcode: string = await hash(code);

  try {
    await sendemail(email, code);
  } catch (err) {
    const error = ErrorHandler.createError(
      "error in sending email",
      500,
      err as any
    );
    return next(error);
  }
  const { name, password } = req.body;
  const user = {
    name,
    email,
  };
  const hashedpassword = await hash(password);
  const newuser = await userModel.create({
    ...user,
    verified: false,
    password: hashedpassword,
    verificationCode: bcryptcode,
  });

  await newuser.save({});

  return res.status(200).json({
    success: true,
    massage: "verification code sent to your email",
    user,
  });
});
const verifyEmail = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = ErrorHandler.createError(
      "validation error",
      422,
      error.array()
    );
    return next(err);
  }
  const { email, code } = req.body;
  const user = await userModel.findOne({ email: email }, {});
  if (!user) {
    const err = ErrorHandler.createError("user not found", 404, error.array());

    return next(err);
  }

  const matchcode: boolean = await compare(
    code,
    user.verificationCode as string
  );
  if (!matchcode) {
    const err = ErrorHandler.createError(
      "verification code is invalid",
      401,
      error.array()
    );
    return next(err);
  }
  user.verificationCode = null;
  const token = JWT.sign(
    {
      email: user.email,
      _id: user._id as mongoose.Types.ObjectId,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  user.token = token;
  await user.save();
  const usersafe: usersafe = {
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    token: user.token as string,
  };
  return res.status(200).json({
    success: true,
    user: usersafe,
  });
});
const resendVerificationCode = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = ErrorHandler.createError(
      "validation error",
      422,
      error.array()
    );

    return next(err);
  }
  const { email } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    const err = ErrorHandler.createError("user not found", 404, error.array());
    return next(err);
  }

  const code: string = Math.floor(100000 + Math.random() * 900000).toString();
  const bcryptcode: string = await hash(code);
  user.verificationCode = bcryptcode;
  await user.save();
  try {
    await sendemail(email, code);
  } catch (err) {
    const error = ErrorHandler.createError(
      "error in sending email",
      500,
      err as any
    );
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
    const err = ErrorHandler.createError(
      "validation error",
      422,
      error.array()
    );
    return next(err);
  }
  const { email } = req.body;
  const user = await userModel.findOne({ email: email }, {});
  if (!user) {
    const err = ErrorHandler.createError(" user not found", 404, error.array());
    return next(err);
  }
  const code: string = Math.floor(100000 + Math.random() * 900000).toString();
  const bcryptcode: string = await hash(code);
  user.verificationCode = bcryptcode;

  await user.save();
  try {
    await sendemail(email, code);
  } catch (err) {
    const error = ErrorHandler.createError(
      "error in sending email",
      500,
      err as any
    );
    return next(error);
  }
  return res.status(200).json({
    success: true,
    message: "verification code sent to your email, please check your email",
  });
});
const verifyCode = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = ErrorHandler.createError(
      "validation error",
      422,
      error.array()
    );
    return next(err);
  }
  const { email, code } = req.body;
  const user = await userModel.findOne({ email: email }, {});
  if (!user) {
    const err = ErrorHandler.createError("user not found", 404, error.array());
    return next(err);
  }
  const matchcode: boolean = await compare(
    code,
    user.verificationCode as string
  );
  if (!matchcode) {
    const err = ErrorHandler.createError(
      "verification code is invalid",
      401,
      error.array()
    );
    return next(err);
  }
  const forgettoken: string = JWT.sign(
    { email: email },
    process.env.JWT_SECRET as string,
    { expiresIn: "30m" }
  );
  user.forgotPasswordToken = forgettoken;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "verification code is valid",
  });
});
const resetPassword = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = ErrorHandler.createError(
      "validation error",
      422,
      error.array()
    );
    return next(err);
  }
  const { email, password } = req.body;
  const user = await userModel.findOne({ email: email }, {});
  if (!user) {
    const err = ErrorHandler.createError("user not found", 404, error.array());
    return next(err);
  }
  try {
    const token = JWT.verify(
      user.forgotPasswordToken as string,
      process.env.JWT_SECRET as string
    );
    console.log(token);
  } catch (error) {
    const err = ErrorHandler.createError("token expired", 401, error as any);
    return next(err);
  }
  const hashedpassword = await hash(password);
  user.password = hashedpassword;
  user.verificationCode = null;
  user.forgotPasswordToken = null;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "password reset successfully",
  });
});
const login = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = ErrorHandler.createError(
      "validation error",
      422,
      error.array()
    );
    return next(err);
  }
  const { email, password } = req.body;

  const user = await userModel.findOne({ email: email });
  if (!user) {
    const err = ErrorHandler.createError("user not found", 422, error.array());
    return next(err);
  }
  const matchpassword = await compare(password, user.password as string);
  if (!matchpassword) {
    const err = ErrorHandler.createError(
      "password is incorrect",
      422,
      error.array()
    );
    return next(err);
  }
  const token = JWT.sign(
    {
      email: user.email,
      _id: user._id as mongoose.Types.ObjectId,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  user.token = token;
  await user.save();
  const usersafe: usersafe = {
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    token: user.token,
  };
  return res.status(200).json({
    success: true,
    user: usersafe,
  });
});
const refreshToken = asyncWrapper(async (req: any, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = ErrorHandler.createError(
      "validation error",
      422,
      error.array()
    );
    return next(err);
  }

  const { email } = req.user;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    const err = ErrorHandler.createError("user not found", 422, error.array());
    return next(err);
  }

  const newToken = JWT.sign(
    {
      email: user?.email,
      _id: user?._id as mongoose.Types.ObjectId,
      role: user?.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  user.token = newToken;
  const usersafe: usersafe = {
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    token: user.token,
  };
  await user?.save();
  return res.status(200).json({
    success: true,
    user: usersafe,
  });
});

const googleAuth = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      ErrorHandler.createError("validation error", 422, errors.array())
    );
  }

  const { token } = req.body;
  if (!token) {
    return next(ErrorHandler.createError("token is required", 422));
  }

  let decodedPayload: any;
  try {
    const [header, payload, signature] = token.split(".");
    decodedPayload = JSON.parse(Buffer.from(payload, "base64").toString());
    console.log(
      `Server timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`
    );
    console.log("Token payload debug:", {
      iss: decodedPayload.iss,
      aud: decodedPayload.aud,
      azp: decodedPayload.azp,
      exp: decodedPayload.exp,
      iat: decodedPayload.iat,
      email: decodedPayload.email,
      email_verified: decodedPayload.email_verified,
      name: decodedPayload.name,
      given_name: decodedPayload.given_name,
      family_name: decodedPayload.family_name,
      picture: decodedPayload.picture,
    });
  } catch (error) {
    return next(ErrorHandler.createError("invalid token", 401));
  }

  const {
    sub: googleId,
    email,
    email_verified: emailVerified,
    picture,
    given_name: firstName,
    family_name: lastName,
    iat: issuedAt,
    exp: expiresAt,
  } = decodedPayload;

  // Validate essential fields
  if (!email || !emailVerified) {
    return next(ErrorHandler.createError("email not verified or missing", 401));
  }

  // Check if token is expired
  const currentTime = Math.floor(Date.now() / 1000) - 2 * 60 * 60; // Adding 2 hours in seconds
  if (expiresAt && currentTime > expiresAt) {
    return next(ErrorHandler.createError("token has expired", 401));
  }
  // now what

  const olduser = await userModel.findOne({ email: email });
  if (olduser) {
    //make the token and return it
    const token = JWT.sign(
      {
        email: olduser.email,
        _id: olduser._id as mongoose.Types.ObjectId,
        role: olduser.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    olduser.token = token;
    await olduser.save();
    const usersafe: usersafe = {
      name: olduser.name,
      email: olduser.email,
      avatar: olduser.avatar,
      token: olduser.token,
    };
    return res.status(200).json({
      success: true,
      message: "Google auth successful",
      user: usersafe,
    });
  }
  const newToken = JWT.sign(
    {
      email: email,
      _id: new mongoose.Types.ObjectId(),
      role: "user",
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  const dummyPassword = Math.random().toString(36).slice(-8); // كلمة سر عشوائية
  const decodepassword = await hash(dummyPassword);

  const newuser = await userModel.create({
    name: firstName,
    email,
    avatar: picture,
    verified: true,
    password: decodepassword,
    verificationCode: "",
    forgotPasswordToken: "",
    role: "user",
    token: newToken,
  });

  await newuser.save({});
  const usersafe: usersafe = {
    name: newuser.name,
    email: newuser.email,
    avatar: newuser.avatar,
    token: newuser.token as string,
  };
  
  return res.status(200).json({
    success: true,
    message: "Google auth successful",
    user: usersafe,
  });
});

export default {
  register,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  verifyCode,
  resetPassword,
  login,
  refreshToken,
  googleAuth,
};
