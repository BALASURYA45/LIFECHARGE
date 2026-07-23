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

  return (
    <div className="relative flex items-center gap-1">
      <Languages size={16} className="text-slate-400" aria-hidden="true" />
      <select
        className="appearance-none bg-transparent py-1 pl-1 pr-5 text-sm text-slate-300 outline-none transition hover:text-white focus:text-cyan-200"
        value={i18n.language?.startsWith('ta') ? 'ta' : i18n.language?.startsWith('hi') ? 'hi' : 'en'}
        onChange={handleChange}
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}