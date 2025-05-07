import mongoose from "mongoose";
import { resetPasswordValidation } from '../utils/validation';
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

}, {
	versionKey: false,
});
userSchema.index({ username: 1, id: 1 });
export default mongoose.model('user', userSchema);
