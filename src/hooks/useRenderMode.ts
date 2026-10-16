import { supportsWebGL } from '@/lib/supportsWebGL'

type RenderMode = 'flight' | 'fallback'

export function useRenderMode(sceneFailed: boolean): RenderMode {
  return sceneFailed || !supportsWebGL() ? 'fallback' : 'flight'
}
