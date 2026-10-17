export const en = {
  meta: {
    title: 'Alessandro Janicki — Full Stack Engineer · AI-powered products',
    description:
      'Alessandro Janicki — Full Stack Engineer · AI-powered products. A living network of projects.',
  },
  header: {
    contact: 'Contact',
    quickAccess: 'Quick access',
    projects: 'Projects',
    language: 'Language',
    portrait: (name: string) => `Portrait of ${name}`,
  },
  acts: {
    meet: 'Meet',
    you: 'You',
    brain: 'Brain',
    contact: 'Contact',
  },
  nav: {
    story: 'Story navigation',
    progress: 'Story progress',
    back: 'Back: ',
    next: 'Next: ',
    backTo: (label: string) => `Back to ${label}`,
    nextTo: (label: string) => `Next: ${label}`,
    backToTop: 'Back to top',
  },
  hero: {
    introduction: 'Introduction',
    now: 'Now',
    meet: (firstName: string) => `Meet ${firstName}`,
    cue: 'or scroll to follow the signal',
    experience: 'Experience',
  },
  projects: {
    eyebrow: '02 / projects',
    heading: 'Projects',
    stack: 'Stack',
    domainStack: (name: string) => `${name} stack`,
  },
  contact: {
    eyebrow: '03 / contact',
    heading: "Let's talk",
  },
  branchCard: {
    branch: (index: number) => `branch 0${index}`,
    built: 'Built',
    demo: 'Demo',
    open: (name: string) => `Open ${name}`,
  },
  panel: {
    branch: 'Branch',
    problem: 'Problem',
    built: 'What I built',
    launchDemo: 'Launch demo — coming soon',
    back: 'Back',
  },
  milestone: {
    close: 'Close',
  },
  caption: 'Everything I build connects.',
}

export type Messages = typeof en
