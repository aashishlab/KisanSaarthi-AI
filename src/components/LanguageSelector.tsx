import React from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "mr", name: "मराठी" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "gu", name: "ગુજરાતી" },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-primary/20 bg-background/50 hover:bg-muted"
        >
          <Globe className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-strong border-white/10 rounded-2xl p-2 min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer hover:bg-primary/10 group transition-colors"
          >
            <span className={`text-sm font-medium ${i18n.language === lang.code ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
              {lang.name}
            </span>
            {i18n.language === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
