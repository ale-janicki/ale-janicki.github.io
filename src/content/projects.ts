import type { Project } from '@/types/project'

export const projects: Project[] = [
  {
    id: 'mycashy',
    name: 'mycashy',
    tagline: 'Personal finance app',
    description: 'Shared workspaces with approvals and an investment portfolio.',
    stack: ['React', 'TypeScript', 'Supabase'],
    built: 'Server-side AES-256-GCM encryption and a CLI at parity with the web app.',
    highlight: 'In production',
    demoHint: 'Demo: explore a shared workspace, its approvals and the investment portfolio.',
    branch: { color: '#2dd4bf', visual: 'cluster' },
  },
  {
    id: 'sir-earn-crypto',
    name: 'sir-earn-crypto',
    tagline: 'Crypto trading app',
    description: 'A multi-user crypto trading bot.',
    stack: ['FastAPI', 'asyncio', 'GCP', 'Supabase'],
    built: 'A grid reviewed by Claude every 4 hours, with isolated and encrypted keys.',
    highlight: 'Designed to run 24/7',
    branch: { color: '#a78bfa', visual: 'rhythm' },
  },
  {
    id: 'klaus',
    name: 'klaus',
    tagline: 'Personal agent ecosystem',
    description: 'Multi-agent orchestration with persistent memory.',
    stack: ['Python', 'Claude', 'systemd'],
    built:
      'A Telegram bot with parallel sessions and failover across 2 machines, guarded by 28 hooks.',
    highlight: '1,200+ note knowledge base',
    branch: { color: '#ff7a1f', visual: 'core' },
  },
]
