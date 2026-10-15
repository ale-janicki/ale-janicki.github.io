let cached: boolean | null = null

export function supportsWebGL(): boolean {
  if (cached !== null) return cached
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
  cached = Boolean(gl)
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
  return cached
}
