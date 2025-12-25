
import React, { useMemo } from 'react';
import { OrbitControls, Environment, PerspectiveCamera, Float } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { TreeSystem } from './TreeSystem';
import { TreeState } from '../types';
import { COLORS } from '../constants';

// Fix for intrinsic element type errors in strict TS environment
const Color = 'color' as any;
const AmbientLight = 'ambientLight' as any;
const SpotLight = 'spotLight' as any;
const PointLight = 'pointLight' as any;
const Mesh = 'mesh' as any;
const CircleGeometry = 'circleGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;

interface ExperienceProps {
  treeState: TreeState;
  handPos: { x: number; y: number };
}

export const Experience: React.FC<ExperienceProps> = ({ treeState, handPos }) => {
  return (
    <>
      <Color attach="background" args={['#01100b']} />
      
      <PerspectiveCamera makeDefault position={[0, 4, 20]} />
      <OrbitControls 
        enablePan={false} 
        maxDistance={35} 
        minDistance={5} 
        autoRotate={treeState === TreeState.FORMED}
        autoRotateSpeed={0.5}
      />

      {/* Lighting */}
      <AmbientLight intensity={0.2} />
      <SpotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={2} color={COLORS.GOLD_BRIGHT} />
      <PointLight position={[-10, 5, -5]} intensity={1} color={COLORS.EMERALD_DEEP} />

      {/* Environment for Reflections */}
      <Environment preset="lobby" />

      {/* The Core Tree Logic */}
      <TreeSystem treeState={treeState} handPos={handPos} />

      {/* Post Processing for Cinematic Feel */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          intensity={1.2} 
          mipmapBlur 
          radius={0.4} 
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
      
      {/* Luxurious Base/Floor */}
      <Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <CircleGeometry args={[20, 64]} />
        <MeshStandardMaterial 
            color="#000" 
            roughness={0.1} 
            metalness={0.8} 
            envMapIntensity={0.5} 
        />
      </Mesh>
    </>
  );
};
