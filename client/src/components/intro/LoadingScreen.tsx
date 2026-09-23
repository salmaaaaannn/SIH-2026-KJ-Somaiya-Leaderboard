import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FastForward, Sparkles, ShieldCheck } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<number>(0);
  const [isSkipped, setIsSkipped] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Canvas Particle & Geometric Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles & 3D rotating geometry
    interface Particle {
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
      speed: number;
    }

    const particles: Particle[] = Array.from({ length: 65 }, () => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * 800 + 100,
      size: Math.random() * 2.5 + 1,
      color: Math.random() > 0.4 ? 'rgba(160, 28, 36, ' : 'rgba(17, 24, 39, ',
      speed: Math.random() * 2 + 1,
    }));

    let angle = 0;

    const render = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Subtle 3D perspective grid lines
      const horizonY = height * 0.65;
      ctx.strokeStyle = 'rgba(160, 28, 36, 0.07)';
      ctx.lineWidth = 1;

      for (let x = -width; x < width * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(width / 2 + (x - width / 2) * 0.1, horizonY);
        ctx.stroke();
      }

      for (let y = horizonY; y <= height; y += 22) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Floating 3D Geometric Cube in center
      angle += 0.015;
      const cx = width / 2;
      const cy = height * 0.38;
      const boxSize = 55;

      const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
      ];

      const projected = vertices.map(([vx, vy, vz]) => {
        // Rotate around Y and X axes
        const radY = angle;
        const radX = angle * 0.6;
        let x1 = vx * Math.cos(radY) - vz * Math.sin(radY);
        let z1 = vx * Math.sin(radY) + vz * Math.cos(radY);
        let y2 = vy * Math.cos(radX) - z1 * Math.sin(radX);
        let z2 = vy * Math.sin(radX) + z1 * Math.cos(radX);

        const fov = 350;
        const scale = fov / (fov + z2 * boxSize);
        return {
          x: cx + x1 * boxSize * scale,
          y: cy + y2 * boxSize * scale,
          scale
        };
      });

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];

      ctx.strokeStyle = '#A01C24';
      ctx.lineWidth = 1.8;
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i].x, projected[i].y);
        ctx.lineTo(projected[j].x, projected[j].y);
        ctx.stroke();
      });

      // Draw nodes
      projected.forEach(p => {
        ctx.fillStyle = '#BA1B1D';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Particles floating towards camera
      particles.forEach(p => {
        p.z -= p.speed;
        if (p.z <= 10) p.z = 800;

        const k = 400 / p.z;
        const px = cx + p.x * k;
        const py = cy + p.y * k;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.min(0.8, (800 - p.z) / 400);
          ctx.fillStyle = `${p.color}${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * k, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Sequence progression
  useEffect(() => {
    if (isSkipped) {
      onComplete();
      return;
    }

    const t1 = setTimeout(() => setPhase(1), 400);  // Somaiya
    const t2 = setTimeout(() => setPhase(2), 1200); // Internal Hackathon
    const t3 = setTimeout(() => setPhase(3), 2000); // SIH 2026
    const t4 = setTimeout(() => setPhase(4), 2800); // Live Leaderboard
    const t5 = setTimeout(() => onComplete(), 3800); // Complete

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isSkipped, onComplete]);

  const handleSkip = () => {
    setIsSkipped(true);
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden select-none"
    >
      {/* 3D Visual Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-somaiya-700 via-amber-500 to-somaiya-700" />

      {/* Cinematic Content Stages */}
      <div className="relative z-10 max-w-3xl px-6 text-center">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div
              key="intro-init"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-somaiya-50 border border-somaiya-200 flex items-center justify-center text-somaiya-700 shadow-glow-red mb-4">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] font-semibold text-gray-500">
                Initializing Live Engine
              </p>
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div
              key="intro-somaiya"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-somaiya-50 text-somaiya-700 text-xs font-semibold tracking-wider uppercase mb-3 border border-somaiya-200">
                <ShieldCheck className="w-3.5 h-3.5 text-somaiya-700" />
                Somaiya Vidyavihar University
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-somaiya-700 tracking-tight">
                K J Somaiya
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                Institute of Management
              </p>
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div
              key="intro-event"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <span className="text-sm tracking-widest font-mono text-gray-500 uppercase mb-2">
                Premier Technical Selection
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-950 uppercase tracking-wide">
                Internal Hackathon
              </h2>
              <div className="h-1 w-24 bg-somaiya-700 rounded-full mt-4" />
            </motion.div>
          )}

          {phase === 3 && (
            <motion.div
              key="intro-sih"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-mono font-bold tracking-widest text-amber-600 uppercase">
                  Ministry of Education &amp; AICTE
                </span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-gray-950 tracking-tight">
                SIH <span className="text-somaiya-700">2026</span>
              </h2>
              <p className="text-base sm:text-lg font-medium text-gray-600 mt-1">
                Smart India Hackathon • Campus Elimination Round
              </p>
            </motion.div>
          )}

          {phase >= 4 && (
            <motion.div
              key="intro-leaderboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                Live Synchronization Active
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase">
                LIVE <span className="text-somaiya-700">LEADERBOARD</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-2 font-mono">
                Real-Time Scoring • Top 5 Qualifiers
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress & Skip Button */}
      <div className="absolute bottom-8 flex flex-col items-center gap-3 z-20">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                phase >= step ? 'w-8 bg-somaiya-700' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold tracking-wide transition-colors border border-gray-200 shadow-sm"
        >
          <FastForward className="w-3.5 h-3.5" />
          Skip Intro
        </button>
      </div>
    </motion.div>
  );
};
