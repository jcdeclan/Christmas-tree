
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image, Text } from '@react-three/drei';
import * as THREE from 'three';
import { PolaroidData } from '../types';

// Fix for intrinsic element type errors in strict TS environment
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const PlaneGeometry = 'planeGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;

interface PolaroidsProps {
  data: PolaroidData[];
  progress: React.MutableRefObject<number>;
}

export const Polaroids: React.FC<PolaroidsProps> = ({ data, progress }) => {
  return (
    <Group>
      {data.map((p) => (
        <Polaroid key={p.id} data={p} progress={progress} />
      ))}
    </Group>
  );
};

const Polaroid: React.FC<{ data: PolaroidData; progress: React.MutableRefObject<number> }> = ({ data, progress }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const p = progress.current;
    
    const chaos = new THREE.Vector3(...data.chaosPos);
    const target = new THREE.Vector3(...data.targetPos);
    
    // Smooth position and rotation lerp
    meshRef.current.position.lerpVectors(chaos, target, p);
    
    const targetRot = new THREE.Euler(...data.rotation);
    const chaosRot = new THREE.Euler(Math.sin(data.id), Math.cos(data.id), 0);
    
    meshRef.current.rotation.x = THREE.MathUtils.lerp(chaosRot.x, targetRot.x, p);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(chaosRot.y, targetRot.y, p);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(chaosRot.z, targetRot.z, p);
    
    // Gentle sway when formed
    if (p > 0.9) {
        meshRef.current.rotation.z += Math.sin(state.clock.elapsedTime + data.id) * 0.05;
    }
  });

  return (
    <Group ref={meshRef}>
      {/* Golden Frame */}
      <Mesh position={[0, 0, -0.01]}>
        <PlaneGeometry args={[1.6, 2.0]} />
        <MeshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
      </Mesh>
      {/* White Polaroid Border */}
      <Mesh position={[0, 0, 0]}>
        <PlaneGeometry args={[1.5, 1.9]} />
        <MeshStandardMaterial color="#fff" />
      </Mesh>
      {/* The Photo */}
      <Image 
        url={data.url} 
        position={[0, 0.2, 0.01]} 
        scale={[1.3, 1.3]} 
        toneMapped={false}
      />
      {/* Handwriting Label */}
      <Text
        position={[0, -0.7, 0.01]}
        fontSize={0.12}
        color="#333"
        font="https://fonts.gstatic.com/s/caveat/v10/Wnz_HAUq_onIuXNf300v.woff"
      >
        Luxury Memories '{data.id + 2020}
      </Text>
    </Group>
  );
};
