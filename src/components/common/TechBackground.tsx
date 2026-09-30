/**
 * BLACK S.H.E.E.P. - Light Theme Motion Graphics Background
 * Palette: Pure White (#FFFFFF), Deep Black (#000000), Scientific Red (#DC2626)
 * Features:
 * - Dynamic Moving Grid Motion Graphics (Horizontal & Vertical translation)
 * - Canvas Particle & Telemetry Node Mesh (Red & Black)
 * - Scientific Red Scanning Beam Sweep
 * - Real-time Coordinate Reticles & Campus Telemetry
 */

import React, { useEffect, useRef } from 'react';

export type BackgroundState = 'NORMAL' | 'AI_ANALYSIS' | 'RAG_SEARCH' | 'ANOMALY' | 'EXPERIMENT';

interface TechBackgroundProps {
  state?: BackgroundState;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  alpha: number;
  color: string;
}

export const TechBackground: React.FC<TechBackgroundProps> = ({ state = 'NORMAL' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const particleCount = width < 768 ? 35 : 70;
    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const isRed = Math.random() > 0.45;
        const color = isRed ? '#DC2626' : '#18181B';
        const baseRadius = isRed ? Math.random() * 2 + 1 : Math.random() * 1.5 + 0.8;
        const alpha = Math.random() * 0.45 + 0.15;

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: baseRadius,
          baseRadius,
          alpha,
          color,
        });
      }
    };

    initParticles();

    // Moving grid offset trackers
    let gridOffsetY = 0;
    let gridOffsetX = 0;

    let lastTime = performance.now();
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // State modifiers
      const isAnomaly = state === 'ANOMALY';
      const isAnalysis = state === 'AI_ANALYSIS';
      const isExperiment = state === 'EXPERIMENT';

      // 1. Draw Moving Grid Motion Graphics on Canvas
      const gridSize = 48;
      const speed = isAnomaly ? 38 : isExperiment ? 28 : 16;
      gridOffsetY = (gridOffsetY + speed * dt) % gridSize;
      gridOffsetX = (gridOffsetX + speed * 0.4 * dt) % gridSize;

      // Draw primary moving vertical lines
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
      for (let x = gridOffsetX; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw primary moving horizontal lines
      for (let y = gridOffsetY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw secondary red accent grid lines (every 4th line)
      const majorGrid = gridSize * 3;
      const majorOffsetY = (gridOffsetY * 1.2) % majorGrid;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.08)';
      for (let y = majorOffsetY; y < height; y += majorGrid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw red intersection crosshairs (+) at selected coordinates
      ctx.fillStyle = '#DC2626';
      for (let x = gridOffsetX + gridSize; x < width; x += gridSize * 2) {
        for (let y = gridOffsetY + gridSize; y < height; y += gridSize * 2) {
          if ((Math.floor(x) + Math.floor(y)) % 5 === 0) {
            ctx.fillRect(x - 3, y - 0.5, 6, 1);
            ctx.fillRect(x - 0.5, y - 3, 1, 6);
          }
        }
      }

      // 2. Draw & update particles
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (isAnalysis) {
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          p.vx += (dx / dist) * 0.35 * dt;
          p.vy += (dy / dist) * 0.35 * dt;
        } else if (isAnomaly) {
          p.vx += (Math.random() - 0.5) * 1.2;
          p.vy += (Math.random() - 0.5) * 1.2;
        }

        // Mouse avoidance
        const mdx = mouseRef.current.x - p.x;
        const mdy = mouseRef.current.y - p.y;
        const mDist = Math.hypot(mdx, mdy);
        if (mDist < 140 && mDist > 0) {
          const force = (140 - mDist) / 140;
          p.x -= (mdx / mDist) * force * 2.0;
          p.y -= (mdy / mDist) * force * 2.0;
        }

        p.vx = Math.max(-1.8, Math.min(1.8, p.vx));
        p.vy = Math.max(-1.8, Math.min(1.8, p.vy));

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 95) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color === '#DC2626' || p2.color === '#DC2626' ? '#DC2626' : '#000000';
            ctx.globalAlpha = (1 - dist / 95) * 0.15;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-white">
      {/* Light Theme Moving Grid Overlay */}
      <div className="absolute inset-0 bg-moving-grid opacity-60" />
      <div className="absolute inset-0 bg-moving-grid-red opacity-30" />

      {/* Subtle Ambient Red Glows for Depth */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-radial from-red-500/10 via-red-500/3 to-transparent blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-radial from-red-600/8 via-zinc-400/5 to-transparent blur-3xl" />
      
      {state === 'ANOMALY' && (
        <div className="absolute inset-0 bg-radial from-red-500/15 via-transparent to-transparent animate-pulse" />
      )}

      {/* Moving Grid Canvas with Interactive Nodes & Crosshairs */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Scientific Red Scanning Laser Sweep */}
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#DC2626] to-transparent animate-scanline pointer-events-none opacity-70 shadow-[0_0_12px_#DC2626]" />

      {/* Classified Light Theme Telemetry Ribbons */}
      <div className="hidden lg:flex absolute top-12 right-8 items-center gap-3 text-[10px] font-mono-data text-black/50 tracking-wider uppercase font-semibold">
        <span className="flex items-center gap-1.5 text-[#DC2626]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-ping" />
          GRID_MOTION: ONLINE
        </span>
        <span className="text-black/30">|</span>
        <span>WORKSPACE: SHARED [ALFA ALIAS & AKASH SANKAR]</span>
        <span className="text-black/30">|</span>
        <span className="text-black/70">SUBJECT: A S REMIN KRISHNA (22, MCA)</span>
      </div>

      <div className="hidden lg:flex absolute bottom-8 left-8 items-center gap-3 text-[10px] font-mono-data text-black/50 tracking-wider uppercase font-semibold">
        <span className="text-black/70">PROTOCOL: BLACK S.H.E.E.P.</span>
        <span className="text-black/30">|</span>
        <span className="text-[#DC2626]">CAMPUS_NODE: KERALA_LDF_MONITOR</span>
        <span className="text-black/30">|</span>
        <span>LEVEL-5 SCIENTIFIC LAB</span>
      </div>
    </div>
  );
};
