const postModel = require("../../model/postModel");
const Router = require("express").Router();
const multer = require("multer");
const path = require("path");
const verifyToken = require("../../middleware/verifyToken");
const PostController = require("../../controller/postController/postController");
const { postValidation } = require("../../utils/validation");
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, "../../uploads"));
	},
	filename: function (req, file, cb) {
		cb(null, "-" + Date.now() + path.extname(file.originalname));
	},
});
const upload = multer({ storage: storage });

Router.post(
	"/",
	upload.array("images", 12),
	postValidation,
	verifyToken, // Verify token middleware
	PostController.Createpost
);

module.exports = Router;
