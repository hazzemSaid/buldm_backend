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
		default: "https://res.cloudinary.com/dr5cpch1n/image/upload/v1752943485/Unknown_person_o3xaku.jpg",
	},
	
	
	private:{
		type: Boolean,
		default: false,
	},
	backgroundImage:{
		type: String,
		default: "https://res.cloudinary.com/dr5cpch1n/image/upload/v1752943485/Unknown_person_o3xaku.jpg",
	},
	bio:{
		type: String,
		default: null,
		trim: true,
		limit: 500,
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
userSchema.index({ username: 1, id: 1 , _id:1 });
export default mongoose.model('user', userSchema);
