"use client";

import React from "react";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "vi", name: "vi" },
  { code: "en", name: "en" },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem("language", languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[80px] h-9">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <SelectValue>
            <span className="text-sm font-medium">{currentLanguage.name}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <span className="font-medium">{language.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
