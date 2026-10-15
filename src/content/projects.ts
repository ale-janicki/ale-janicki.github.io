import type { Project } from '@/types/project'

export const projects: Project[] = [
  {
    id: 'mycashy',
    name: 'mycashy',
    tagline: 'Personal finance app',
    description:
      'A personal finance SaaS in production, with shared workspaces, approval flows and an investment portfolio.',
    stack: ['React', 'TypeScript', 'Supabase'],
    built: 'Server-side AES-256-GCM encryption and a CLI at parity with the web app.',
    highlight: 'In production',
    demoHint: 'Demo: explore a shared workspace, its approvals and the investment portfolio.',
    branch: { color: '#f4512c', visual: 'cluster' },
  },
  {
    id: 'sir-earn-crypto',
    name: 'sir-earn-crypto',
    tagline: 'Crypto trading app',
    description:
      'A multi-user crypto trading bot designed to run 24/7, trading a grid that Claude reviews every 4 hours.',
    stack: ['Python', 'FastAPI', 'asyncio', 'GCP', 'Supabase'],
    built: 'Isolated and encrypted keys.',
    highlight: 'Designed to run 24/7',
    branch: { color: '#e255c8', visual: 'rhythm' },
  },
  {
    id: 'thesis',
    name: 'thesis',
    tagline: 'Thesis',
    description:
      'My thesis: object detection in images with YOLO, built with Python and TypeScript.',
    stack: ['Python', 'TypeScript', 'YOLO'],
    branch: { color: '#a3e635', visual: 'detect' },
  },
  {
    id: 'klaus',
    name: 'klaus',
    tagline: 'Personal agent ecosystem',
    description:
      'A personal AI agent ecosystem: multi-agent orchestration with persistent memory over a 1,200+ note knowledge base.',
    stack: ['Python', 'Claude', 'systemd'],
    built:
      'A Telegram bot with parallel sessions and failover across 2 machines, guarded by 28 hooks.',
    highlight: '1,200+ note knowledge base',
    branch: { color: '#a855f7', visual: 'core' },
  },
]
