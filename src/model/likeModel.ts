import mongoose, { Schema } from "mongoose";

const likesSchema = new Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId, // store as ObjectId
    ref: "Post",
    required: true,
  },
  usersIDs: [
    {
      type: mongoose.Schema.Types.ObjectId, // store as ObjectId
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
likesSchema.index({ postId: 1 }); // إنشاء فهرس عادي لل _id
export default mongoose.model("Like", likesSchema);
