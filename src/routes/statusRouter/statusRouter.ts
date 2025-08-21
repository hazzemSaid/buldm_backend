import express from "express";
import multer from "multer";
import path from "path";
import { createStatus, deleteStatus, getStatus, getStatusById } from "../../controller/statusController/statuscontroller";
import statusModel from "../../model/statusModel";
const router = express.Router();
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const upload = multer({ storage: storage });
const alreadystatus = async (req: any, res: any, next: any) => {
	const id = req.user._id;
	const result =await statusModel.findOne({ userId: id });
	if (result) {
		return res.status(400).json({ message: "Status already exists" });
	}
	next();
}
router.post("/createStatus", upload.single("status"),alreadystatus, createStatus);
router.get("/getStatus", getStatus);
router.get("/getStatusById/:user_id", getStatusById);
router.delete("/deleteStatus/:id", deleteStatus);
export default router;
