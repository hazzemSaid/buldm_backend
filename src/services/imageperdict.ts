import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const huggingface = process.env.huggingfaceID;
const imagePredictService = async (imageUrl: string) => {
	try {
		const response = await axios.post(
			'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
			{ inputs: imageUrl },
			{
				headers: {
					'Authorization': `Bearer ${huggingface}`,
					'Content-Type': 'application/json',
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error('Error in image prediction:', error);
		throw error;
	}
};

export default imagePredictService;