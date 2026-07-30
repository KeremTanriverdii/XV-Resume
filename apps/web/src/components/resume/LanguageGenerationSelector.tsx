'use client';

import React from 'react';
import { Globe, Check } from 'lucide-react';

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

export const AVAILABLE_GENERATION_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

interface LanguageGenerationSelectorProps {
  selectedLanguages: string[];
  onChange: (langs: string[]) => void;
  disabled?: boolean;
}

export const LanguageGenerationSelector: React.FC<LanguageGenerationSelectorProps> = ({
  selectedLanguages,
  onChange,
  disabled = false,
}) => {
  const toggleLanguage = (code: string) => {
    if (disabled) return;
    if (selectedLanguages.includes(code)) {
      // Keep at least one language selected
      if (selectedLanguages.length === 1) return;
      onChange(selectedLanguages.filter((l) => l !== code));
    } else {
      onChange([...selectedLanguages, code]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-primary" />
          Hedef Üretim Dilleri / Generation Languages
        </span>
        <span className="text-[11px] font-normal text-muted-foreground">
          {selectedLanguages.length} Dil Seçildi
        </span>
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {AVAILABLE_GENERATION_LANGUAGES.map((lang) => {
          const isSelected = selectedLanguages.includes(lang.code);
          return (
            <button
              key={lang.code}
              type="button"
              disabled={disabled}
              onClick={() => toggleLanguage(lang.code)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-xs'
                  : 'border-border/60 hover:bg-muted/50 text-muted-foreground'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="flex items-center gap-1.5">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
              {isSelected && (
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground italic">
        Özgeçmiş, Ön Yazı ve Cold Message seçilen tüm dillerde AI ile ayrı ayrı üretilir.
      </p>
    </div>
  );
};
