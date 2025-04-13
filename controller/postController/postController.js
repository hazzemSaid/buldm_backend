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
const getPostById = asyncWrapper(async (req, res, next) => {
	const postId = req.params.id;
	if (!postId) {
		return res.status(400).json({
			success: false,
			message: "Post ID is required",
		});
	}

	const post = await postModel.findById(postId);
	if (!post) {
		return res.status(404).json({
			success: false,
			message: "Post not found",
		});
	}

	return res.status(200).json({
		success: true,
		message: "Post retrieved successfully",
		data: post,
	});
});
const getAllPosts = asyncWrapper(async (req, res, next) => {
	const posts = await postModel.find();
	if (!posts) {
		const error = new Error("posts not found");
		error.statuscode = 404;
		return next(error);
	}

	return res.status(200).json({
		success: true,
		message: "Posts retrieved successfully",
		data: posts,
	});
});
const deletePostById = asyncWrapper(async (req, res, next) => {

	const postId = req.params.id;
	if (!postId) {
		const error = new Error("Post ID is required");
		error.statuscode = 400;
		return next(error);
	}

	const post = await postModel.findByIdAndDelete(postId);
	if (!post) {
		return res.status(404).json({
			success: false,
			message: "Post not found",
		});
	}
	if (post.user?._id.toString() !== req.user._id.toString()) {
		const error = new Error("You are not authorized to delete this post");
		error.statuscode = 403;
		return next(error);
	}

	return res.status(200).json({
		success: true,
		message: "Post deleted successfully",
	});
});

module.exports = {
	Createpost,
	getPostById,
	getAllPosts
	, deletePostById
}