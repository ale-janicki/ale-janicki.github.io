import { RHYTHM_RUN } from '@/lib/synapse/buildNetwork'
import {
  HERO_SLOTS,
  LINK_LAYER_STEP,
  MAX_BRANCHES,
  MAX_LINKS,
  MAX_MILESTONES,
} from '@/lib/synapse/length'

const common = `
  #define MAX_BRANCHES ${MAX_BRANCHES}
  #define NODE_SLOTS ${MAX_BRANCHES + MAX_MILESTONES}
  #define HERO_SLOTS ${HERO_SLOTS}
  #define MAX_LINKS ${MAX_LINKS}
  #define LINK_STEP ${LINK_LAYER_STEP.toFixed(3)}
  #define RHYTHM_RUN ${RHYTHM_RUN.toFixed(2)}

  uniform float uTime;
  uniform float uOpen;
  uniform float uInside;
  uniform float uLink;
  uniform float uKlaus;
  uniform float uPixelRatio;
  uniform float uAspect;
  uniform vec2 uCursor;
  uniform vec3 uKlausColor;
  uniform vec3 uFocus;
  uniform float uLinkGlow[MAX_LINKS];

  float linkGlow(float layer) {
    int index = int(floor((layer - 2.0) / LINK_STEP + 0.5));
    return uLinkGlow[clamp(index, 0, MAX_LINKS - 1)];
  }

  float layerVisibility(float layer, vec3 p) {
    if (layer < 0.5) return 1.0;
    if (layer > 2.5) return (1.0 - 0.45 * uOpen) * (1.0 - 0.5 * uInside) * (1.0 - 0.8 * uKlaus);
    float dim = 1.0 - 0.8 * uKlaus;
    float lit = max(uInside, 0.75 * uLink);
    if (layer < 1.5) return mix(0.38 * uOpen, 1.0, lit) * dim;
    return max(max(uLink, linkGlow(layer)), 0.2 * uInside) * dim;
  }

  float outside() {
    return uOpen * (1.0 - uInside);
  }

  float depthSide(float depth) {
    float anchor = -(modelViewMatrix * vec4(uFocus, 1.0)).z;
    return 1.0 - 0.75 * smoothstep(-0.4, 2.2, depth - anchor);
  }

  float linkFocus() {
    return uLink * (1.0 - uKlaus);
  }

  float calm() {
    return mix(0.34, 1.0, outside()) * (1.0 - 0.45 * linkFocus());
  }

  float crispness(float layer, float depth) {
    float close = mix(0.5, 1.0, smoothstep(0.8, 3.2, depth));
    if (layer < 0.5) return close;
    return layer > 2.5 ? 1.0 : mix(1.0, close, uInside);
  }

  float nearness(float layer, float depth) {
    float tight = smoothstep(0.25, 1.1, depth);
    if (layer < 0.5 || layer > 2.5) return tight;
    return mix(smoothstep(0.9, 2.6, depth), tight, uInside);
  }

  float cursorGlow(vec4 clip) {
    vec2 ndc = clip.xy / clip.w;
    return 1.0 - smoothstep(0.0, 0.34, length((ndc - uCursor) * vec2(uAspect, 1.0)));
  }
`

const softFragment = `
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

export const neuronVertex = `
  ${common}
  uniform float uNeuronSize;
  uniform float uNodeGlow[NODE_SLOTS];
  attribute vec3 aColor;
  attribute float aScale;
  attribute float aLayer;
  attribute vec3 aMeta;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float phase = aMeta.x * 6.2831;
    bool isCore = aLayer < 0.5;
    bool isMe = aLayer > 2.5;
    vec3 p = position + (isMe ? 0.0 : 0.05) * vec3(sin(uTime * 0.3 + phase), cos(uTime * 0.27 + phase * 2.0), sin(uTime * 0.22 + phase * 3.0));
    if (isCore) p *= 1.0 + 0.014 * sin(uTime * 0.9) + 0.02 * uKlaus;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;

    float wave = pow(0.5 + 0.5 * sin(uTime * 0.55 + phase - length(p) * 1.6), 4.0);
    float thought = isCore ? pow(0.5 + 0.5 * sin(uTime * 0.8 + p.x * 1.1 - p.y * 0.7), 6.0) : 0.0;
    float glow = aMeta.y > 0.5 ? uNodeGlow[max(int(aMeta.y + 0.5) - 1, 0)] : 0.0;
    float beat = 0.0;
    if (aMeta.z > 0.0) {
      float delay = (aMeta.y > 0.5 || isMe) ? 0.0 : aMeta.x * 0.35;
      float since = mod(uTime - RHYTHM_RUN - delay, aMeta.z);
      beat = pow(max(0.0, 1.0 - since / 0.55), 2.0);
    }
    float klaus = isCore ? uKlaus : 0.0;
    float side = isCore ? depthSide(depth) : 1.0;
    float ambient = 0.5 + 0.55 * wave + 0.5 * thought;
    float brightness = (isCore ? ambient * calm() : ambient) + 0.9 * cursorGlow(gl_Position) + 0.7 * glow + 1.1 * beat;
    brightness *= (1.0 + 0.9 * klaus) * (isCore ? side : 1.35 * (1.0 + 0.7 * linkFocus()));
    if (isMe) brightness = 1.6 + 2.4 * beat + 2.2 * glow;

    float size = aScale * (1.0 + 0.9 * glow + 0.9 * beat + 0.3 * thought + 0.35 * klaus);
    float crisp = crispness(aLayer, depth);
    float limit = isMe ? 90.0 : 24.0;
    gl_PointSize = clamp(uNeuronSize * size * crisp * uPixelRatio / pow(max(depth, 0.1), 0.55), 1.6 * uPixelRatio, limit * uPixelRatio);
    float nearFade = nearness(aLayer, depth);
    float bulk = isMe ? 1.0 : aMeta.y > 0.5 ? 0.55 : 1.0 / (0.55 + 0.45 * aScale);

    vec3 dull = isCore ? mix(vec3(0.62, 0.46, 0.4), vec3(1.0), outside()) : vec3(1.0);
    vColor = mix(aColor, uKlausColor, klaus * 0.55) * dull * brightness;
    vAlpha = layerVisibility(aLayer, p) * nearFade * bulk;
  }
