import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { AdditiveBlending, Color, type ShaderMaterial } from 'three'
import { useFadeRef } from '@/hooks/useFadeRef'
import {
  LABELED_SATELLITES,
  SATELLITE_COUNT,
  buildSatellites,
  satelliteAlpha,
  type SatelliteSlot,
} from '@/lib/synapse/satellites'
import { KLAUS_DIRECTION, type Frame } from '@/lib/synapse/timeline'
import { satelliteFragment, satelliteVertex, spokeFragment, spokeVertex } from './shaders'
import styles from './styles.module.css'

interface SatellitesProps {
  frameRef: RefObject<Frame>
  labels: string[]
  klausColor: string
  isMobile: boolean
}

interface SatelliteLabelProps {
  slot: SatelliteSlot
  text: string
  frameRef: RefObject<Frame>
}

function SatelliteLabel({ slot, text, frameRef }: SatelliteLabelProps) {
  const ref = useFadeRef<HTMLSpanElement>(
    frameRef,
    (frame) => satelliteAlpha(frame.time, slot) * frame.finale,
  )
  return (
    <Html position={slot.position} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <span ref={ref} className={styles.label}>
        {text}
      </span>
    </Html>
  )
}

export function Satellites({ frameRef, labels, klausColor, isMobile }: SatellitesProps) {
  const dpr = useThree((state) => state.viewport.dpr)
  const slots = useMemo(() => buildSatellites(KLAUS_DIRECTION), [])
  const [uniforms] = useState(() => ({
    uTime: { value: 0 },
    uKlaus: { value: 0 },
    uPixelRatio: { value: 1 },
    uSize: { value: isMobile ? 100 : 130 },
    uKlausColor: { value: new Color(klausColor) },
  }))
  const pointRef = useRef<ShaderMaterial>(null)
  const spokeRef = useRef<ShaderMaterial>(null)

  const buffers = useMemo(() => {
    const position = new Float32Array(SATELLITE_COUNT * 3)
    const timing = new Float32Array(SATELLITE_COUNT * 2)
    const end = new Float32Array(SATELLITE_COUNT).fill(1)
    slots.forEach((slot, index) => {
      slot.position.toArray(position, index * 3)
      timing[index * 2] = slot.cycle
      timing[index * 2 + 1] = slot.offset
    })
    const spokePosition = new Float32Array(SATELLITE_COUNT * 6)
    const spokeTiming = new Float32Array(SATELLITE_COUNT * 4)
    const spokeEnd = new Float32Array(SATELLITE_COUNT * 2)
    for (let i = 0; i < SATELLITE_COUNT; i++) {
      for (let k = 0; k < 2; k++) {
        spokePosition.set(position.subarray(i * 3, i * 3 + 3), (i * 2 + k) * 3)
        spokeTiming.set(timing.subarray(i * 2, i * 2 + 2), (i * 2 + k) * 2)
        spokeEnd[i * 2 + k] = k
      }
    }
    return { position, timing, end, spokePosition, spokeTiming, spokeEnd }
  }, [slots])

  useEffect(() => {
    for (const material of [pointRef.current, spokeRef.current]) {
      if (!material) continue
      material.uniforms.uSize.value = isMobile ? 100 : 130
      material.uniforms.uKlausColor.value.set(klausColor)
    }
  }, [isMobile, klausColor])

  useEffect(() => {
    for (const material of [pointRef.current, spokeRef.current]) {
      if (material) material.uniforms.uPixelRatio.value = dpr
    }
  }, [dpr])

  useFrame(() => {
    const frame = frameRef.current
    for (const material of [pointRef.current, spokeRef.current]) {
      if (!material) continue
      material.uniforms.uTime.value = frame.time
      material.uniforms.uKlaus.value = frame.klaus
    }
  })

  return (
    <>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[buffers.position, 3]} />
          <bufferAttribute attach="attributes-aTiming" args={[buffers.timing, 2]} />
          <bufferAttribute attach="attributes-aEnd" args={[buffers.end, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={pointRef}
          uniforms={uniforms}
          vertexShader={satelliteVertex}
          fragmentShader={satelliteFragment}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[buffers.spokePosition, 3]} />
          <bufferAttribute attach="attributes-aTiming" args={[buffers.spokeTiming, 2]} />
          <bufferAttribute attach="attributes-aEnd" args={[buffers.spokeEnd, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={spokeRef}
          uniforms={uniforms}
          vertexShader={spokeVertex}
          fragmentShader={spokeFragment}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </lineSegments>
      {labels.slice(0, LABELED_SATELLITES).map((text, index) => (
        <SatelliteLabel key={text} slot={slots[index]} text={text} frameRef={frameRef} />
      ))}
    </>
  )
}
