const asyncwrapper = require("../../middleware/asyncwrapper");
const userModel = require("../../model/userModel");
const getUser = asyncwrapper(async (req, res, next) => {
	const id = req.params.id;
	const user = await userModel.findById(id);
	if (!user) {
		const err = new Error("user not found");
		err.statuscode = 404;
		return next(err);
	}
	return res.status(200).json({
		success: true,
		user: user,
	});
});
module.exports = {
	getUser,
}