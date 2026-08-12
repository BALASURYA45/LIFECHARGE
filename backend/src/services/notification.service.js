import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { BatteryData } from "../models/BatteryData.js";
import { Prediction } from "../models/Prediction.js";
import { AppError } from "../utils/AppError.js";

function canUseDatabase() {
  return Boolean(env.mongoUri) && mongoose.connection.readyState === 1;
}

export async function getUserNotifications(userId) {
  let user = null;

  if (canUseDatabase()) {
    user = await User.findById(userId);
  }

  const dailyReminderEnabled = user?.dailyReminderEnabled ?? true;
  const reminderTime = user?.reminderTime ?? "20:00";
  const browserNotificationsEnabled =
    user?.browserNotificationsEnabled ?? false;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let hasFilledToday = false;

  if (canUseDatabase()) {
    const [batteryCount, predictionCount] = await Promise.all([
      BatteryData.countDocuments({
        user: userId,
        createdAt: { $gte: startOfToday },
      }),
      Prediction.countDocuments({
        user: userId,
        createdAt: { $gte: startOfToday },
      }),
    ]);

    hasFilledToday = batteryCount > 0 || predictionCount > 0;
  }

  const notifications = [];

  if (!hasFilledToday && dailyReminderEnabled) {
    notifications.push({
      id: "daily-battery-usage-reminder",
      type: "daily_reminder",
      title: "Daily Battery Usage Reminder",
      message:
        "You haven't recorded your battery usage for today yet. Fill in today's routine or battery stats to maintain accurate AI predictions.",
      actionUrl: "/routine",
      actionText: "Fill Now",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  return {
    hasFilledToday,
    dailyReminderEnabled,
    reminderTime,
    browserNotificationsEnabled,
    notifications,
  };
}
