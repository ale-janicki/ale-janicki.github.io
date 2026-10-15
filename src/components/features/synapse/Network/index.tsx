import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, Vector2, Vector3, type ShaderMaterial } from 'three'
import type { NetworkLayout } from '@/lib/synapse/buildNetwork'
import { HERO_SLOTS, MAX_BRANCHES } from '@/lib/synapse/length'
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
  isMobile: boolean
}

function createUniforms(isMobile: boolean) {
  return {
    uTime: { value: 0 },
    uOpen: { value: 0 },
    uPaths: { value: 0 },
    uInside: { value: 0 },
    uPixelRatio: { value: 1 },
    uAspect: { value: 1 },
    uCursor: { value: new Vector2(10, 10) },
    uFocus: { value: new Vector3() },
    uNeuronSize: { value: isMobile ? 26 : 28 },
    uImpulseSize: { value: isMobile ? 30 : 32 },
    uNodeGlow: { value: new Float32Array(MAX_BRANCHES) },
    uHero: { value: new Float32Array(HERO_SLOTS).fill(-1) },
  }
}

export function Network({ network, frameRef, isMobile }: NetworkProps) {
  const dpr = useThree((state) => state.viewport.dpr)
  const [uniforms] = useState(() => createUniforms(isMobile))
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
    }
  }, [isMobile])

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
      u.uPaths.value = frame.paths
      u.uAspect.value = size.width / size.height
      u.uCursor.value.copy(frame.cursor)
      u.uNodeGlow.value.set(frame.cards)
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
