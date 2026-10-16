import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, Color, Vector3, type ShaderMaterial } from 'three'
import { SATELLITE_COUNT, buildSatellites } from '@/lib/synapse/satellites'
import type { Frame } from '@/lib/synapse/timeline'
import { satelliteFragment, satelliteVertex, spokeFragment, spokeVertex } from './shaders'

interface SatellitesProps {
  frameRef: RefObject<Frame>
  center: Vector3
  index: number
  color: string
  isMobile: boolean
}

function writeFrame(material: ShaderMaterial | null, frame: Frame, index: number): void {
  if (!material) return
  material.uniforms.uTime.value = frame.time
  material.uniforms.uPresence.value = frame.cards[index]
}

export function Satellites({ frameRef, center, index, color, isMobile }: SatellitesProps) {
  const dpr = useThree((state) => state.viewport.dpr)
  const slots = useMemo(() => buildSatellites(center), [center])
  const [uniforms] = useState(() => ({
    uTime: { value: 0 },
    uPresence: { value: 0 },
    uPixelRatio: { value: 1 },
    uSize: { value: isMobile ? 70 : 90 },
    uColor: { value: new Color(color) },
    uCenter: { value: center.clone() },
  }))
  const pointRef = useRef<ShaderMaterial>(null)
  const spokeRef = useRef<ShaderMaterial>(null)

  const buffers = useMemo(() => {
    const position = new Float32Array(SATELLITE_COUNT * 3)
    const timing = new Float32Array(SATELLITE_COUNT * 2)
    const end = new Float32Array(SATELLITE_COUNT).fill(1)
    slots.forEach((slot, slotIndex) => {
      slot.position.toArray(position, slotIndex * 3)
      timing[slotIndex * 2] = slot.cycle
      timing[slotIndex * 2 + 1] = slot.offset
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
      material.uniforms.uSize.value = isMobile ? 70 : 90
      material.uniforms.uColor.value.set(color)
      material.uniforms.uCenter.value.copy(center)
    }
  }, [isMobile, color, center])

  useEffect(() => {
    for (const material of [pointRef.current, spokeRef.current]) {
      if (material) material.uniforms.uPixelRatio.value = dpr
    }
  }, [dpr])

  useFrame(() => {
    const frame = frameRef.current
    writeFrame(pointRef.current, frame, index)
    writeFrame(spokeRef.current, frame, index)
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
    </>
  )
}
