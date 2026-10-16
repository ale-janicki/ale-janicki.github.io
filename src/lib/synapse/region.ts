export type Fold = 'columns' | 'rows'

export interface Region {
  left: number
  top: number
  width: number
  height: number
}

interface ViewportSegments {
  viewport?: { segments?: DOMRect[] | null }
}

export function sceneRegion(fold: Fold | null, width: number, height: number, out: Region): void {
  out.left = 0
  out.top = 0
  out.width = 1
  out.height = 1
  if (fold === null) return
  const segments = (window as ViewportSegments).viewport?.segments
  const [first, second] = segments && segments.length === 2 ? segments : []
  const hinged =
    first && second && (fold === 'columns' ? first.top === second.top : first.left === second.left)
  if (fold === 'columns') {
    out.left = hinged ? first.left / width : 0
    out.width = hinged ? first.width / width : 0.5
  } else {
    out.top = hinged ? first.top / height : 0
    out.height = hinged ? first.height / height : 0.5
  }
}
