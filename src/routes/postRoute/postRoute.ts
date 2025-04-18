import { Router } from "express";
import multer from "multer";
import path from "path";
import PostController from "../../controller/postController/postController";
import { postValidation } from "../../utils/validation";
// إعداد التخزين للصور باستخدام multer
const storage = multer.diskStorage({
		destination: 'uploads/',
		filename: function (_req, file, cb) {
			cb(null, "-" + Date.now() + path.extname(file.originalname));
		},
	});

const upload = multer({ storage });

const postRouter = Router();

postRouter
	.post(
		"/",
		upload.array("images", 12),
		postValidation,
		PostController.createPost
	)
	.get("/:id", PostController.getPostById)
	.get("/", PostController.getAllPosts);

export default postRouter;
