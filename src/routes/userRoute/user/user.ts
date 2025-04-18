import { Router } from 'express';
import { getUser } from '../../../controller/userController/userController';
import verifyToken from '../../../middleware/verifyToken';
const router = Router();
router.get('/:id', verifyToken, getUser);
export default router;