import { createContext } from 'react'
import type { Locale } from './locale'
import type { Messages } from './en'

export interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  messages: Messages
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)
