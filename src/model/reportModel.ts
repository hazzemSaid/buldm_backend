import mongoose from "mongoose";
const reportSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: ['post', 'comment', 'user'],
		default: 'user',
	}
	,
	id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	usersIDS:{
		type: [mongoose.Schema.Types.ObjectId],
		default: null,
	}
	,
	reason: {
		type: [String],
		required: true,
		trim: true,
	}
	,
	description: {
		type: [String],
		required: true,
		trim: true,
	}
});
reportSchema.index({
	type: 1,
	id: 1,
	usersIDS: 1,
})
const Report = mongoose.model('Report', reportSchema);
export default Report;