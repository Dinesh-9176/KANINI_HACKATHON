"use client"

import * as React from "react"
import { getTranslation, SUPPORTED_APP_LANGUAGES, Language } from "./translations"

interface LanguageContextType {
    language: string
    setLanguage: (lang: string) => void
    t: (key: string) => string
    dir: 'ltr' | 'rtl'
    availableLanguages: Language[]
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = React.useState("en")

    // Get direction based on language
    const dir = React.useMemo(() => {
        const lang = SUPPORTED_APP_LANGUAGES.find(l => l.code === language)
        return lang?.dir || 'ltr'
    }, [language])

    // Translation function
    const t = React.useCallback((key: string) => {
        return getTranslation(language, key as any)
    }, [language])

    const value = React.useMemo(() => ({
        language,
        setLanguage,
        t,
        dir,
        availableLanguages: SUPPORTED_APP_LANGUAGES,
    }), [language, t, dir])

    return (
        <LanguageContext.Provider value={value}>
            <div dir={dir}>
                {children}
            </div>
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = React.useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}

// Hook for using translation in components
export function useTranslation() {
    const { t, language, setLanguage, dir, availableLanguages } = useLanguage()
    return { t, language, setLanguage, dir, availableLanguages }
}
