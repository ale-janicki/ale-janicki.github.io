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
  toContact: 1.4,
  contactHold: 1,
}

export const PRELUDE = LENGTHS.landing + LENGTHS.intro + LENGTHS.presentation + LENGTHS.toWide

export function timelineLength(branchCount: number): number {
  const perBranch = LENGTHS.enter + LENGTHS.hold
  return (
    PRELUDE + LENGTHS.wideHold + perBranch * branchCount + LENGTHS.toContact + LENGTHS.contactHold
  )
}

export const PRESENTATION_ACT = 1
export const BRAIN_ACT = 2
export const FIRST_BRANCH_ACT = 3

export interface Act {
  label: string
  begin: number
  stop: number
  still: [number, number]
}

export interface ActLabels {
  meet: string
  you: string
  brain: string
  contact: string
}

export function flightActs(names: string[], labels: ActLabels): Act[] {
  const arrival = LENGTHS.landing + LENGTHS.intro
  const wideHoldStart = PRELUDE
  const firstEnter = wideHoldStart + LENGTHS.wideHold
  const perBranch = LENGTHS.enter + LENGTHS.hold
  const contactStart = firstEnter + perBranch * names.length + LENGTHS.toContact
  return [
    { label: labels.meet, begin: 0, stop: 0, still: [0, LENGTHS.landing] },
    {
      label: labels.you,
      begin: arrival - 0.3,
      stop: arrival + 0.2,
      still: [arrival, arrival + LENGTHS.presentation],
    },
    {
      label: labels.brain,
      begin: PRELUDE - 0.5,
      stop: wideHoldStart + 0.4,
      still: [wideHoldStart, wideHoldStart + LENGTHS.wideHold],
    },
    ...names.map((name, index) => {
      const holdStart = firstEnter + perBranch * index + LENGTHS.enter
      return {
        label: name,
        begin: firstEnter + perBranch * index + LENGTHS.enter * 0.35,
        stop: holdStart + 0.3,
        still: [holdStart, holdStart + LENGTHS.hold] as [number, number],
      }
    }),
    {
      label: labels.contact,
      begin: contactStart - LENGTHS.toContact * 0.5,
      stop: contactStart + 0.3,
      still: [contactStart, contactStart + LENGTHS.contactHold],
    },
  ]
}
