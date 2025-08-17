import asyncWrapper from '../../../middleware/asyncwrapper';
import likeModel from "../../../model/likeModel";
const getalllikebypostid = asyncWrapper(async (req: any, res, next) => {
	const { postId } = req.params
	const result = await likeModel.findOne({ postId: postId });
	return res.status(200).json({
		"status": "successfly",
		'data':{
			"count": result?.usersIDs?.length ?? 0,
			"usersIDS": result?.usersIDs ?? [],
			"isliked":result?.usersIDs?.includes(req.user._id) ?? false,
		}
	})
});
const addliketopostbyuserid = asyncWrapper(async (req, res, next) => {
	const { postId } = req.params;
	const userId = req.user._id
	const isliked = await likeModel.findOne({ postId });
	if (!isliked) {
		const result = await likeModel.create({
			postId,
			usersIDs: [userId]
		});
		return res.status(200).json({
			"status": "successfly",
			"data": {
				"count": result.usersIDs.length,
				"usersIDS": result.usersIDs,
				"isliked":true,
			}
		});
	}
	else{
		if(isliked.usersIDs.includes(userId)){
			(isliked.usersIDs as any).pull(userId);
			await isliked.save();
			return res.status(200).json({
				"status": "successfly",
				"data": {
					"count": isliked.usersIDs.length,
					"usersIDS": isliked.usersIDs,
					"isliked":false,
				}
			});
		}
		else{
			(isliked.usersIDs as any).push(userId);
			await isliked.save();
			return res.status(200).json({
				"status": "successfly",
				"data": {
					"count": isliked.usersIDs.length,
					"usersIDS": isliked.usersIDs,
					"isliked":true,
				}
			});
		}
	}
	
});

export default { getalllikebypostid, addliketopostbyuserid };
