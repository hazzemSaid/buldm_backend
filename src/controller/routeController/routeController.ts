import { NextFunction, Response } from "express";
import asyncWrapper from "../../middleware/asyncwrapper";
import reportSchema from "../../model/reportModel";
const sendreport = asyncWrapper(
	async (req: any, res: Response, next: NextFunction) => {
		console.log(req.body);
		const { type, id, reason, description } = req.body;
		const userid = req.user?._id;
		const prvreport = await reportSchema.findOne({ id: id });
		if (prvreport) {
			if (prvreport.usersIDS.includes(userid)) {
				return res.status(400).json({ message: "you have already reported this post" });
			}
			else {
				prvreport.usersIDS.push(userid);
				if (reason)
					prvreport.reason.push(reason);
				if (description)
					prvreport.description.push(description);

				await prvreport.save();

				return res.status(200).json({ message: "report sent" });
			}
		}

		const report = new reportSchema({
			type,
			id,
			usersIDS: userid ? [userid] : [],
			reason: reason ? [reason] : [],
			description: description ? [description] : [],
		})
		await report.save();
		return res.status(200).json({ message: "report sent" });
	}
);
const getreports = asyncWrapper(
	async (req: any, res: Response, next: NextFunction) => {
		const reports = await reportSchema.find();
		return res.status(200).json({ message: "reports", reports });
	}
);
const getreport = asyncWrapper(
	async (req: any, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const report = await reportSchema.findById(id);
		if (!report) {
			return res.status(404).json({ message: "report not found" });
		}
		return res.status(200).json({ message: "report", report });
	});
export default {
	sendreport,
	getreports,
	getreport
};