export interface StackGroup {
  label: string
  items: string[]
}

export interface ContactLink {
  label: string
  value: string
  href: string
}

export interface Profile {
  name: string
  title: string
  location: string
  pitch: string
  summary: string
  current: string
  stack: StackGroup[]
  contacts: ContactLink[]
}

export const profile: Profile = {
  name: 'Alessandro Janicki',
  title: 'Computer Engineer · Full Stack Developer',
  location: 'São Paulo, Brazil',
  pitch:
    'I ship products end to end, from React front ends to Java, Python and Node.js back ends, with AI built into production systems.',
  summary:
    'Computer Engineer and full stack developer who ships products end to end, from React and React Native front ends to Java, Python and Node.js back ends, with AI (Claude, OpenAI, agents) built into production systems.',
  current:
    'Since September 2025 I build multi-portal, multi-tenant, white-label platforms as a contractor at Moonxi.',
  stack: [
    { label: 'Frontend', items: ['React', 'Next.js', 'React Native (Expo)', 'TypeScript'] },
    { label: 'Backend', items: ['Java (Spring Boot)', 'Python (FastAPI)', 'Node.js'] },
    { label: 'AI', items: ['Claude API', 'OpenAI API', 'Multi-agent systems', 'MCP'] },
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
