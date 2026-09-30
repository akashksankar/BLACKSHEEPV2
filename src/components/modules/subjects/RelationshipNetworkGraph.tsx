/**
 * BLACK S.H.E.E.P. - Relationship Network Graph
 * Light Theme: Pure White (#FFFFFF), Deep Black (#000000), Scientific Red (#DC2626)
 * Interactive peer relationship graph:
 * - Nodes: Human subjects (A S Remin Krishna, peers, faculty)
 * - Connections: Friendship, Trust, Conflict, Authority, Family
 * - Animated connection pulses & vector lines
 * - Node focus/selection with contextual dossier reveal
 */

import React, { useState } from 'react';
import { HeartHandshake } from 'lucide-react';
import { Subject } from '../../../types';

interface RelationshipNetworkGraphProps {
  subjects: Subject[];
  activeSubjectId?: string;
  onSelectSubject?: (id: string) => void;
}

interface GraphNode {
  id: string;
  name: string;
  code: string;
  role: string;
  x: number;
  y: number;
  avatarUrl: string;
  stress: number;
}

interface GraphEdge {
  from: string;
  to: string;
  type: 'Friendship' | 'Trust' | 'Conflict' | 'Romantic' | 'Authority' | 'Family';
  strength: number;
  sentiment: string;
}

export const RelationshipNetworkGraph: React.FC<RelationshipNetworkGraphProps> = ({
  subjects,
  activeSubjectId,
  onSelectSubject,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);

  const width = 580;
  const height = 360;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 130;

  const nodes: GraphNode[] = subjects.slice(0, 6).map((s, idx, arr) => {
    const angle = (idx * (Math.PI * 2)) / Math.max(1, arr.length) - Math.PI / 2;
    return {
      id: s.id,
      name: s.name,
      code: s.code,
      role: s.occupation,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      avatarUrl: s.avatarUrl,
      stress: s.emotionalState?.stress || 50,
    };
  });

  // Collect relationships
  const edges: GraphEdge[] = [];
  subjects.forEach((s) => {
    if (s.relationships) {
      s.relationships.forEach((rel) => {
        const exists = edges.some(
          (e) =>
            (e.from === s.id && e.to === rel.targetSubjectId) ||
            (e.from === rel.targetSubjectId && e.to === s.id)
        );
        if (!exists) {
          edges.push({
            from: s.id,
            to: rel.targetSubjectId,
            type: (rel.relationType as any) || 'Trust',
            strength: rel.strength,
            sentiment: rel.sentiment,
          });
        }
      });
    }
  });

  // Fallback default edges if relationships list is sparse
  if (edges.length === 0 && nodes.length >= 2) {
    edges.push(
      { from: nodes[0].id, to: nodes[1].id, type: 'Conflict', strength: 80, sentiment: 'TENSE' },
      { from: nodes[0].id, to: nodes[2]?.id || nodes[1].id, type: 'Trust', strength: 65, sentiment: 'POSITIVE' },
      { from: nodes[1].id, to: nodes[2]?.id || nodes[0].id, type: 'Friendship', strength: 70, sentiment: 'POSITIVE' }
    );
  }

  const getEdgeColor = (type: GraphEdge['type']) => {
    switch (type) {
      case 'Conflict':
        return '#DC2626'; // Scientific Red
      case 'Trust':
        return '#0A0A0A'; // Deep Black
      case 'Friendship':
        return '#16A34A'; // Emerald Green
      case 'Romantic':
        return '#DB2777'; // Pink
      case 'Authority':
        return '#EA580C'; // Orange
      case 'Family':
        return '#2563EB'; // Blue
      default:
        return '#DC2626';
    }
  };

  return (
    <div className="bg-white/95 border border-black/15 rounded-xs p-4 select-none font-mono-data text-xs shadow-sm relative">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#DC2626]" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#DC2626]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#DC2626]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#DC2626]" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-black/10">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-[#DC2626]" />
          <span className="font-display text-lg text-black tracking-wider">
            CAMPUS SOCIAL NETWORK & RELATIONSHIP GRAPH
          </span>
        </div>
        <span className="text-[10px] text-[#DC2626] font-bold">INTERACTIVE EDGES</span>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative flex justify-center py-2 w-full overflow-x-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[580px] h-auto max-h-[360px] overflow-visible">
          {/* Subtle Outer Boundary Ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius + 30}
            fill="none"
            stroke="#DC2626"
            strokeOpacity="0.12"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Connection Edges */}
          {edges.map((edge, idx) => {
            const n1 = nodes.find((n) => n.id === edge.from);
            const n2 = nodes.find((n) => n.id === edge.to);
            if (!n1 || !n2) return null;

            const color = getEdgeColor(edge.type);
            const isHovered =
              hoveredNode === n1.id ||
              hoveredNode === n2.id ||
              (selectedEdge?.from === edge.from && selectedEdge?.to === edge.to);

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onClick={() => setSelectedEdge(edge)}
              >
                {/* Background Line */}
                <line
                  x1={n1.x}
                  y1={n1.y}
                  x2={n2.x}
                  y2={n2.y}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  strokeOpacity={isHovered ? 0.95 : 0.4}
                  strokeDasharray={edge.type === 'Conflict' ? '4 2' : 'none'}
                />

                {/* Animated Particle traveling along the edge */}
                <circle
                  r={isHovered ? 3.5 : 2}
                  fill={color}
                  opacity={0.85}
                >
                  <animateMotion
                    path={`M ${n1.x} ${n1.y} L ${n2.x} ${n2.y}`}
                    dur={`${Math.max(2, 6 - edge.strength / 20)}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = activeSubjectId === node.id;
            const isHovered = hoveredNode === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onClick={() => onSelectSubject && onSelectSubject(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Node Outer Ring */}
                <circle
                  r={isSelected || isHovered ? 26 : 22}
                  fill="#FFFFFF"
                  stroke={isSelected ? '#DC2626' : isHovered ? '#000000' : '#D4D4D8'}
                  strokeWidth={isSelected ? 3 : 1.8}
                  className="transition-all duration-200 shadow-sm"
                />

                {/* Stress Ring Indicator */}
                <circle
                  r={isSelected || isHovered ? 30 : 26}
                  fill="none"
                  stroke="#DC2626"
                  strokeOpacity={node.stress / 100}
                  strokeWidth="1.2"
                  strokeDasharray="2 3"
                />

                {/* Subject Code */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  y="-4"
                  className="text-[9px] font-mono-data fill-black font-bold"
                >
                  {node.code}
                </text>
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  y="8"
                  className="text-[8px] font-mono-data fill-[#DC2626] font-semibold"
                >
                  {node.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Edge or Contextual Legend */}
      <div className="pt-3 border-t border-black/10 flex flex-wrap items-center justify-between text-[10px] text-zinc-600 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
            <span className="font-semibold">Conflict / Roast</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0A0A0A]" />
            <span>Trust</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span>Friendship</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
            <span>Faculty / Authority</span>
          </span>
        </div>

        {selectedEdge ? (
          <div className="text-[#DC2626] font-bold bg-red-50 px-2 py-0.5 rounded-xs border border-red-200">
            {selectedEdge.type.toUpperCase()}: STRENGTH {selectedEdge.strength}% ({selectedEdge.sentiment})
          </div>
        ) : (
          <span className="text-zinc-500">CLICK EDGE OR NODE TO INSPECT</span>
        )}
      </div>
    </div>
  );
};
