import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  CalendarClock,
  ChevronRight,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNotificationStatus } from "../services/notificationService.js";
import { getStoredToken } from "../utils/jwtUtils.js";

export default function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState({
    hasFilledToday: true,
    dailyReminderEnabled: true,
    reminderTime: "20:00",
    browserNotificationsEnabled: false,
    notifications: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef(null);

  const fetchStatus = async () => {
    if (!getStoredToken()) return;
    try {
      setIsLoading(true);
      const data = await getNotificationStatus();
      setStatus(data);

      // Trigger browser desktop notification if enabled, granted, and not filled today
      if (
        !data.hasFilledToday &&
        data.dailyReminderEnabled &&
        data.browserNotificationsEnabled
      ) {
        if (
          "Notification" in window &&
          window.Notification.permission === "granted"
        ) {
          const lastAlertKey = "lifecharge_last_desktop_alert";
          const todayStr = new Date().toDateString();
          if (window.localStorage.getItem(lastAlertKey) !== todayStr) {
            new window.Notification("LifeCharge Daily Battery Reminder", {
              body: "Don't forget to fill in your daily EV battery usage stats today!",
              icon: "/favicon.ico",
            });
            window.localStorage.setItem(lastAlertKey, todayStr);
          }
        }
      }
    } catch {
      // Ignore API error for unauthenticated state or connectivity issues
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    const handleBatteryFilled = () => {
      fetchStatus();
    };

    window.addEventListener("lifecharge:battery-filled", handleBatteryFilled);
    window.addEventListener(
      "lifecharge:prediction-updated",
      handleBatteryFilled,
    );

    return () => {
      window.removeEventListener(
        "lifecharge:battery-filled",
        handleBatteryFilled,
      );
      window.removeEventListener(
        "lifecharge:prediction-updated",
        handleBatteryFilled,
      );
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pendingCount =
    !status.hasFilledToday && status.dailyReminderEnabled ? 1 : 0;

  const handleFillClick = () => {
    setIsOpen(false);
    navigate("/routine");
  };

  return (
    <div className="relative shrink-0" ref={popoverRef}>
      <button
        className="lc-focus relative flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 transition-all duration-200 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("notifications.title", "Notifications")}
        aria-busy={isLoading}
        disabled={isLoading}
      >
        <Bell size={17} aria-hidden="true" className="text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition" />
        {isLoading ? (
          <span className="absolute -bottom-1 -right-1 flex size-3.5 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-500 shadow-sm" />
        ) : pendingCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-[10px] font-black text-white shadow-md shadow-emerald-950/40 animate-pulse">
            {pendingCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute -right-10 sm:right-0 mt-2 w-[calc(100vw-2.5rem)] max-w-xs sm:max-w-sm sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="text-amber-500" size={18} />
              <h3 className="font-black text-slate-900 dark:text-white">
                {t("notifications.title", "Notifications")}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {!status.hasFilledToday && status.dailyReminderEnabled ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/30">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <CalendarClock size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      {t(
                        "notifications.dailyReminderTitle",
                        "Daily Battery Usage Required",
                      )}
                    </p>
                    <p className="mt-1 text-xs text-amber-700/90 dark:text-amber-400/90 leading-relaxed">
                      {t(
                        "notifications.dailyReminderDesc",
                        "You haven't recorded your daily battery stats today. Keep your AI health metrics up to date.",
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={handleFillClick}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700 shadow-sm"
                    >
                      {t("notifications.fillNow", "Fill Usage Now")}
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {t("notifications.allCaughtUp", "All Caught Up!")}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {t(
                      "notifications.filledTodayMsg",
                      "You have recorded your daily battery usage for today.",
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Clock size={12} />
              {t("notifications.reminderAt", "Reminder time:")}{" "}
              {status.reminderTime}
            </span>
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="font-bold text-emerald-500 hover:underline dark:text-emerald-400"
            >
              {t("notifications.settings", "Settings")}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
