import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', subLabel: 'EN' },
  { code: 'ta', label: 'தமிழ்', subLabel: 'Tamil' },
  { code: 'hi', label: 'हिन्दी', subLabel: 'Hindi' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentCode = i18n.language?.startsWith('ta') ? 'ta' : i18n.language?.startsWith('hi') ? 'hi' : 'en';
  const currentLangObj = languages.find((l) => l.code === currentCode) || languages[0];

  function handleSelect(code) {
    i18n.changeLanguage(code);
    setIsOpen(false);
  }

  // Handle click outside to close popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="lc-focus inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 group"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <Globe size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:rotate-12 transition duration-200" />
        <span className="hidden sm:inline font-bold text-slate-900 dark:text-white">{currentLangObj.label}</span>
        <span className="inline sm:hidden font-bold text-slate-900 dark:text-white text-[11px]">{currentLangObj.code.toUpperCase()}</span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
      </button>

      {/* Custom Glassmorphism Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-[#070D14]/95 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Select Interface Language</p>
          </div>

          <div className="space-y-1">
            {languages.map((lang) => {
              const isSelected = lang.code === currentCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-950/30'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{lang.label}</span>
                    <span className={`text-[10px] opacity-75 font-mono ${isSelected ? 'text-white' : 'text-slate-400'}`}>({lang.subLabel})</span>
                  </div>
                  {isSelected && <Check size={14} className="text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}