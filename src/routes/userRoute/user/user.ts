import { Router } from 'express';
import { getUser,finduser_by_username } from '../../../controller/userController/userController';
import verifyToken from '../../../middleware/verifyToken';
const router = Router();
// Get user by ID
router.get('/:id', verifyToken, getUser);

// Find user by username
router.get('/find/:username', verifyToken,finduser_by_username);
export default router;