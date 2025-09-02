/**
 * @file likeModel.ts
 * @description Defines the schema and model for post likes in the application
 * @requires mongoose
 */
import mongoose, { Schema } from "mongoose";

/**
 * @constant likesSchema
 * @description Mongoose schema for post likes
 * @property {mongoose.Schema.Types.ObjectId} postId - Reference to the liked post
 * @property {Array<mongoose.Schema.Types.ObjectId>} usersIDs - Array of user IDs who liked the post
 * @property {Date} createdAt - Timestamp when the like was created
 */
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
// Create an index on postId for faster querying
likesSchema.index({ postId: 1 });

/**
 * @class Like
 * @description Mongoose model for post likes
 * @extends mongoose.Model
 */
export default mongoose.model("Like", likesSchema);
