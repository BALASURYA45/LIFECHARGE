import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  function handleChange(event) {
    i18n.changeLanguage(event.target.value);
  }

  const currentLang = i18n.language?.startsWith('ta') ? 'ta' : i18n.language?.startsWith('hi') ? 'hi' : 'en';

  return (
    <div className="relative inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-slate-700 transition-all duration-200 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white">
      <Languages size={16} className="text-slate-500 dark:text-slate-400 shrink-0 pointer-events-none" aria-hidden="true" />
      <select
        className="appearance-none bg-transparent pr-3 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer outline-none transition-colors hover:text-slate-900 dark:hover:text-white"
        value={currentLang}
        onChange={handleChange}
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-medium">
            {lang.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 dark:text-slate-500">▼</span>
    </div>
  );
}