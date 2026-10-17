import { useMemo } from 'react'
import { localizeDomains } from '@/content/domains'
import { localizeExperience } from '@/content/experience'
import { localizeProfile } from '@/content/profile'
import { localizeProjects } from '@/content/projects'
import { useLocale } from './useLocale'

export function useContent() {
  const { locale } = useLocale()
  return useMemo(
    () => ({
      profile: localizeProfile(locale),
      projects: localizeProjects(locale),
      experience: localizeExperience(locale),
      domains: localizeDomains(locale),
    }),
    [locale],
  )
}
