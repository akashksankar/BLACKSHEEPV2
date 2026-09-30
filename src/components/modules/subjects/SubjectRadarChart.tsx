/**
 * BLACK S.H.E.E.P. - Section 17: Subject Radar Visualization
 * Light Theme: Pure White (#FFFFFF), Deep Black (#000000), Scientific Red (#DC2626)
 * Large animated radar visualization with 8 behavioral dimensions
 * Mobile & touch responsive with high Impulsive Rate vertex
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Flame } from 'lucide-react';

interface RadarDimension {
  name: string;
  value: number;
}

interface SubjectRadarChartProps {
  dimensions?: Array<{ name: string; value: number }>;
  subjectCode?: string;
}

const DEFAULT_DIMENSIONS: RadarDimension[] = [
  { name: 'Impulsive Rate', value: 96 },
  { name: 'Roasting Tendency', value: 95 },
  { name: 'Rejection Sensitivity', value: 92 },
  { name: 'Attention Seeking', value: 94 },
  { name: 'Backward Retreat', value: 88 },
  { name: 'Outspokenness', value: 96 },
  { name: 'Political Intensity', value: 91 },
  { name: 'Social Dependency', value: 94 },
];

export const SubjectRadarChart: React.FC<SubjectRadarChartProps> = ({
  dimensions,
  subjectCode = 'HX-001',
}) => {
  const [timeFilter, setTimeFilter] = useState<'CURRENT' | '7_DAYS' | '30_DAYS' | 'EXPERIMENT'>('CURRENT');

  const getModifiedDimensions = (): RadarDimension[] => {
    let base: RadarDimension[] = [];
    if (dimensions && dimensions.length > 0) {
      // Find Impulsive Rate or add it prominently as top vertex
      const foundImpulsive = dimensions.find((d) =>
        d.name.toLowerCase().includes('impuls')
      );
      const otherDims = dimensions
        .filter((d) => !d.name.toLowerCase().includes('impuls'))
        .slice(0, 7);

      const impulsiveDim: RadarDimension = {
        name: 'Impulsive Rate',
        value: foundImpulsive ? Math.max(foundImpulsive.value, 96) : 96,
      };

      base = [impulsiveDim, ...otherDims.map((d) => ({ name: d.name, value: d.value }))];
      // Pad to 8 if needed
      while (base.length < 8 && DEFAULT_DIMENSIONS[base.length]) {
        base.push(DEFAULT_DIMENSIONS[base.length]);
      }
    } else {
      base = DEFAULT_DIMENSIONS;
    }

    if (timeFilter === 'CURRENT') return base;
    if (timeFilter === '7_DAYS') {
      return base.map((d) => ({
        name: d.name,
        value: d.name.includes('Impulsive') ? 97 : Math.max(15, Math.min(98, Math.round(d.value * 0.92 + 4))),
      }));
    }
    if (timeFilter === '30_DAYS') {
      return base.map((d) => ({
        name: d.name,
        value: d.name.includes('Impulsive') ? 95 : Math.max(15, Math.min(98, Math.round(d.value * 0.85 + 10))),
      }));
    }
    // EXPERIMENT HISTORY: stress & retreat spikes + extreme impulsive triggers
    return base.map((d) => {
      if (d.name.includes('Impulsive')) return { name: d.name, value: 99 };
      if (d.name.includes('Retreat') || d.name.includes('Sensitivity')) return { name: d.name, value: 98 };
      if (d.name.includes('Roasting')) return { name: d.name, value: 30 }; // silenced
      return { name: d.name, value: d.value };
    });
  };

  const activeData = getModifiedDimensions();

  const size = 340;
  const center = size / 2;
  const radius = 110;
  const angleStep = (Math.PI * 2) / activeData.length;

  const points = activeData.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (d.value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, name: d.name, value: d.value };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 bg-white/95 border border-black/15 rounded-xs select-none font-mono-data shadow-sm relative w-full overflow-hidden">
      {/* HUD Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#DC2626]" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#DC2626]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#DC2626]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#DC2626]" />

      {/* Header & Time Filters */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 border-b border-black/10 gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#DC2626] shrink-0" />
          <span className="font-display text-base sm:text-lg text-black tracking-wider truncate">
            BEHAVIORAL MATRIX // {subjectCode}
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] bg-red-50 text-[#DC2626] border border-red-200 px-1.5 py-0.5 rounded font-bold">
            <Flame className="w-2.5 h-2.5" />
            IMPULSIVE 96%
          </span>
        </div>

        {/* Time Tabs */}
        <div className="flex items-center gap-1 text-[9px] w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['CURRENT', '7_DAYS', '30_DAYS', 'EXPERIMENT'] as const).map((tab) => {
            const label =
              tab === 'CURRENT'
                ? 'CURRENT'
                : tab === '7_DAYS'
                ? '7 DAYS'
                : tab === '30_DAYS'
                ? '30 DAYS'
                : 'EXP HISTORY';
            const isActive = timeFilter === tab;

            return (
              <button
                key={tab}
                onClick={() => setTimeFilter(tab)}
                className={`px-2 py-1 rounded-xs border font-bold cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#DC2626] text-white border-[#DC2626]'
                    : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:text-black hover:border-black/30'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Radar Chart - Responsive Scaling with viewBox */}
      <div className="relative py-2 w-full flex justify-center items-center overflow-x-hidden">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[280px] sm:max-w-[340px] aspect-square overflow-visible"
        >
          {/* Concentric Calibration Rings */}
          {[0.25, 0.5, 0.75, 1].map((level, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius * level}
              fill="none"
              stroke={idx === 3 ? '#DC2626' : '#000000'}
              strokeOpacity={idx === 3 ? 0.35 : 0.12}
              strokeWidth={idx === 3 ? '1.5' : '1'}
              strokeDasharray={idx < 3 ? '2 2' : 'none'}
            />
          ))}

          {/* Radial Spokes */}
          {activeData.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#000000"
                strokeOpacity="0.14"
                strokeWidth="1"
              />
            );
          })}

          {/* Animated Polygon */}
          <motion.path
            d={polygonPath}
            fill="rgba(220, 38, 38, 0.22)"
            stroke="#DC2626"
            strokeWidth="2.5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Vertices & Technical Labels */}
          {points.map((p, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelDist = radius + 22;
            const lx = center + labelDist * Math.cos(angle);
            const ly = center + labelDist * Math.sin(angle);
            const isImpulsive = p.name.includes('Impulsive');

            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isImpulsive ? '5.5' : '4'}
                  fill={isImpulsive ? '#DC2626' : '#DC2626'}
                  stroke={isImpulsive ? '#FFFFFF' : '#000000'}
                  strokeWidth={isImpulsive ? '2' : '1.2'}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`text-[9px] font-mono-data font-bold uppercase tracking-wider ${
                    isImpulsive ? 'fill-[#DC2626] font-extrabold' : 'fill-black'
                  }`}
                >
                  {p.name.split(' ')[0]} ({p.value})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Calibration Footnote */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] text-zinc-600 pt-2 border-t border-black/10 mt-2 gap-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
          <span className="text-[#DC2626] font-bold">IMPULSIVE RATE: HIGHER (96-99)</span>
          <span className="text-zinc-400">· RANGE: 0 - 100</span>
        </span>
        <span className="text-[9px]">SAMPLE: {timeFilter.replace('_', ' ')}</span>
      </div>
    </div>
  );
};
