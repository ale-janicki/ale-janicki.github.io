import type { Localized } from '@/i18n/locale'

type BranchVisual = 'cluster' | 'rhythm' | 'detect' | 'core'

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

type ProjectText =
  'name' | 'tagline' | 'description' | 'problem' | 'built' | 'highlight' | 'demoHint'

export type ProjectSource = Omit<Project, ProjectText> & {
  [K in ProjectText]?: Localized<string>
} & { name: Localized<string>; tagline: Localized<string>; description: Localized<string> }
