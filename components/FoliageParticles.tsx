
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PARTICLE_COUNT, TREE_HEIGHT, TREE_RADIUS, CHAOS_RADIUS, COLORS } from '../constants';

// Fix for intrinsic element type errors in strict TS environment
const Points = 'points' as any;
const BufferGeometry = 'bufferGeometry' as any;
const BufferAttribute = 'bufferAttribute' as any;
const ShaderMaterial = 'shaderMaterial' as any;

interface FoliageParticlesProps {
  progress: React.MutableRefObject<number>;
}

export const FoliageParticles: React.FC<FoliageParticlesProps> = ({ progress }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const [positionsA, positionsB, colors] = useMemo(() => {
    const posA = new Float32Array(PARTICLE_COUNT * 3);
    const posB = new Float32Array(PARTICLE_COUNT * 3);
    const cols = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // CHAOS (A)
      const rC = Math.random() * CHAOS_RADIUS;
      const thetaC = Math.random() * Math.PI * 2;
      const phiC = Math.acos(2 * Math.random() - 1);
      posA[i * 3] = rC * Math.sin(phiC) * Math.cos(thetaC);
      posA[i * 3 + 1] = rC * Math.sin(phiC) * Math.sin(thetaC);
      posA[i * 3 + 2] = rC * Math.cos(phiC);

      // TREE (B)
      const y = Math.random() * TREE_HEIGHT;
      const r = (TREE_HEIGHT - y) / TREE_HEIGHT * TREE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      posB[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * 0.2;
      posB[i * 3 + 1] = y - TREE_HEIGHT / 4;
      posB[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 0.2;

      // COLORS (Emerald to Gold mix)
      const mix = Math.random();
      const c = new THREE.Color(mix > 0.8 ? COLORS.GOLD_BRIGHT : COLORS.EMERALD_DEEP);
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }

    return [posA, posB, cols];
  }, []);

  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uSize: { value: 20.0 }
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = progress.current;
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <Points ref={pointsRef}>
      <BufferGeometry>
        <BufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positionsB} itemSize={3} />
        <BufferAttribute attach="attributes-posA" count={PARTICLE_COUNT} array={positionsA} itemSize={3} />
        <BufferAttribute attach="attributes-posB" count={PARTICLE_COUNT} array={positionsB} itemSize={3} />
        <BufferAttribute attach="attributes-color" count={PARTICLE_COUNT} array={colors} itemSize={3} />
      </BufferGeometry>
      <ShaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute vec3 posA;
          attribute vec3 posB;
          uniform float uProgress;
          uniform float uTime;
          uniform float uSize;
          varying vec3 vColor;
          
          void main() {
            vColor = color;
            // Lerp position
            vec3 pos = mix(posA, posB, uProgress);
            
            // Add subtle floating motion
            pos.x += sin(uTime * 0.5 + pos.y) * (1.0 - uProgress) * 0.5;
            pos.z += cos(uTime * 0.5 + pos.x) * (1.0 - uProgress) * 0.5;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = uSize * (1.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = smoothstep(0.5, 0.2, dist);
            gl_FragColor = vec4(vColor, alpha * 0.8);
          }
        `}
        vertexColors
      />
    </Points>
  );
};
