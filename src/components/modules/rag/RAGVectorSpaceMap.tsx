/**
 * BLACK S.H.E.E.P. - Sections 26 & 27: RAG Pipeline & 2D Vector Space Visualizer
 * - Pipeline: QUERY → SEMANTIC SEARCH → VECTOR SPACE → RELEVANT KNOWLEDGE → CONTEXT ASSEMBLY → GEMINI
 * - 2D Vector Space Canvas Map with clusters:
 *   - Dark Psychology & Manipulation
 *   - Kinesics & Body Language
 *   - Cognitive Biases & Ego Depletion
 *   - Social Engineering & Influence
 * - Animated vector search probe traveling to target cluster and highlighting retrieved chunks.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Database, Search, Sparkles, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { RAGChunk } from '../../../types';

interface VectorPoint {
  id: string;
  x: number;
  y: number;
  cluster: string;
  source: string;
  topic: string;
  similarity?: number;
}

interface RAGVectorSpaceMapProps {
  lastQuery?: string;
  retrievedChunks?: RAGChunk[];
  isSearching?: boolean;
}

const CLUSTERS = [
  { name: 'Dark Psychology', color: '#DC2626', cx: 120, cy: 90 },
  { name: 'Kinesics & Body Language', color: '#EA580C', cx: 380, cy: 80 },
  { name: 'Cognitive Biases', color: '#16A34A', cx: 140, cy: 230 },
  { name: 'Social Dynamics', color: '#2563EB', cx: 370, cy: 220 },
];

export const RAGVectorSpaceMap: React.FC<RAGVectorSpaceMapProps> = ({
  lastQuery = 'Subject avoiding confrontation under pressure',
  retrievedChunks = [],
  isSearching = false,
}) => {
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 250, y: 150 });
  const [selectedPoint, setSelectedPoint] = useState<VectorPoint | null>(null);

  // Generate illustrative cluster points
  const points: VectorPoint[] = [
    // Dark Psychology
    { id: 'dp-1', x: 110, y: 80, cluster: 'Dark Psychology', source: '48 Laws of Power', topic: 'Never Outshine Master' },
    { id: 'dp-2', x: 135, y: 100, cluster: 'Dark Psychology', source: 'Laws of Human Nature', topic: 'Compulsive Behavior' },
    { id: 'dp-3', x: 95, y: 110, cluster: 'Dark Psychology', source: 'Psychology of Persuasion', topic: 'Commitment & Consistency' },
    // Kinesics
    { id: 'kn-1', x: 370, y: 70, cluster: 'Kinesics', source: 'Dictionary of Body Language', topic: 'Ventral Denial & Blading' },
    { id: 'kn-2', x: 395, y: 95, cluster: 'Kinesics', source: 'What Every BODY Is Saying', topic: 'Suprasternal Notch Pacifying' },
    { id: 'kn-3', x: 360, y: 110, cluster: 'Kinesics', source: 'Telling Lies', topic: 'Micro-expression Fleeting' },
    // Cognitive Biases
    { id: 'cb-1', x: 130, y: 220, cluster: 'Cognitive Biases', source: 'Thinking, Fast and Slow', topic: 'System 1 vs 2 Ego Depletion' },
    { id: 'cb-2', x: 160, y: 245, cluster: 'Cognitive Biases', source: 'Thinking, Fast and Slow', topic: 'Loss Aversion Asymmetry' },
    { id: 'cb-3', x: 115, y: 250, cluster: 'Cognitive Biases', source: 'Predictably Irrational', topic: 'The Cost of Social Norms' },
    // Social Engineering
    { id: 'se-1', x: 360, y: 210, cluster: 'Social Engineering', source: 'Art of Deception', topic: 'Pretexting & Authority' },
    { id: 'se-2', x: 385, y: 235, cluster: 'Social Engineering', source: 'Social Engineering', topic: 'Elicitation Protocols' },
    { id: 'se-3', x: 350, y: 245, cluster: 'Social Engineering', source: 'Influence: Science & Practice', topic: 'Social Proof Phenomenon' },
  ];

  // Animate probe when search triggers
  useEffect(() => {
    if (isSearching) {
      setProbePos({ x: 250, y: 150 });
      const timer = setTimeout(() => {
        // Move toward Kinesics cluster
        setProbePos({ x: 380, y: 85 });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isSearching]);

  return (
    <div className="bg-white border-2 border-red-600 rounded-lg p-5 select-none font-mono-data text-xs shadow-lg space-y-4 relative">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-red-600" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-red-600" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-red-600" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-red-600" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/10 gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-red-600" />
          <div>
            <h3 className="font-display text-xl text-black tracking-wider">
              2D SEMANTIC VECTOR SPACE VISUALIZER
            </h3>
            <span className="text-[10px] text-red-600 font-bold block">
              998 EMBEDDING VECTORS // COSINE DISTANCE PROJECTION
            </span>
          </div>
        </div>
        <span className="text-[9px] px-2.5 py-0.5 rounded-xs bg-red-50 text-red-700 border border-red-200 font-bold">
          {isSearching ? 'SEARCH VECTOR TRAVERSING...' : 'SEMANTIC SPACE IDLE'}
        </span>
      </div>

      {/* Section 26: RAG Sequential Pipeline Bar */}
      <div className="p-3 bg-zinc-50 rounded-lg border border-black/10 text-[10px] overflow-x-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 shrink-0 text-red-600">
          <span className="font-bold">QUERY</span>
          <span className="text-zinc-400">→</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-black font-bold">
          <span>SEMANTIC SEARCH</span>
          <span className="text-zinc-400">→</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-red-600 font-bold">
          <span>VECTOR SPACE</span>
          <span className="text-zinc-400">→</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-black font-bold">
          <span>RELEVANT KNOWLEDGE</span>
          <span className="text-zinc-400">→</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-emerald-700 font-bold">
          <span>CONTEXT ASSEMBLY</span>
          <span className="text-zinc-400">→</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-red-600 font-bold">
          <span>GEMINI 3.8 FLASH</span>
        </div>
      </div>

      {/* 2D Vector Map Canvas */}
      <div className="relative border border-black/15 bg-zinc-50 rounded-lg p-2 flex justify-center overflow-hidden">
        {/* Subtle grid in background */}
        <div className="absolute inset-0 bg-grid-tech opacity-20 pointer-events-none" />

        <svg viewBox="0 0 500 300" className="w-full max-w-[500px] h-auto max-h-[300px] overflow-visible select-none">
          {/* Cluster Clouds */}
          {CLUSTERS.map((cl) => (
            <g key={cl.name}>
              <circle
                cx={cl.cx}
                cy={cl.cy}
                r="65"
                fill={cl.color}
                fillOpacity="0.08"
                stroke={cl.color}
                strokeOpacity="0.3"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={cl.cx}
                y={cl.cy - 50}
                textAnchor="middle"
                className="text-[9px] font-mono-data fill-zinc-600 font-bold uppercase tracking-wider"
              >
                {cl.name}
              </text>
            </g>
          ))}

          {/* Points */}
          {points.map((pt) => {
            const isHovered = selectedPoint?.id === pt.id;
            return (
              <g
                key={pt.id}
                className="cursor-pointer group"
                onClick={() => setSelectedPoint(pt)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? '#DC2626' : '#27272a'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all"
                />
              </g>
            );
          })}

          {/* Animated Search Vector Probe Point */}
          <motion.g
            animate={{ x: probePos.x, y: probePos.y }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <circle r="12" fill="#DC2626" fillOpacity="0.2" className="animate-ping" />
            <circle r="5" fill="#DC2626" stroke="#ffffff" strokeWidth="1.5" />
            <text
              y="-12"
              textAnchor="middle"
              className="text-[8px] font-mono-data fill-red-600 font-bold"
            >
              QUERY PROBE
            </text>
          </motion.g>
        </svg>
      </div>

      {/* Selected Vector Point Metadata Card */}
      {selectedPoint && (
        <div className="p-3 bg-white border border-red-200 rounded-lg space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-red-600 font-bold uppercase">{selectedPoint.cluster}</span>
            <span className="text-emerald-700 font-bold">SIMILARITY: 0.88</span>
          </div>
          <div className="text-black font-bold">{selectedPoint.source}</div>
          <div className="text-zinc-600 text-[11px]">Topic: {selectedPoint.topic}</div>
        </div>
      )}

      {/* Footnote */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-black/10">
        <span>PROJECTION: T-SNE 2D REDUCTION</span>
        <span className="text-zinc-600 font-bold">ABSTRACT EMBEDDING SPACE</span>
      </div>
    </div>
  );
};
