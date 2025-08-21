import asyncWrapper from "../../../middleware/asyncwrapper";
import postModel from "../../../model/postModel";
const addtorepostuser = asyncWrapper(async (req: any, res: any, next: any) => {
    const { postId } = req.params;
    const  userId  = req.user._id;
    const result = await postModel.updateOne({ _id: postId }, { $push: { repost: userId } });
    return res.status(200).json({
        "status": "successfly",
        "data": result
    });
});

export default { addtorepostuser };
