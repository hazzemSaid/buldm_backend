const Error_handler = require("../utils/error");
const allowedto=(...roles)=>{
	return (req, res, next) => {
		const user = req.user;
		
		if ( !roles.includes(user.role)) {
			const err = Error_handler.createError("You are not allowed to perform this action", 403);
			return next(err);
		}
		next();
	}
}
module.exports = allowedto