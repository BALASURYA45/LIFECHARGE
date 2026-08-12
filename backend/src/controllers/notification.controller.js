import { getUserNotifications } from "../services/notification.service.js";
import { updateUserProfile } from "../services/auth.service.js";

export async function getNotifications(request, response) {
  const data = await getUserNotifications(request.user._id);
  response.status(200).json({ success: true, ...data });
}

export async function updateNotificationSettings(request, response) {
  const user = await updateUserProfile(request.user._id, request.body);
  const data = await getUserNotifications(request.user._id);
  response.status(200).json({ success: true, user, ...data });
}
