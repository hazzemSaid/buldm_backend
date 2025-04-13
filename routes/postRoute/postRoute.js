const postModel = require("../../model/postModel");
const Router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { body } = require("express-validator");
const verifyToken = require("../../middleware/verifyToken");
const PostController = require("../../controller/postController/postController");
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, "../../uploads"));
	},
	filename: function (req, file, cb) {
		cb(null, "-" + Date.now() + path.extname(file.originalname));
	},
});
const upload = multer({ storage: storage });
const postValidation = [
	body("title").notEmpty().withMessage("title is required"),
	body("description").notEmpty().withMessage("description is required"),
	// body('location').notEmpty().withMessage('location is required'),
	body("status").notEmpty().withMessage("status is required"),
	// body('contactInfo').notEmpty().withMessage('contactInfo is required')
];
Router.post(
	"/create",
	upload.array("images", 12),
	postValidation,
	verifyToken, // Verify token middleware
	PostController.Createpost
);

module.exports = Router;
