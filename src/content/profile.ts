import type { Locale, Localized } from '@/i18n/locale'

interface ContactLink {
  label: string
  value: string
  href: string
}

interface Fact {
  label: string
  value: string
}

export interface Profile {
  name: string
  photo: string
  title: string
  pitch: string
  current: string
  facts: Fact[]
  contacts: ContactLink[]
}

interface ProfileSource {
  name: string
  photo: string
  title: Localized<string>
  pitch: Localized<string>
  current: Localized<string>
  facts: { label: Localized<string>; value: Localized<string> }[]
  contacts: ContactLink[]
}

const profileSource: ProfileSource = {
  name: 'Alessandro Janicki',
  photo: '/img/alessandro.jpg',
  title: {
    en: 'Full Stack Engineer · AI-powered products',
    'pt-BR': 'Engenheiro Full Stack · Produtos com IA',
  },
  pitch: {
    en: 'I ship products end to end, from React front ends to Java, Python and Node.js back ends, with AI built into production systems.',
    'pt-BR':
      'Entrego produtos de ponta a ponta, de front ends em React a back ends em Java, Python e Node.js, com IA integrada a sistemas em produção.',
  },
  current: {
    en: 'Since September 2025 I build multi-portal, multi-tenant, white-label platforms as a contractor at Moonxi.',
    'pt-BR':
      'Desde setembro de 2025 construo plataformas multiportal, multi-tenant e white-label como PJ na Moonxi.',
  },
  facts: [
    {
      label: { en: 'Education', 'pt-BR': 'Formação' },
      value: {
        en: 'B.Sc. Computer Engineering, Universidade Anhembi Morumbi',
        'pt-BR': 'Bacharel em Engenharia de Computação, Universidade Anhembi Morumbi',
      },
    },
    {
      label: { en: 'Languages', 'pt-BR': 'Idiomas' },
      value: {
        en: 'Portuguese (native) · English (advanced) · Spanish (basic)',
        'pt-BR': 'Português (nativo) · Inglês (avançado) · Espanhol (básico)',
      },
    },
  ],
  contacts: [
    {
      label: 'GitHub',
      value: 'github.com/ale-janicki',
      href: 'https://github.com/ale-janicki',
    },
    {
      label: 'LinkedIn',
      value: 'linkedin.com/in/alejanicki',
      href: 'https://www.linkedin.com/in/alejanicki',
    },
    {
      label: 'Email',
      value: 'alessandrojanicki@gmail.com',
      href: 'mailto:alessandrojanicki@gmail.com',
    },
  ],
}

export function localizeProfile(locale: Locale): Profile {
  const { title, pitch, current, facts, ...rest } = profileSource
  return {
    ...rest,
    title: title[locale],
    pitch: pitch[locale],
    current: current[locale],
    facts: facts.map((fact) => ({ label: fact.label[locale], value: fact.value[locale] })),
  }
}
