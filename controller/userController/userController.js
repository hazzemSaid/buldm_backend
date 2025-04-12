const asyncWrapper = require("../../middleware/asyncwrapper");
const userModel = require("../../model/userModel");
const { validationResult } = require("express-validator");

const bcrypt = require('bcryptjs');

const { sendVerificationEmail } = require("../../utils/verificationemail");
const JWT = require("jsonwebtoken");
const register = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("validation error");
    err.statuscode = 422;
    err.data = errors.array();
    return next(err);
  }
  const olduser = await userModel.findOne({ email: email });
  if (olduser) {
    const err = new Error("user already exists");
    err.statuscode = 422;
    return next(err);
  }
  const code = Math.floor(100000 + Math.random() * 900000);
  const mail = await sendVerificationEmail(email, code);

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
    { email: newuser.email, _id: newuser._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  newuser.token = token;
  newuser.save();
  return res.status(200).json({
    success: true,
    massage: "verification code sent to your email",
  });
});
const verifyEmail = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error("validation error");
    err.statuscode = 422;
    err.data = error.array();
    return next(err);
  }
  const { email, code } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    const err = new Error("user not found");
    err.statuscode = 404;
    return next(err);
  }
  if (user.verificationCode !== code) {
    const err = new Error("invalid verification code");
    err.statuscode = 401;
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
    const err = new Error("validation error");
    err.statuscode = 422;
    err.data = error.array();
    return next(err);
  }
  const { email } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    const err = new Error("user not found");
    err.statuscode = 404;
    return next(err);
  }
  const code = Math.floor(100000 + Math.random() * 900000);
  user.verificationCode = code;
  await user.save();
  const mail = await sendVerificationEmail(email, code);
  return res.status(200).json({
    success: true,
    message: "verification code sent to your email",
  });
});
const forgetpassword = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error("validation error");
    err.statuscode = 422;
    err.data = error.array();
    return next(err);
  }
  const { email } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    const err = new Error("user not found");
    err.statuscode = 404;
    return next(err);
  }
  const code = Math.floor(100000 + Math.random() * 900000);
  user.verificationCode = code;
  await user.save();
  const mail = await sendVerificationEmail(email, code);
  return res.status(200).json({
    success: true,
    message: "verification code sent to your email",
  });

}
);
const resetpassword = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error("validation error");
    err.statuscode = 422;
    err.data = error.array();
    return next(err);
  }
  const { email, password, code } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    const err = new Error("user not found");
    err.statuscode = 404;
    return next(err);
  }
  if (user.verificationCode !== code) {
    const err = new Error("invalid verification code");
    err.statuscode = 401;
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
    const err = new Error("validation error");
    err.statuscode = 422;
    err.data = error.array();
    return next(err);
  }
  const { email, password } = req.body;

  const user = await userModel.findOne({ email: email });
  if (!user) {
    const err = new Error("user not found");
    err.statuscode = 404;
    return next(err);
  }
  
  const matchpassword = await bcrypt.compare(password, user.password);
  if (!matchpassword) {
    const err = new Error("invalid password");
    err.statuscode = 401;
    return next(err);
  }
  const token = JWT.sign(
    { email: user.email, _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  user.token = token;
  await user.save();
  return res.status(200).json({
    success: true,
    user: user,
  });
});
const refreshToken = asyncWrapper(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error("validation error");
    err.statuscode = 422;
    err.data = error.array();
    return next(err);
  }

  const { email } = req.user;
  const user = await userModel.findOne({ email: email });

  const newtoken = JWT.sign(
    { email: user.email, _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  user.token = newtoken;
  return res.status(200).json({
    success: true,
    user: user,
  });
});
module.exports = {
  register,
  login,
  refreshToken,
  verifyEmail,
  resendVerificationCode,
  forgetpassword,
  resetpassword,
};
