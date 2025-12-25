
import React, { useRef, useEffect } from 'react';

interface CameraGestureManagerProps {
  onGesture: (isOpen: boolean) => void;
  onMove: (pos: { x: number; y: number }) => void;
  onReady: () => void;
}

export const CameraGestureManager: React.FC<CameraGestureManagerProps> = ({ onGesture, onMove, onReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrame: number;
    let stream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          onReady();
          processVideo();
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };

    // Simplified gesture detection logic:
    // We calculate "brightness" and "change" in specific regions
    // Or just track the movement of the brightest point
    const processVideo = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const analyze = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let totalBrightness = 0;
        let avgX = 0;
        let avgY = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          const brightness = (r + g + b) / 3;
          
          // Detect skin-ish or bright colors for basic hand tracking
          if (brightness > 180) { 
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);
            avgX += x;
            avgY += y;
            count++;
          }
          totalBrightness += brightness;
        }

        if (count > 0) {
          const x = (avgX / count / canvas.width) * 2 - 1;
          const y = (avgY / count / canvas.height) * 2 - 1;
          onMove({ x, y: -y }); // Invert Y for 3D space
          
          // Heuristic: If count is large, hand is "Open" (unleash chaos)
          // If count is small, hand is "Closed" (formed tree)
          const isOpen = count > 800; 
          onGesture(isOpen);
        }

        animationFrame = requestAnimationFrame(analyze);
      };

      analyze();
    };

    initCamera();

    return () => {
      cancelAnimationFrame(animationFrame);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onGesture, onMove, onReady]);

  return (
    <div className="relative w-full h-full">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover grayscale scale-x-[-1]" 
      />
      <canvas ref={canvasRef} width={160} height={120} className="hidden" />
      <div className="absolute inset-0 bg-yellow-500/10 pointer-events-none" />
    </div>
  );
};
