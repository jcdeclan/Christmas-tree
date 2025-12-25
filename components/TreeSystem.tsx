
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FoliageParticles } from './FoliageParticles';
import { Ornaments } from './Ornaments';
import { Polaroids } from './Polaroids';
import { TreeState, OrnamentData, PolaroidData } from '../types';
import { 
  TREE_HEIGHT, 
  TREE_RADIUS, 
  CHAOS_RADIUS, 
  ORNAMENT_COUNT, 
  POLAROID_COUNT,
  COLORS,
  ORNAMENT_TYPES
} from '../constants';

// Fix for intrinsic element type errors in strict TS environment
const Group = 'group' as any;

interface TreeSystemProps {
  treeState: TreeState;
  handPos: { x: number; y: number };
}

export const TreeSystem: React.FC<TreeSystemProps> = ({ treeState, handPos }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lerpProgress = useRef(0);

  // Pre-calculate positions for ornaments
  const ornamentData = useMemo(() => {
    const data: OrnamentData[] = [];
    for (let i = 0; i < ORNAMENT_COUNT; i++) {
      // Chaos position: Random sphere
      const chaosRadius = Math.random() * CHAOS_RADIUS;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const cx = chaosRadius * Math.sin(phi) * Math.cos(theta);
      const cy = chaosRadius * Math.sin(phi) * Math.sin(theta);
      const cz = chaosRadius * Math.cos(phi);

      // Target position: Cone shape
      const y = Math.random() * TREE_HEIGHT;
      const rAtY = (TREE_HEIGHT - y) / TREE_HEIGHT * TREE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      const tx = Math.cos(angle) * rAtY;
      const tz = Math.sin(angle) * rAtY;
      const ty = y - TREE_HEIGHT / 4; // Center it a bit

      const typeIdx = Math.floor(Math.random() * ORNAMENT_TYPES.length);
      const weight = typeIdx === 0 ? 0.05 : typeIdx === 1 ? 0.02 : 0.01; // Box > Ball > Light

      data.push({
        id: i,
        chaosPos: [cx, cy, cz],
        targetPos: [tx, ty, tz],
        type: ORNAMENT_TYPES[typeIdx],
        weight,
        color: i % 2 === 0 ? COLORS.GOLD_BRIGHT : COLORS.LUXURY_RED
      });
    }
    return data;
  }, []);

  // Pre-calculate positions for polaroids
  const polaroidData = useMemo(() => {
    const data: PolaroidData[] = [];
    for (let i = 0; i < POLAROID_COUNT; i++) {
       const chaosPos: [number, number, number] = [
        (Math.random() - 0.5) * CHAOS_RADIUS * 1.5,
        (Math.random() - 0.5) * CHAOS_RADIUS * 1.5,
        (Math.random() - 0.5) * CHAOS_RADIUS * 1.5
      ];
      
      const angle = (i / POLAROID_COUNT) * Math.PI * 2;
      const y = 1 + (i / POLAROID_COUNT) * TREE_HEIGHT * 0.7;
      const r = (TREE_HEIGHT - y) / TREE_HEIGHT * TREE_RADIUS * 1.1;
      
      const targetPos: [number, number, number] = [
        Math.cos(angle) * r,
        y - TREE_HEIGHT / 4,
        Math.sin(angle) * r
      ];

      data.push({
        id: i,
        chaosPos,
        targetPos,
        rotation: [0, -angle, 0],
        url: `https://picsum.photos/seed/${i + 42}/400/500`
      });
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    // Smooth transition between states
    const targetValue = treeState === TreeState.FORMED ? 1 : 0;
    lerpProgress.current = THREE.MathUtils.lerp(lerpProgress.current, targetValue, delta * 2.5);

    if (groupRef.current) {
      // Subtle interaction based on hand position
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, handPos.x * 3, delta * 3);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, handPos.y * 3, delta * 3);
    }
  });

  return (
    <Group ref={groupRef}>
      <FoliageParticles progress={lerpProgress} />
      <Ornaments data={ornamentData} progress={lerpProgress} />
      <Polaroids data={polaroidData} progress={lerpProgress} />
    </Group>
  );
};
