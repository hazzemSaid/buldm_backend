import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const ONE_SIGNAL_API_KEY: String | undefined = process.env.OneSignal_App_key;
const ONE_SIGNAL_APP_ID: String | undefined = process.env.OneSignal_App_ID;
const ONE_SIGNAL_ANDROID_CHANNEL_ID: string | undefined = process.env.ONE_SIGNAL_ANDROID_CHANNEL_ID;

const sendNotificationService = async (
    title: string,
    message: string,
    playerId?: string | string[],
    data?: Record<string, any>,
    androidChannelId?: string,
    androidSound?: string,
) => {
    // Build base payload
    const body: any = {
        app_id: ONE_SIGNAL_APP_ID,
        headings: { en: title },
        contents: { en: message },
    };

    if (data && typeof data === 'object') {
        body.data = data;
        // If a sender avatar is provided in data, use it to enhance notification visuals
        try {
            const avatar = (data as any)?.senderAvatar || (data as any)?.sender?.avatar;
            if (avatar && typeof avatar === 'string') {
                // Android + Web Push
                body.large_icon = avatar;          // Android small/large icon
                body.big_picture = avatar;         // Android expanded image
                body.chrome_web_icon = avatar;     // Chrome Web Push icon
                // iOS rich media (key can be any string)
                body.ios_attachments    = { avatar };
            }
        } catch { /* noop: best-effort enhancement */ }

        // iOS sound support via data.iosSound (e.g., "ping.caf")
        const iosSound = (data as any)?.iosSound;
        if (iosSound && typeof iosSound === 'string') {
            body.ios_sound = iosSound;
        }
    }

    // Respect provided androidChannelId; fallback to env or hardcoded default
    const resolvedAndroidChannelId = androidChannelId || ONE_SIGNAL_ANDROID_CHANNEL_ID || "2e83d57c-8760-46da-8f76-8708012e0cbe";
    if (resolvedAndroidChannelId) {
        body.android_channel_id = resolvedAndroidChannelId;
    }
    // Android sound: resource name without extension; channel may override on Android 8+
    if (androidSound) {
        body.android_sound = androidSound;
    }

    // Targeting: specific player(s) if provided, else broadcast to all
    if (playerId && ONE_SIGNAL_APP_ID) {
        body.include_player_ids = Array.isArray(playerId) ? playerId : [playerId];
    } else {
        body.included_segments = ["All"]; // fallback broadcast
    }

    try {
        const response = await axios.post('https://onesignal.com/api/v1/notifications', body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONE_SIGNAL_API_KEY}`,
            },
        });
        console.log('Notification sent successfully:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error sending notification:', error?.response?.data || error?.message || error);
        throw error;
    }
};

export default { sendNotificationService };