
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrnamentData } from '../types';
import { COLORS } from '../constants';

// Fix for intrinsic element type errors in strict TS environment
const Group = 'group' as any;
const InstancedMesh = 'instancedMesh' as any;
const SphereGeometry = 'sphereGeometry' as any;
const BoxGeometry = 'boxGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;

interface OrnamentsProps {
  data: OrnamentData[];
  progress: React.MutableRefObject<number>;
}

export const Ornaments: React.FC<OrnamentsProps> = ({ data, progress }) => {
  const ballsRef = useRef<THREE.InstancedMesh>(null);
  const boxesRef = useRef<THREE.InstancedMesh>(null);
  const lightsRef = useRef<THREE.InstancedMesh>(null);

  const ballData = useMemo(() => data.filter(d => d.type === 'ball'), [data]);
  const boxData = useMemo(() => data.filter(d => d.type === 'box'), [data]);
  const lightData = useMemo(() => data.filter(d => d.type === 'light'), [data]);

  const dummy = new THREE.Object3D();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const p = progress.current;

    const updateInstances = (mesh: THREE.InstancedMesh | null, subData: OrnamentData[], size: number) => {
      if (!mesh) return;
      subData.forEach((d, i) => {
        const chaos = new THREE.Vector3(...d.chaosPos);
        const target = new THREE.Vector3(...d.targetPos);
        
        // Dynamic Lerp with weight-based sway
        const sway = Math.sin(time + d.id) * (1 - p) * 2;
        const currentPos = new THREE.Vector3().lerpVectors(chaos, target, p);
        currentPos.y += sway * d.weight * 10;
        
        dummy.position.copy(currentPos);
        dummy.scale.setScalar(size * (0.8 + Math.sin(time * 2 + d.id) * 0.1 * p));
        dummy.rotation.set(time * 0.2 * d.id, time * 0.1, 0);
        
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, new THREE.Color(d.color));
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    updateInstances(ballsRef.current, ballData, 0.2);
    updateInstances(boxesRef.current, boxData, 0.15);
    updateInstances(lightsRef.current, lightData, 0.1);
  });

  return (
    <Group>
      <InstancedMesh ref={ballsRef} args={[undefined, undefined, ballData.length]} castShadow>
        <SphereGeometry args={[1, 16, 16]} />
        <MeshStandardMaterial metalness={0.9} roughness={0.1} envMapIntensity={2} />
      </InstancedMesh>
      
      <InstancedMesh ref={boxesRef} args={[undefined, undefined, boxData.length]} castShadow>
        <BoxGeometry args={[1, 1, 1]} />
        <MeshStandardMaterial metalness={0.7} roughness={0.2} />
      </InstancedMesh>

      <InstancedMesh ref={lightsRef} args={[undefined, undefined, lightData.length]}>
        <SphereGeometry args={[1, 8, 8]} />
        <MeshBasicMaterial />
      </InstancedMesh>
    </Group>
  );
};
