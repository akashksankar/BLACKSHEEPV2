/**
 * BLACK S.H.E.E.P. - Section 18: Emotional Core Visualization
 * Light Theme: Pure White (#FFFFFF), Deep Black (#000000), Scientific Red (#DC2626)
 * Central Node surrounded by orbiting radial emotional indicators
 */

import React from 'react';
import { Heart } from 'lucide-react';
import { EmotionalState } from '../../../types';

interface EmotionalCoreVisualizerProps {
  subjectCode: string;
  emotionalState: EmotionalState;
}

interface EmotionNode {
  key: keyof EmotionalState;
  label: string;
  value: number;
  color: string;
}

export const EmotionalCoreVisualizer: React.FC<EmotionalCoreVisualizerProps> = ({
  subjectCode = 'HX-001',
  emotionalState,
}) => {
  const emotions: EmotionNode[] = [
    { key: 'stress', label: 'STRESS', value: emotionalState?.stress || 58, color: '#DC2626' },
    { key: 'fear', label: 'FEAR', value: emotionalState?.fear || 45, color: '#B91C1C' },
    { key: 'trust', label: 'TRUST', value: emotionalState?.trust || 52, color: '#0A0A0A' },
    { key: 'loneliness', label: 'LONELINESS', value: emotionalState?.loneliness || 62, color: '#7C3AED' },
    { key: 'happiness', label: 'HAPPINESS', value: emotionalState?.happiness || 40, color: '#16A34A' },
    { key: 'anger', label: 'ANGER', value: emotionalState?.anger || 35, color: '#DC2626' },
  ];

  const size = 300;
  const center = size / 2;
  const orbitRadius = 95;
  const angleStep = (Math.PI * 2) / emotions.length;

  return (
    <div className="flex flex-col items-center p-4 bg-white/95 border border-black/15 rounded-xs select-none font-mono-data shadow-sm relative">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#DC2626]" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#DC2626]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#DC2626]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#DC2626]" />

      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-black/10">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#DC2626]" />
          <span className="font-display text-lg text-black tracking-wider">
            EMOTIONAL CORE // {subjectCode}
          </span>
        </div>
        <span className="text-[10px] text-[#DC2626] font-bold">RADIAL TELEMETRY</span>
      </div>

      {/* Radial Graphic */}
      <div className="relative py-2 w-full flex justify-center items-center overflow-x-hidden">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[270px] sm:max-w-[300px] aspect-square overflow-visible">
          {/* Orbit Guidelines */}
          <circle
            cx={center}
            cy={center}
            r={orbitRadius}
            fill="none"
            stroke="#DC2626"
            strokeOpacity="0.15"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />

          {/* Radial Connector Lines to Satellites */}
          {emotions.map((em, idx) => {
            const angle = idx * angleStep - Math.PI / 2;
            const x = center + orbitRadius * Math.cos(angle);
            const y = center + orbitRadius * Math.sin(angle);

            return (
              <line
                key={em.label}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke={em.color}
                strokeOpacity="0.25"
                strokeWidth="1"
              />
            );
          })}

          {/* Central Breathing Core */}
          <g className="animate-core-breathe">
            <circle
              cx={center}
              cy={center}
              r="34"
              fill="rgba(220, 38, 38, 0.08)"
              stroke="#DC2626"
              strokeWidth="2"
            />
            <circle
              cx={center}
              cy={center}
              r="28"
              fill="#FFFFFF"
              stroke="#0A0A0A"
              strokeWidth="1"
            />
            <text
              x={center}
              y={center - 3}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[11px] font-mono-data fill-black font-bold tracking-widest"
            >
              {subjectCode}
            </text>
            <text
              x={center}
              y={center + 12}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[8px] font-mono-data fill-[#DC2626] font-bold"
            >
              CORE
            </text>
          </g>

          {/* Outer Emotional Satellite Nodes */}
          {emotions.map((em, idx) => {
            const angle = idx * angleStep - Math.PI / 2;
            const x = center + orbitRadius * Math.cos(angle);
            const y = center + orbitRadius * Math.sin(angle);
            const nodeRadius = 14 + (em.value / 100) * 8;

            return (
              <g key={em.label} className="cursor-pointer group">
                <circle
                  cx={x}
                  cy={y}
                  r={nodeRadius}
                  fill="#FFFFFF"
                  stroke={em.color}
                  strokeWidth="2"
                  className="transition-all duration-300 shadow-xs"
                />
                <text
                  x={x}
                  y={y - 3}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[8px] font-mono-data fill-zinc-600 font-bold"
                >
                  {em.label}
                </text>
                <text
                  x={x}
                  y={y + 7}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[9px] font-mono-data font-bold"
                  fill={em.color}
                >
                  {em.value}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Delta indicator footer */}
      <div className="w-full flex items-center justify-between text-[10px] text-zinc-600 pt-2 border-t border-black/10 mt-1">
        <span>CYCLE VARIATION: ACTIVE</span>
        <span className="text-[#DC2626] font-bold">REJECTION SENSITIVITY: HIGH (88%)</span>
      </div>
    </div>
  );
};
