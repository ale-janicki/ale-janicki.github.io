export type Locale = 'en' | 'pt-BR'

export type Localized<T> = Record<Locale, T>

export const LOCALES: Locale[] = ['en', 'pt-BR']

export const LOCALE_LABELS: Localized<{ short: string; name: string }> = {
  en: { short: 'EN', name: 'English' },
  'pt-BR': { short: 'PT', name: 'Português (BR)' },
}

export const STORAGE_KEY = 'locale'

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'pt-BR'
}

function readStored(): unknown {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function detectLocale(): Locale {
  const stored = readStored()
  if (isLocale(stored)) return stored
  return navigator.language.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en'
}
