import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  ShieldCheck,
  Bell,
  Clock,
  Calendar,
  Car,
  CheckCircle2,
  LogOut,
  Save,
  Sparkles,
  Award,
  Bike,
  Truck,
  Bus,
  Zap,
  Check,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';
import {
  vehicleCategories,
  vehicleDatabase,
  getMakesForCategory,
  getModelsForMake,
  getVehicleSpec,
} from '../constants/vehicleDatabase.js';
import { getVehicleImageUrl } from '../constants/vehicleImageMap.js';

const categoryIcons = {
  two_wheeler: Bike,
  three_wheeler: Truck,
  four_wheeler: Car,
  bus_heavy: Bus,
};

const VEHICLE_STORAGE_KEY = 'lifecharge_user_selected_vehicle';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, saveProfile, logout } = useAuth();
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');

  // Selected vehicle state (Category, Make, Model)
  const [selectedVehicle, setSelectedVehicle] = useState(() => {
    try {
      const stored = localStorage.getItem(VEHICLE_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return {
      categoryId: 'four_wheeler',
      make: 'Tata Motors',
      model: 'Nexon EV',
    };
  });

  const { categoryId, make, model } = selectedVehicle;

  // Available makes & models based on selection
  const availableMakes = categoryId ? getMakesForCategory(categoryId) : [];
  const availableModels = categoryId && make ? getModelsForMake(categoryId, make) : [];
  const currentVehicleSpec = categoryId && make && model ? getVehicleSpec(categoryId, make, model) : null;
  const currentVehicleImage = categoryId && make && model ? getVehicleImageUrl(categoryId, make, model) : null;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name ?? '',
      dailyReminderEnabled: user?.dailyReminderEnabled ?? true,
      reminderTime: user?.reminderTime ?? '20:00',
      browserNotificationsEnabled: user?.browserNotificationsEnabled ?? false,
    },
  });

  const dailyReminderEnabled = watch('dailyReminderEnabled');

  // Handle vehicle selection changes
  function handleCategorySelect(newCatId) {
    const makes = getMakesForCategory(newCatId);
    const firstMake = makes[0] || '';
    const models = firstMake ? getModelsForMake(newCatId, firstMake) : [];
    const firstModel = models[0]?.model || '';

    const newVeh = { categoryId: newCatId, make: firstMake, model: firstModel };
    setSelectedVehicle(newVeh);
    localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(newVeh));
  }

  function handleMakeSelect(newMake) {
    const models = getModelsForMake(categoryId, newMake);
    const firstModel = models[0]?.model || '';

    const newVeh = { categoryId, make: newMake, model: firstModel };
    setSelectedVehicle(newVeh);
    localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(newVeh));
  }

  function handleModelSelect(newModel) {
    const newVeh = { categoryId, make, model: newModel };
    setSelectedVehicle(newVeh);
    localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(newVeh));
  }

  async function onSubmit(values) {
    setMessage('');
    setServerError('');

    try {
      await saveProfile({
        name: values.name.trim(),
        dailyReminderEnabled: values.dailyReminderEnabled,
        reminderTime: values.reminderTime,
        browserNotificationsEnabled: values.browserNotificationsEnabled,
      });
      localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(selectedVehicle));
      setMessage(t('profile.updated', 'Profile and connected EV vehicle updated successfully!'));
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  // Get user initials for avatar badge
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const formattedJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active Member';

  const SelectedIcon = categoryIcons[categoryId] || Car;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Premium Hero Banner with Watermark Vehicle Background */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-6 sm:p-8 text-white shadow-xl dark:border-slate-800">
        {/* Watermark Vehicle Background Image */}
        {currentVehicleImage ? (
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-2/3 md:w-1/2 overflow-hidden pointer-events-none opacity-35 dark:opacity-30 transition-all duration-700">
            <img
              src={currentVehicleImage}
              alt={model || 'EV Vehicle'}
              className="h-full w-full object-cover object-right-center filter brightness-110 contrast-110 transform transition-all duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
          </div>
        ) : null}

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            {/* User Avatar Circle */}
            <div className="relative flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-2xl font-black text-slate-950 shadow-lg shadow-cyan-500/20 ring-4 ring-white/10">
              {getInitials(user?.name)}
              <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-slate-900">
                <CheckCircle2 size={14} />
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{user?.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-3 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-400/30">
                  <ShieldCheck size={13} /> Verified
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">{user?.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> Joined {formattedJoinDate}
                </span>
                <span className="flex items-center gap-1">
                  <Award size={13} /> Role: {user?.role ? user.role.toUpperCase() : 'USER'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats & Connected EV Banner */}
        <div className="relative z-10 mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-white/10 pt-6">
          <div className="rounded-xl bg-white/5 p-3.5 backdrop-blur-sm border border-white/5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Account Status</p>
            <p className="mt-1 text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> Active & Verified
            </p>
          </div>
          <div className="rounded-xl bg-cyan-500/10 p-3.5 backdrop-blur-sm border border-cyan-500/20">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">Connected EV Model</p>
            <p className="mt-1 text-sm font-bold text-cyan-200 flex items-center gap-1.5 truncate">
              <SelectedIcon size={15} className="shrink-0 text-cyan-400" />
              <span className="truncate">{make} {model}</span>
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-3.5 backdrop-blur-sm border border-white/5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Daily Reminders</p>
            <p className="mt-1 text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Bell size={14} /> {dailyReminderEnabled ? `Enabled (${watch('reminderTime')})` : 'Disabled'}
            </p>
          </div>
        </div>
      </section>

      {/* Showroom Vehicle Selection Card */}
      <section className="lc-card-static rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <Car size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Select Your Showroom Vehicle Model</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Link your EV model from the official showroom database</p>
            </div>
          </div>
          {currentVehicleSpec ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Check size={14} /> Model Linked
            </span>
          ) : null}
        </div>

        {/* Single Showroom Vehicle Model Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Select Your Showroom Vehicle Model
          </label>
          <select
            className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400 dark:focus:bg-slate-900"
            value={`${categoryId}|${make}|${model}`}
            onChange={(e) => {
              const parts = e.target.value.split('|');
              if (parts.length === 3) {
                const [cId, mMake, mModel] = parts;
                const newVeh = { categoryId: cId, make: mMake, model: mModel };
                setSelectedVehicle(newVeh);
                localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(newVeh));
              }
            }}
          >
            <option value="" disabled>-- Select your vehicle from official showroom models --</option>
            {vehicleCategories.map((cat) => {
              const makes = vehicleDatabase[cat.id] || [];
              return (
                <optgroup key={cat.id} label={`⚡ ${cat.label}`} className="bg-slate-100 font-bold text-cyan-700 dark:bg-slate-800 dark:text-cyan-400">
                  {makes.flatMap((makeEntry) =>
                    makeEntry.models.map((m) => (
                      <option
                        key={`${cat.id}|${makeEntry.make}|${m.model}`}
                        value={`${cat.id}|${makeEntry.make}|${m.model}`}
                        className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-semibold"
                      >
                        {makeEntry.make} {m.model} ({m.yearRange}) — {m.batteryCapacity} kWh, {m.typicalRange} km range
                      </option>
                    ))
                  )}
                </optgroup>
              );
            })}
          </select>
        </div>

        {/* Selected Vehicle Spec Banner */}
        {currentVehicleSpec ? (
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-cyan-500/10 pb-3 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-extrabold text-slate-900 dark:text-white">
                  {make} {currentVehicleSpec.model} ({currentVehicleSpec.yearRange})
                </h3>
              </div>
              <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-slate-700 px-3 py-1 rounded-full w-fit">
                {currentVehicleSpec.batteryType} Battery Architecture
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-xs sm:grid-cols-4">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Pack Capacity:</span>{' '}
                <span className="font-bold text-slate-900 dark:text-white">{currentVehicleSpec.batteryCapacity} kWh</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Typical Range:</span>{' '}
                <span className="font-bold text-slate-900 dark:text-white">{currentVehicleSpec.typicalRange} km</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Nominal Voltage:</span>{' '}
                <span className="font-bold text-slate-900 dark:text-white">{currentVehicleSpec.voltage} V</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Rated Life:</span>{' '}
                <span className="font-bold text-slate-900 dark:text-white">{currentVehicleSpec.estimatedLifeYears} Years ({currentVehicleSpec.expectedCycles} cycles)</span>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Main Profile Form Grid */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal & Account Details */}
          <section className="lc-card-static rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="grid size-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Personal Information</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your official driver credentials</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Full Name Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
                    placeholder="Enter your full name"
                    {...register('name', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    })}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs font-medium text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email Address (Read-only) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Email Address <span className="text-[10px] lowercase font-normal text-emerald-600 dark:text-emerald-400">(Verified Primary)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    disabled
                    value={user?.email ?? ''}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pl-11 pr-4 text-sm font-semibold text-slate-500 cursor-not-allowed dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400"
                  />
                  <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                </div>
              </div>

              {/* Account Role & System ID */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Type</p>
                  <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-200 capitalize">
                    {user?.role ?? 'Standard Driver'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">User ID</p>
                  <p className="mt-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 truncate">
                    {user?.id ?? user?._id ?? 'LC-DRIVER-88'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Preferences & Notifications */}
          <section className="lc-card-static rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Reminders & Notifications</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Customize your battery check schedules</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Daily Reminder Toggle */}
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Daily Battery Reminder</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Alert me to record battery stats daily</p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...register('dailyReminderEnabled')}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-cyan-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700 dark:peer-checked:bg-cyan-500" />
                </label>
              </div>

              {/* Preferred Reminder Time */}
              {dailyReminderEnabled ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Preferred Daily Alert Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="time"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
                      {...register('reminderTime')}
                    />
                  </div>
                </div>
              ) : null}

              {/* Browser Push Notifications */}
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/20 dark:text-cyan-300">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Desktop Push Alerts</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Receive browser pop-up reminders</p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...register('browserNotificationsEnabled')}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-cyan-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700 dark:peer-checked:bg-cyan-500" />
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Save Bar & Status Alerts */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            {message ? (
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={18} /> {message}
              </p>
            ) : serverError ? (
              <p className="text-sm font-bold text-red-600 dark:text-red-400">{serverError}</p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ensure your credentials and notification times are up to date.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="lc-focus inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3 font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}