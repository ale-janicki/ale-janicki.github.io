import { useContext, type ComponentProps } from 'react'
import { Html } from '@react-three/drei'
import { LocaleContext } from '@/i18n/LocaleContext'

export function LocalizedHtml({ children, ...props }: ComponentProps<typeof Html>) {
  const locale = useContext(LocaleContext)
  return (
    <Html {...props}>
      <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
    </Html>
  )
}
