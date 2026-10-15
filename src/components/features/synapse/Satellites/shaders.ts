import { ATTACK, DECAY_END, DECAY_START, TRAVEL } from '@/lib/synapse/satellites'

const lifeChunk = `
  uniform float uTime;
  uniform float uPresence;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform vec3 uColor;
  uniform vec3 uCenter;
  attribute vec2 aTiming;
  attribute float aEnd;
  varying vec3 vColor;
  varying float vAlpha;

  float lifeOf() {
    return fract((uTime + aTiming.y) / aTiming.x);
  }

  float alphaOf(float life) {
    return smoothstep(0.0, ${ATTACK.toFixed(2)}, life) * (1.0 - smoothstep(${DECAY_START.toFixed(2)}, ${DECAY_END.toFixed(2)}, life)) * uPresence;
  }

  vec3 placed(float life) {
    float travel = 1.0 - pow(1.0 - min(life / ${TRAVEL.toFixed(2)}, 1.0), 3.0);
    return uCenter + position * (aEnd * travel);
  }
`

export const satelliteVertex = `
  ${lifeChunk}

  void main() {
    float life = lifeOf();
    vec4 mv = modelViewMatrix * vec4(placed(life), 1.0);
    gl_Position = projectionMatrix * mv;
    float flash = 1.0 + 1.8 * exp(-life * 14.0);
    gl_PointSize = clamp(uSize * flash * uPixelRatio / pow(max(-mv.z, 0.1), 0.55), 2.0 * uPixelRatio, 22.0 * uPixelRatio);
    vColor = mix(uColor, vec3(1.0), 0.4);
    vAlpha = alphaOf(life) * smoothstep(0.25, 0.9, -mv.z);
  }
`

export const satelliteFragment = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
    float soft = pow(1.0 - smoothstep(0.0, 1.0, d), 2.4);
    float hot = 1.0 - smoothstep(0.0, 0.3, d);
    gl_FragColor = vec4(vColor, (soft * 0.8 + hot * 0.45) * vAlpha);
    #include <colorspace_fragment>
  }
`

export const spokeVertex = `
  ${lifeChunk}

  void main() {
    float life = lifeOf();
    gl_Position = projectionMatrix * modelViewMatrix * vec4(placed(life), 1.0);
    vColor = uColor;
    vAlpha = alphaOf(life) * 0.45;
  }
`

export const spokeFragment = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
    #include <colorspace_fragment>
  }
`
