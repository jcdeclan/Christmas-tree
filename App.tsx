
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { CameraGestureManager } from './components/CameraGestureManager';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.FORMED);
  const [handPos, setHandPos] = useState({ x: 0, y: 0 });
  const [isCameraActive, setIsCameraActive] = useState(false);

  const toggleState = () => {
    setTreeState(prev => prev === TreeState.CHAOS ? TreeState.FORMED : TreeState.CHAOS);
  };

  return (
    <div className="relative w-full h-screen bg-[#011612]">
      {/* UI Overlay */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-serif text-yellow-500 tracking-tighter uppercase drop-shadow-lg">
          Magnificent <span className="block text-2xl md:text-3xl text-emerald-300 font-sans tracking-widest mt-1">Golden Pine</span>
        </h1>
        <p className="text-emerald-100/60 mt-2 max-w-xs font-light uppercase text-xs tracking-[0.2em]">
          Luxury. Power. Tradition.
        </p>
      </div>

      <div className="absolute bottom-8 right-8 z-10 flex flex-col items-end gap-4">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-yellow-500/30 text-right">
          <p className="text-yellow-500 text-xs font-bold uppercase mb-1">Gesture Controller</p>
          <p className="text-white text-sm font-light">
            {isCameraActive ? (
              <span className="flex items-center gap-2 justify-end">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Tracking
              </span>
            ) : "Waiting for Camera..."}
          </p>
          <div className="mt-2 text-[10px] text-emerald-200/50 uppercase">
            Open Hand = Unleash Chaos<br/>
            Closed Fist = Magnificent Form
          </div>
        </div>
        
        <button 
          onClick={toggleState}
          className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(202,138,4,0.4)] transition-all active:scale-95 uppercase tracking-widest text-sm pointer-events-auto"
        >
          {treeState === TreeState.FORMED ? 'Unleash Chaos' : 'Form Magnificence'}
        </button>
      </div>

      {/* Hidden/Minified Camera Preview */}
      <div className="absolute top-8 right-8 z-20 w-32 h-24 rounded-lg overflow-hidden border border-yellow-500/20 shadow-2xl bg-black">
         <CameraGestureManager 
            onGesture={(isOpen) => setTreeState(isOpen ? TreeState.CHAOS : TreeState.FORMED)}
            onMove={(pos) => setHandPos(pos)}
            onReady={() => setIsCameraActive(true)}
         />
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 4, 20], fov: 45 }}
        gl={{ antialias: false, stencil: false, depth: true }}
        className="w-full h-full"
      >
        <Experience treeState={treeState} handPos={handPos} />
      </Canvas>
      
      {/* Decorative Border */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-yellow-600/10" />
    </div>
  );
};

export default App;
