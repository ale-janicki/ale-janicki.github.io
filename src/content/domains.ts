interface Domain {
  id: string
  name: string
  items: string[]
}

export const domains: Domain[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    items: ['React', 'Next.js', 'React Native (Expo)', 'TypeScript'],
  },
  {
    id: 'ai',
    name: 'AI',
    items: ['Claude API', 'OpenAI API', 'Multi-agent systems', 'MCP', 'RAG / embeddings'],
  },
  {
    id: 'backend',
    name: 'Backend',
    items: ['Java (Spring Boot)', 'Python (FastAPI)', 'Node.js', 'REST APIs'],
  },
  {
    id: 'quality',
    name: 'Quality',
    items: ['Playwright', 'Vitest', 'PostHog', 'OpenTelemetry'],
  },
  {
    id: 'data-cloud',
    name: 'Data & Cloud',
    items: ['PostgreSQL', 'Supabase', 'Docker', 'AWS ECS / Lambda / S3'],
  },
]
