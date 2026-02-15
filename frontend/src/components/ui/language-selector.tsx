"use client"

import * as React from "react"
import { Globe } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "@/lib/language-context"

export function LanguageSelector() {
    const { language, setLanguage, availableLanguages, t } = useTranslation()

    return (
        <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[160px] bg-transparent border-input">
                    <SelectValue placeholder={t("common_select")} />
                </SelectTrigger>
                <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {t("voice_indian_languages")}
                    </div>
                    {availableLanguages
                        .filter((lang) => ["en", "ta", "te", "hi", "kn", "ml", "bn", "gu", "mr", "pa", "or", "as"].includes(lang.code))
                        .map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                                {lang.nativeName} - {lang.name}
                            </SelectItem>
                        ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-1">
                        {t("voice_world_languages")}
                    </div>
                    {availableLanguages
                        .filter((lang) => !["en", "ta", "te", "hi", "kn", "ml", "bn", "gu", "mr", "pa", "or", "as"].includes(lang.code))
                        .map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                                {lang.nativeName} - {lang.name}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>
        </div>
    )
}
