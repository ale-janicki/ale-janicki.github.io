import { en, type Messages } from './en'
import type { Locale } from './locale'
import { ptBR } from './pt-BR'

export const MESSAGES: Record<Locale, Messages> = { en, 'pt-BR': ptBR }