`

export const neuronFragment = softFragment

export const lineVertex = `
  ${common}
  attribute vec4 aColor;
  attribute float aLayer;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    bool isCore = aLayer < 0.5;
    float klaus = isCore ? uKlaus : 0.0;
    vColor = mix(aColor.rgb, uKlausColor, klaus * 0.6);
    float lit = 1.0 + 0.8 * klaus;
    float cursor = isCore ? cursorGlow(gl_Position) * 0.12 : 0.0;
    float quiet = isCore ? mix(depthSide(-mv.z) * calm(), 1.0 - 0.45 * linkFocus(), outside()) : 1.0 + 0.7 * linkFocus();
    float near = aLayer > 2.5 ? 1.0 : smoothstep(0.2, 0.9, -mv.z);
    vAlpha = (aColor.a * quiet + cursor) * lit * near * layerVisibility(aLayer, position);
  }
`

export const lineFragment = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
    #include <colorspace_fragment>
  }
`

export const impulseVertex = `
  ${common}
  uniform float uImpulseSize;
  uniform float uHero[HERO_SLOTS];
  attribute vec3 aP0;
  attribute vec3 aP1;
  attribute vec3 aP2;
  attribute vec3 aP3;
  attribute vec3 aColor;
  attribute vec4 aMotion;
  attribute vec4 aShape;
  varying vec3 vColor;
  varying float vAlpha;

  vec3 bezier(vec3 a, vec3 b, vec3 c, vec3 d, float t) {
    float m = 1.0 - t;
    return m * m * m * a + 3.0 * m * m * t * b + 3.0 * m * t * t * c + t * t * t * d;
  }

  void main() {
    float head;
    if (aMotion.w > 0.5) {
      head = uHero[int(aMotion.w + 0.5) - 1];
    } else if (aMotion.z > 0.0) {
      head = fract((uTime + aMotion.y) / aMotion.z) * aMotion.z / RHYTHM_RUN;
    } else {
      head = fract(uTime * aMotion.x + aMotion.y);
    }
    float t = head - aShape.y * aShape.z;
    if (head < 0.0 || t < 0.0 || t > 1.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      vAlpha = 0.0;
      vColor = vec3(0.0);
      return;
    }

    vec3 p = bezier(aP0, aP1, aP2, aP3, t);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    float size = aShape.x * (1.0 - 0.13 * aShape.y);
    bool isCore = aShape.w < 0.5;
    bool isMe = aShape.w > 2.5;
    float crisp = crispness(aShape.w, depth);
    float limit = isMe ? 40.0 : 30.0;
    gl_PointSize = clamp(uImpulseSize * size * crisp * uPixelRatio / pow(max(depth, 0.1), 0.55), 2.2 * uPixelRatio, limit * uPixelRatio);

    float ends = smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.93, 1.0, t));
    float trail = pow(1.0 - aShape.y / 4.5, 1.6);
    float nearFade = nearness(aShape.w, depth);
    float quiet = isCore ? mix(depthSide(depth) * calm(), 1.0 - 0.45 * linkFocus(), outside()) : 1.0 + 0.7 * linkFocus();
    vColor = aColor;
    vAlpha = ends * trail * nearFade * quiet * layerVisibility(aShape.w, p);
  }
`

export const impulseFragment = softFragment
