const Error_handler = require("../utils/error");
const jwt = require("jsonwebtoken");
const verifyToken = async (req, res, next) => {
	const authHeader =
		req.headers["authorization"] || req.headers["Authorization"];
		if(!authHeader) {
		const err = Error_handler.createError("Authorization header missing", 401);
		return next(err);
		}
	const token = authHeader && authHeader.split(" ")[1];
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		return next(
		);
	} catch (error) {
		const err = Error_handler.createError("Invalid token", 401);
		err.data = error;
		next(err);
	}
};
module.exports = verifyToken;
