import mongoose from 'mongoose';
const statusSchema = new mongoose.Schema({
		userId:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
		}
		,
		status:{
			type: String,
			required: true,
		}
		,
		text:{
			type: String,
			required: true,
		}
		,
		createdAt:{
			type: Date,
			default: Date.now,
		},
		expiresAt:{
			type: Date,
			default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // ✅ دالة
		 
		}
		
}
);
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds:0 });
export default mongoose.model('status', statusSchema);