export const MAX_BRANCHES = 8
export const MAX_LINKS = (MAX_BRANCHES * (MAX_BRANCHES - 1)) / 2
export const MAX_MILESTONES = 5
export const MAX_DOMAINS = 5
export const HERO_SLOTS = MAX_BRANCHES + MAX_MILESTONES
export const LINK_LAYER_STEP = 0.01

export const LENGTHS = {
  hero: 1,
  toWide: 1,
  wideHold: 0.8,
  transit: 0.8,
  follow: 1,
  hold: 0.9,
  toLink: 0.9,
  linkHold: 0.8,
  toKlaus: 1.1,
  klausHold: 1.4,
}

export function timelineLength(branchCount: number): number {
  const perBranch = LENGTHS.transit + LENGTHS.follow + LENGTHS.hold
  const fixed =
    LENGTHS.hero +
    LENGTHS.toWide +
    LENGTHS.wideHold +
    LENGTHS.toLink +
    LENGTHS.linkHold +
    LENGTHS.toKlaus +
    LENGTHS.klausHold
  return fixed + perBranch * branchCount
}

export interface Act {
  label: string
  begin: number
  stop: number
}

export function flightActs(branchCount: number): Act[] {
  const perBranch = LENGTHS.transit + LENGTHS.follow + LENGTHS.hold
  const wideStart = LENGTHS.hero
  const wideHoldStart = wideStart + LENGTHS.toWide
  const firstTransit = wideHoldStart + LENGTHS.wideHold
  const firstHold = firstTransit + LENGTHS.transit + LENGTHS.follow
  const linkStart = firstTransit + perBranch * branchCount
  const linkHoldStart = linkStart + LENGTHS.toLink
  const klausStart = linkHoldStart + LENGTHS.linkHold
  const klausHoldStart = klausStart + LENGTHS.toKlaus
  return [
    { label: 'You', begin: 0, stop: 0 },
    { label: 'Brain', begin: wideStart + 0.5, stop: wideHoldStart + 0.3 },
    { label: 'Projects', begin: firstTransit, stop: firstHold + 0.2 },
    { label: 'Ecosystem', begin: linkStart + 0.5 * LENGTHS.toLink, stop: linkHoldStart + 0.3 },
    { label: 'Klaus', begin: klausStart + 0.75, stop: klausHoldStart + 0.3 },
  ]
}
