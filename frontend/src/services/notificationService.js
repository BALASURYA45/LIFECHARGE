import apiClient from "./apiClient.js";

export async function getNotificationStatus() {
  const { data } = await apiClient.get("/notifications");
  return data;
}

export async function updateNotificationSettings(settings) {
  const { data } = await apiClient.patch("/notifications/settings", settings);
  return data;
}
