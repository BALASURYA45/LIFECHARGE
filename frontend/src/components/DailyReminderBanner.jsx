import { useEffect, useState } from "react";
import { CalendarClock, ChevronRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNotificationStatus } from "../services/notificationService.js";

export default function DailyReminderBanner() {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadStatus = async () => {
      try {
        const data = await getNotificationStatus();
        if (isMounted) {
          setStatus(data);
        }
      } catch {
        // Ignore unauthenticated or offline errors
      }
    };

    loadStatus();

    const handleBatteryFilled = () => {
      loadStatus();
    };

    window.addEventListener("lifecharge:battery-filled", handleBatteryFilled);
    window.addEventListener(
      "lifecharge:prediction-updated",
      handleBatteryFilled,
    );

    return () => {
      isMounted = false;
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

  if (
    dismissed ||
    !status ||
    status.hasFilledToday ||
    !status.dailyReminderEnabled
  ) {
    return null;
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 p-4 sm:p-5 dark:border-amber-500/30 dark:from-amber-950/40 dark:to-amber-900/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-md">
            <CalendarClock size={20} />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-amber-200">
              {t("notifications.bannerTitle", "Daily Battery Usage Reminder")}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-amber-300/80 leading-relaxed">
              {t(
                "notifications.bannerDesc",
                "You haven't recorded today's battery usage stats yet. Log today's routine to ensure uninterrupted battery health predictions.",
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <Link
            to="/routine"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-amber-700 active:scale-95"
          >
            {t("notifications.fillUsageNow", "Fill Routine Now")}
            <ChevronRight size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Dismiss banner"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
