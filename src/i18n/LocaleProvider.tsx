import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LocaleContext } from './LocaleContext'
import { detectLocale, STORAGE_KEY, type Locale } from './locale'
import { MESSAGES } from './messages'

interface LocaleProviderProps {
  children: ReactNode
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setState] = useState<Locale>(detectLocale)
  const messages = MESSAGES[locale]

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = messages.meta.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', messages.meta.description)
  }, [locale, messages])

  const setLocale = useCallback((next: Locale) => {
    setState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      return
    }
  }, [])

  const value = useMemo(() => ({ locale, setLocale, messages }), [locale, setLocale, messages])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
