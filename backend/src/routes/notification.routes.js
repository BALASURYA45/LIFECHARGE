import express from "express";
import {
  getNotifications,
  updateNotificationSettings,
} from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { updateProfileSchema } from "../validators/auth.validators.js";

const router = express.Router();

router.get("/notifications", protect, asyncHandler(getNotifications));
router.patch(
  "/notifications/settings",
  protect,
  validateRequest(updateProfileSchema),
  asyncHandler(updateNotificationSettings),
);

export default router;
