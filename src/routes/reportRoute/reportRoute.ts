import { Router } from 'express';
import reportController from "../../controller/reportController/reportController";
import verifyToken from '../../middleware/verifyToken';
const router = Router();
router.post('/',verifyToken,reportController.sendreport ).get('/',
	verifyToken,reportController.getreports).get('/:id',verifyToken,
		reportController.getreport).get('/:id',verifyToken,
			reportController.getreport);

export default router;