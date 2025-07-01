import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const ONE_SIGNAL_API_KEY: String | undefined = process.env.OneSignal_App_key;
const ONE_SIGNAL_APP_ID: String | undefined = process.env.OneSignal_App_ID;

const sendNotificationService = (title: string, message: string) => {
	const body = {
		app_id: ONE_SIGNAL_APP_ID,
		included_segments: ["All"],
		headings: { en: title },
		contents: { en: message },
	};
	axios.post('https://onesignal.com/api/v1/notifications', body, {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Basic ${ONE_SIGNAL_API_KEY}`,
		},
	}
	).then((response) => {
		console.log('Notification sent successfully:', response.data);
	}).catch((error) => {
		console.log(title + ' ' + message);
		console.log(ONE_SIGNAL_API_KEY + ' ' + ONE_SIGNAL_APP_ID);
		console.log('Error sending notification:', error.response ? error.response.data : error.message);

		console.error('Error sending notification:', error);
	});
};

export default { sendNotificationService };