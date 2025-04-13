const asyncWrapper = require("../../middleware/asyncwrapper");
const postModel = require("../../model/postModel");

const { validationResult } = require("express-validator");


const Createpost = asyncWrapper(async (req, res, next) => {

	const errors = validationResult(req);
	console.log(req.body["title"]);

	if (!errors.isEmpty()) {
		const err = new Error("validation error");
		err.statuscode = 422;
		err.data = errors.array();
		return next(err);
	}

	const {
		title,
		description,
		status,
		category = "",
		user,
		location = {},
		predictedItems = [],
		contactInfo = ""
	} = req.body;

	// معالجة coordinates
	let coordinates = null;
	if (
		Array.isArray(location?.coordinates) &&
		location.coordinates.length === 2 &&
		!isNaN(parseFloat(location.coordinates[0])) &&
		!isNaN(parseFloat(location.coordinates[1]))
	) {
		coordinates = location.coordinates.map(coord => parseFloat(coord));
	}

	const placeName = location.placeName || "";

	const predictedItem = Array.isArray(predictedItems) && predictedItems.length > 0
		? {
			label: predictedItems[0].label || "",
			confidence: parseFloat(predictedItems[0].confidence ?? "0.0"),
			category: predictedItems[0].category || ""
		}
		: null;


	const postData = {
		title,
		description,
		images: req.files ? req.files.map(file => "/" + file.filename) : null,

		location: {
			type: "Point",
			coordinates: {
				type: "Point",
				coordinates: coordinates, // أو أي قيمة افتراضية أخرى
			},
			placeName: placeName
		},
		status,
		category,
		predictedItems: predictedItem ? [predictedItem] : [],
		contactInfo,
		user: req.user._id,
		createdBy: user,
		createdAt: Date.now(),
		updatedAt: Date.now()
	};
	// إنشاء البوست
	const newpost = await postModel.create(postData);

	return res.status(200).json({
		success: true,
		message: "Post created successfully",
		data: newpost,
	});
});
module.exports = {
	Createpost
}