import { Router } from "express";
import multer from "multer";
import path from "path";
import postController from "../../controller/postController/postController";
import limiter from "../../utils/ratelimit";
import { postValidation } from "../../utils/validation";

// إعداد التخزين للصور باستخدام multer
const storage = multer.diskStorage({
	destination: "uploads/",
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
		limiter(3),
		postController.createPost
	)
	.get("/:id", postController.getPostById,)
	.get("/", postController.getAllPosts,)
	.put(
		"/:id",
		upload.array("images", 12),
		postValidation,
		postController.updatepost
	)
	.delete("/:id", postController.deletePostById);

export default postRouter;
