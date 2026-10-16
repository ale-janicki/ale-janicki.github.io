import { supportsWebGL } from '@/lib/supportsWebGL'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type RenderMode = 'flight' | 'static' | 'fallback'

export function useRenderMode(sceneFailed: boolean): RenderMode {
  const reducedMotion = useReducedMotion()
  if (sceneFailed || !supportsWebGL()) return 'fallback'
  return reducedMotion ? 'static' : 'flight'
}
