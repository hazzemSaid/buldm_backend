import { Router } from 'express';
import { param } from "express-validator";
import multer from "multer";
import path from 'path';
import usercontroller from '../../../controller/userController/userController';

import verifyToken from '../../../middleware/verifyToken';
const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  }
  ,
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
// Get user by ID
router.get(
  '/ID/:id',
  verifyToken,
  param('id').isString().withMessage('ID is required').trim(),

  usercontroller.getUser
);

// Find user by username
router.get('/find/:username', verifyToken, usercontroller.finduser_by_username);
// Update user 
router.put(
  '/ID/:id',
  verifyToken,
  upload.single('avatar'),
  usercontroller.updateuser
);
export default router;