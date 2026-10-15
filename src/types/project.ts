export type BranchVisual = 'cluster' | 'rhythm' | 'detect' | 'core'

export interface Branch {
  color: string
  visual: BranchVisual
}

export interface Project {
  id: string
  name: string
  tagline: string
  description: string
  stack: string[]
  problem?: string
  built?: string
  highlight?: string
  demoHint?: string
  branch: Branch
}
