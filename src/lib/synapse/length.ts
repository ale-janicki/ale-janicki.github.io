export const MAX_BRANCHES = 8
export const MAX_TECHS = 6
export const MAX_MILESTONES = 5
export const MAX_DOMAINS = 5
export const HERO_SLOTS = MAX_BRANCHES

export const MILESTONE_REACH = { x: 0.78, y: 1.32 }
export const MILESTONE_REACH_MOBILE = { x: 0.55, y: 0.9 }
export const MILESTONE_FAN = 1.05
export const MILESTONE_FAN_MOBILE = 0.85

export const LENGTHS = {
  landing: 0.25,
  intro: 0.75,
  presentation: 1,
  toWide: 1,
  wideHold: 0.8,
  enter: 2.4,
  hold: 0.9,
  endPad: 0.4,
}

export const PRELUDE = LENGTHS.landing + LENGTHS.intro + LENGTHS.presentation + LENGTHS.toWide

export function timelineLength(branchCount: number): number {
  const perBranch = LENGTHS.enter + LENGTHS.hold
  return PRELUDE + LENGTHS.wideHold + perBranch * branchCount + LENGTHS.endPad
}

export interface Act {
  label: string
  begin: number
  stop: number
}

export function flightActs(names: string[]): Act[] {
  const arrival = LENGTHS.landing + LENGTHS.intro
  const wideHoldStart = PRELUDE
  const firstEnter = wideHoldStart + LENGTHS.wideHold
  const perBranch = LENGTHS.enter + LENGTHS.hold
  return [
    { label: 'Meet', begin: 0, stop: 0 },
    { label: 'You', begin: arrival - 0.3, stop: arrival + 0.2 },
    { label: 'Brain', begin: PRELUDE - 0.5, stop: wideHoldStart + 0.4 },
    ...names.map((name, index) => ({
      label: name,
      begin: firstEnter + perBranch * index + LENGTHS.enter * 0.35,
      stop: firstEnter + perBranch * index + LENGTHS.enter + 0.3,
    })),
  ]
}
