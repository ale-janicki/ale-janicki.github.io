export const FLIGHT_SECONDS = 1.9

export interface FlightRequest {
  progress: number
  seconds: number
  onArrive: () => void
}

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
