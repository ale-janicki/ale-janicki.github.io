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

export const profile: Profile = {
  name: 'Alessandro Janicki',
  photo: '/img/alessandro.jpg',
  title: 'Full Stack Engineer · AI-powered products',
  pitch:
    'I ship products end to end, from React front ends to Java, Python and Node.js back ends, with AI built into production systems.',
  current:
    'Since September 2025 I build multi-portal, multi-tenant, white-label platforms as a contractor at Moonxi.',
  facts: [
    { label: 'Education', value: 'B.Sc. Computer Engineering, Universidade Anhembi Morumbi' },
    { label: 'Languages', value: 'Portuguese (native) · English (advanced) · Spanish (basic)' },
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
