import { Router } from 'express';
import reportController from "../../controller/reportController/reportController";
import verifyToken from '../../middleware/verifyToken';

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Report management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       required:
 *         - postId
 *         - reason
 *       properties:
 *         _id:
 *           type: string
 *         postId:
 *           type: string
 *         reporterId:
 *           type: string
 *         reason:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const router = Router();

/**
 * @swagger
 * /api/v1/report:
 *   post:
 *     summary: Send a new report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - reason
 *             properties:
 *               postId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', verifyToken, reportController.sendreport);

/**
 * @swagger
 * /api/v1/report:
 *   get:
 *     summary: Get all reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyToken, reportController.getreports);

/**
 * @swagger
 * /api/v1/report/{id}:
 *   get:
 *     summary: Get a report by ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       404:
 *         description: Report not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', verifyToken, reportController.getreport);

export default router;