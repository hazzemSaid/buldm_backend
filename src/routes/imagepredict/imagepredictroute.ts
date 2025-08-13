import { Router, RequestHandler } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import cloudinary from "../../utils/cloudinaryService";
import imagepredict from "../../services/imageperdict";

const imagePredictionRouter = Router();
/**
 * @swagger
 * tags:
 *   name: Image Prediction
 *   description: Image prediction endpoints
 */

/**
 * @swagger
 * /api/v1/predict:
 *   post:
 *     summary: Upload images and predict their content
 *     tags: [Image Prediction]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Prediction results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 predictedItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                       prediction:
 *                         type: string
 *       400:
 *         description: No images uploaded
 */

// إعداد التخزين المؤقت للصور باستخدام multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp'); // writeable directory in Vercel
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// handler بوضوح من نوع RequestHandler
const predictHandler: RequestHandler = async (req, res) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ error: "No images uploaded" });
    return;
  }

  const predictedItems: any[] = [];

  console.log("Files received for prediction:", files.length);

  for (let i = 0; i < files.length; i++) {
    try {
      const upload_image = await cloudinary.uploader.upload(files[i].path, {
        folder: "posts",
        format: "png",
      });

      const prediction = await imagepredict(upload_image.secure_url);
      predictedItems.push({
        filename: files[i].originalname,
        prediction,
      });

      console.log(`Prediction for file ${i + 1}:`, prediction);

      // حذف الملف المحلي بعد الرفع
      fs.unlinkSync(files[i].path);
    } catch (error) {
      console.error(`Error processing file ${files[i].originalname}:`, error);
    }
  }

  res.status(200).json({ predictedItems });
};

// استخدام POST مش GET
imagePredictionRouter.post("/", upload.array("images", 12), predictHandler);

export default imagePredictionRouter;
