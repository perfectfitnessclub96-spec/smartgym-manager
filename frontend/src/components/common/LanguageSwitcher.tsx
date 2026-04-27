// src/components/common/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { setLanguage } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    localStorage.setItem('preferredLanguage', lng);
    setIsOpen(false);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-700 border border-gray-200"
      >
        <Globe size={18} />
        <span>{currentLanguage.flag} {currentLanguage.name}</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {languages.map((lang) => (
              <button 
                key={lang.code} 
                onClick={() => changeLanguage(lang.code)} 
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 rounded-lg ${
                  i18n.language === lang.code ? 'bg-red-50 text-red-600' : 'text-gray-700'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}