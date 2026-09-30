/**
 * BLACK S.H.E.E.P. - AI Core Visualization & Diagnostic Audit Indicator
 * Implements Sections 24 & 25 of Extreme UI Directive:
 * - Central glowing circular core
 * - Orbiting data particles & dual rotating HUD rings (PROCESSING & BEHAVIORAL ANALYSIS)
 * - Sequential Processing Pipeline:
 *   BEHAVIORAL CONTEXT → HISTORICAL EVENTS → RAG RETRIEVAL →
 *   PATTERN MATCHING → HYPOTHESIS GENERATION → ANALYSIS READY
 * - State reactive: breathing when idle, accelerated spin when processing, settles on completion.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain, Cpu, Database, Sparkles, CheckCircle2 } from 'lucide-react';

interface AIThinkingIndicatorProps {
  statusMessage?: string;
  isProcessing?: boolean;
}

const AI_PIPELINE_STAGES = [
  { label: 'BEHAVIORAL CONTEXT', detail: 'Parsing subject kinesic baseline' },
  { label: 'HISTORICAL EVENTS', detail: 'Correlating previous peer interactions' },
  { label: 'RAG RETRIEVAL', detail: 'Cross-referencing dark psychology treatises' },
  { label: 'PATTERN MATCHING', detail: 'Identifying cognitive distortion vectors' },
  { label: 'HYPOTHESIS GENERATION', detail: 'Calculating simulation breaking probability' },
  { label: 'ANALYSIS READY', detail: 'Compiling structured behavioral diagnostic' },
];

export const AIThinkingIndicator: React.FC<AIThinkingIndicatorProps> = ({
  statusMessage = 'PROCESSING SUBJECT TELEMETRY VIA GEMINI 3.8 FLASH...',
  isProcessing = true,
}) => {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setActiveStage(AI_PIPELINE_STAGES.length - 1);
      return;
    }

    const interval = setInterval(() => {
      setActiveStage((prev) => (prev < AI_PIPELINE_STAGES.length - 1 ? prev + 1 : prev));
    }, 600);

    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <div className="relative bg-white border-2 border-red-600 rounded-lg p-6 overflow-hidden shadow-xl">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-red-600" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-red-600" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-red-600" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-red-600" />

      {/* Top Telemetry */}
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-black/10 text-xs font-mono-data">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-red-600" />
          <span className="font-bold text-black tracking-wider">AI NEURAL DIAGNOSTIC ENGINE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span className="text-[10px] text-red-600 font-bold">MODEL: GEMINI 3.8 FLASH</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* LEFT: Section 25 Abstract AI Core Visualization */}
        <div className="md:col-span-5 flex flex-col items-center justify-center py-2">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Outer Orbit Ring: BEHAVIORAL ANALYSIS */}
            <div
              className={`absolute inset-0 rounded-full border border-dashed border-red-400/50 flex items-center justify-center ${
                isProcessing ? 'animate-orbit-cw-fast' : 'animate-orbit-cw'
              }`}
            >
              <div className="absolute top-0 transform -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#DC2626]" />
              <div className="absolute bottom-0 transform translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black opacity-70" />
            </div>

            {/* Outer Ring Text Label */}
            <div className="absolute inset-2 rounded-full border border-red-200 pointer-events-none" />

            {/* Inner Orbit Ring: PROCESSING */}
            <div
              className={`absolute inset-6 rounded-full border border-dotted border-black/30 flex items-center justify-center ${
                isProcessing ? 'animate-orbit-ccw' : 'animate-orbit-ccw'
              }`}
            >
              <div className="absolute left-0 transform -translate-x-1/2 w-2 h-2 rounded-full bg-black shadow-xs" />
              <div className="absolute right-0 transform translate-x-1/2 w-2 h-2 rounded-full bg-red-600" />
            </div>

            {/* Central Glowing Core */}
            <div
              className={`relative w-20 h-20 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-red-500 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.4)] ${
                isProcessing ? 'scale-105' : 'animate-core-breathe'
              }`}
            >
              <Cpu className="w-7 h-7 text-white animate-pulse" />
              <span className="text-[8px] font-mono-data text-white font-bold tracking-widest mt-1">
                NEURAL
              </span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[10px] font-mono-data text-zinc-500 block tracking-wider uppercase">
              RESONANCE FREQUENCY: 440 THz
            </span>
            <span className="text-xs font-mono-data text-red-600 font-bold">
              {isProcessing ? 'SYNAPSE BURST IN PROGRESS' : 'AI CORE READY'}
            </span>
          </div>
        </div>

        {/* RIGHT: Section 24 Sequential Processing Pipeline */}
        <div className="md:col-span-7 space-y-2">
          <div className="text-[10px] font-mono-data text-zinc-600 uppercase font-bold tracking-wider mb-2">
            SEQUENTIAL INFERENCE PIPELINE
          </div>

          {AI_PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = idx < activeStage;
            const isCurrent = idx === activeStage;

            return (
              <div
                key={stage.label}
                className={`p-2.5 rounded-lg border text-xs font-mono-data flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-red-50 border-2 border-red-600 text-black shadow-xs'
                    : isCompleted
                    ? 'bg-zinc-50 border border-black/10 text-zinc-700'
                    : 'bg-white border border-black/10 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-bold ${
                      isCurrent ? 'text-red-600' : isCompleted ? 'text-red-600' : 'text-zinc-400'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <div>
                    <span className={`font-bold tracking-wider ${isCurrent ? 'text-black font-bold' : 'text-zinc-800'}`}>
                      {stage.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">{stage.detail}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {isCompleted ? (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      RESOLVED
                    </span>
                  ) : isCurrent ? (
                    <span className="text-[10px] text-red-600 font-bold animate-pulse">
                      PROCESSING...
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400">QUEUED</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-mono-data text-zinc-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span>{statusMessage}</span>
        </div>
        <span className="text-[10px] text-red-600 font-bold">CLEARANCE: LEVEL-5</span>
      </div>
    </div>
  );
};
