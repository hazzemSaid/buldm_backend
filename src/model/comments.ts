import mongoose  from "mongoose";
const commentSchema = new mongoose.Schema({
	postId: {
		type: mongoose.Schema.Types.ObjectId, // store as ObjectId
		ref: "Post",
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId, // store as ObjectId
		ref: "User",
		required: true,
	},
	comment: {
		type: String,
		required: true,
		trim: true,
	},
	parentCommentId: {
		type: mongoose.Schema.Types.ObjectId, // store as ObjectId
		ref: "Comment",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});
commentSchema.index({ postId: 1, userId: 1 }); // إنشاء فهرس عادي لل _id
export default mongoose.model("Comment", commentSchema);
