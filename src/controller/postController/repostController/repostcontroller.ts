/**
 * @file repostcontroller.ts
 * @description Controller for handling post repost functionality
 * @requires ../../../middleware/asyncwrapper
 * @requires ../../../model/postModel
 */
import asyncWrapper from "../../../middleware/asyncwrapper";
import postModel from "../../../model/postModel";

/**
 * @async
 * @function addtorepostuser
 * @description Add a user to the repost list of a specific post
 * @param {Object} req - Express request object
 * @param {string} req.params.postId - The ID of the post to repost
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user._id - The ID of the user reposting
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with operation status and data
 */
const addtorepostuser = asyncWrapper(async (req: any, res: any, next: any) => {
    const { postId } = req.params;
    const  userId  = req.user._id;
    const result = await postModel.updateOne({ _id: postId }, { $push: { repost: userId } });
    return res.status(200).json({
        "status": "successfly",
        "data": result
    });
});

/**
 * @namespace repostController
 * @description Exports the repost controller functions
 */
export default { addtorepostuser };
