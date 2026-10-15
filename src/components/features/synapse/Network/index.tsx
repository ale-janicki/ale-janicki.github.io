import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, Color, Vector2, Vector3, type ShaderMaterial } from 'three'
import type { NetworkLayout } from '@/lib/synapse/buildNetwork'
import { HERO_SLOTS, MAX_BRANCHES, MAX_LINKS, MAX_MILESTONES } from '@/lib/synapse/length'
import type { Frame } from '@/lib/synapse/timeline'
import {
  impulseFragment,
  impulseVertex,
  lineFragment,
  lineVertex,
  neuronFragment,
  neuronVertex,
} from './shaders'

interface NetworkProps {
  network: NetworkLayout
  frameRef: RefObject<Frame>
  klausColor: string
  isMobile: boolean
}

function createUniforms(klausColor: string, isMobile: boolean) {
  return {
    uTime: { value: 0 },
    uOpen: { value: 0 },
    uInside: { value: 0 },
    uLink: { value: 0 },
    uKlaus: { value: 0 },
    uPixelRatio: { value: 1 },
    uAspect: { value: 1 },
    uCursor: { value: new Vector2(10, 10) },
    uKlausColor: { value: new Color(klausColor) },
    uFocus: { value: new Vector3() },
    uNeuronSize: { value: isMobile ? 26 : 28 },
    uImpulseSize: { value: isMobile ? 30 : 32 },
    uNodeGlow: { value: new Float32Array(MAX_BRANCHES + MAX_MILESTONES) },
    uHero: { value: new Float32Array(HERO_SLOTS).fill(-1) },
    uLinkGlow: { value: new Float32Array(MAX_LINKS) },
  }
}

export function Network({ network, frameRef, klausColor, isMobile }: NetworkProps) {
  const dpr = useThree((state) => state.viewport.dpr)
  const [uniforms] = useState(() => createUniforms(klausColor, isMobile))
  const neuronRef = useRef<ShaderMaterial>(null)
  const lineRef = useRef<ShaderMaterial>(null)
  const impulseRef = useRef<ShaderMaterial>(null)
  const { neurons, lines, impulses } = network
  const impulseCount = impulses.color.length / 3
  const impulseOrigin = useMemo(() => new Float32Array(impulseCount * 3), [impulseCount])

  useEffect(() => {
    for (const material of [neuronRef.current, lineRef.current, impulseRef.current]) {
      if (!material) continue
      material.uniforms.uNeuronSize.value = isMobile ? 26 : 28
      material.uniforms.uImpulseSize.value = isMobile ? 30 : 32
      material.uniforms.uKlausColor.value.set(klausColor)
    }
  }, [isMobile, klausColor])

  useEffect(() => {
    for (const material of [neuronRef.current, lineRef.current, impulseRef.current]) {
      if (material) material.uniforms.uPixelRatio.value = dpr
    }
  }, [dpr])

  useFrame(({ size }) => {
    const frame = frameRef.current
    for (const material of [neuronRef.current, lineRef.current, impulseRef.current]) {
      if (!material) continue
      const u = material.uniforms
      u.uTime.value = frame.time
      u.uOpen.value = frame.open
      u.uInside.value = frame.inside
      u.uFocus.value.copy(frame.pose.look)
      u.uLink.value = frame.link
      u.uKlaus.value = frame.klaus
      u.uAspect.value = size.width / size.height
      u.uCursor.value.copy(frame.cursor)
      u.uNodeGlow.value.set(frame.cards)
      u.uNodeGlow.value.set(frame.milestoneGlow, MAX_BRANCHES)
      u.uLinkGlow.value.set(frame.linkGlow)
      u.uHero.value.set(frame.hero)
    }
  })

  return (
    <>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[neurons.position, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[neurons.color, 3]} />
          <bufferAttribute attach="attributes-aScale" args={[neurons.scale, 1]} />
          <bufferAttribute attach="attributes-aLayer" args={[neurons.layer, 1]} />
          <bufferAttribute attach="attributes-aMeta" args={[neurons.meta, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={neuronRef}
          uniforms={uniforms}
          vertexShader={neuronVertex}
          fragmentShader={neuronFragment}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines.position, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[lines.color, 4]} />
          <bufferAttribute attach="attributes-aLayer" args={[lines.layer, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={lineRef}
          uniforms={uniforms}
          vertexShader={lineVertex}
          fragmentShader={lineFragment}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </lineSegments>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[impulseOrigin, 3]} />
          <bufferAttribute attach="attributes-aP0" args={[impulses.p0, 3]} />
          <bufferAttribute attach="attributes-aP1" args={[impulses.p1, 3]} />
          <bufferAttribute attach="attributes-aP2" args={[impulses.p2, 3]} />
          <bufferAttribute attach="attributes-aP3" args={[impulses.p3, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[impulses.color, 3]} />
          <bufferAttribute attach="attributes-aMotion" args={[impulses.motion, 4]} />
          <bufferAttribute attach="attributes-aShape" args={[impulses.shape, 4]} />
        </bufferGeometry>
        <shaderMaterial
          ref={impulseRef}
          uniforms={uniforms}
          vertexShader={impulseVertex}
          fragmentShader={impulseFragment}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </>
  )
}
