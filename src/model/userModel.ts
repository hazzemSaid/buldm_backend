import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: ["admin", "user"],
		default: "user",
	}
	, email: {
		type: String,
		required: true,
		unique: true
	}
	, password: {
		type: String,
		required: true,
	},
	
	avatar: {
		type: String,
		default: "/image/2024.png",
	},
	token: {
		type: String,
	},
	refreshToken:{
		type:String
	},
	verificationCode: {
		type: String,
	},
	forgotPasswordToken:{
		type : String,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	verified: {
		type: Boolean,
		default: false,
	},
}, {
	versionKey: false,
});
userSchema.index({ username: 1, id: 1 });
export default mongoose.model('user', userSchema);
