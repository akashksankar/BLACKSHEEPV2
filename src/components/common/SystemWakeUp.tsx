/**
 * BLACK S.H.E.E.P. - Module: System Wake Up / Boot Transition
 * Light Theme: Pure White (#FFFFFF), Deep Black (#000000), Scientific Red (#DC2626)
 * Zero robot terminology (Strictly human behavioral dynamics)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Check, FastForward, Activity } from 'lucide-react';

interface SystemWakeUpProps {
  onComplete: () => void;
  researcherName?: string;
}

const WAKE_STAGES = [
  { text: 'SYSTEM INITIALIZATION', detail: 'ALLOCATING BEHAVIORAL SIMULATION REGISTERS...' },
  { text: 'BLACK S.H.E.E.P. PROTOCOL', detail: 'STRATEGIC HUMAN EXPERIMENT AND EVALUATION PROTOCOL' },
  { text: 'SECURE SESSION VERIFIED', detail: 'RFC 7519 HMAC-SHA256 (HS256) LEVEL-5 CERTIFICATE MOUNTED' },
  { text: 'BEHAVIOR ENGINE ONLINE', detail: 'PROBABILITY MATRICES & KINESIC SIGNAL DETECTORS ARMED' },
  { text: 'KNOWLEDGE CORE ONLINE', detail: 'BEHAVIORAL PSYCHOLOGY TREATISES SYNCHRONIZED' },
  { text: 'VECTOR INDEX READY', detail: '998 CHUNKS / COSINE EMBEDDING SPACE CALIBRATED' },
  { text: 'AI INTERFACE READY', detail: 'GEMINI 3.8 FLASH // LOW-LATENCY NEURAL LINK ESTABLISHED' },
  { text: 'SYSTEM OPERATIONAL', detail: 'WORKSTATION READY FOR HUMAN SUBJECT MONITORING' },
];

export const SystemWakeUp: React.FC<SystemWakeUpProps> = ({ onComplete, researcherName = 'RESEARCHER' }) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < WAKE_STAGES.length - 1) {
          const next = prev + 1;
          setProgress(Math.round(((next + 1) / WAKE_STAGES.length) * 100));
          return next;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 600);
          return prev;
        }
      });
    }, 420);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-white/95 text-black flex flex-col items-center justify-center p-6 select-none overflow-hidden font-mono-data backdrop-blur-md">
      {/* Background Grid & Scanline */}
      <div className="absolute inset-0 bg-moving-grid opacity-50 pointer-events-none" />
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#DC2626] to-transparent animate-scanline pointer-events-none" />
      
      {/* Top Telemetry */}
      <div className="absolute top-6 inset-x-6 flex items-center justify-between text-xs text-zinc-600 border-b border-black/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping" />
          <span className="text-[#DC2626] font-bold">BOOT SEQUENCE // SECURE WORKSTATION</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-black font-semibold">OPERATOR: {researcherName.toUpperCase()}</span>
          <button
            onClick={onComplete}
            className="text-xs text-[#DC2626] hover:text-black flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-xs cursor-pointer transition-colors font-bold"
          >
            <span>SKIP INITIALIZATION</span>
            <FastForward className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Center Console Container */}
      <div className="relative max-w-xl w-full bg-white border-2 border-black/20 p-8 rounded-xs shadow-2xl relative">
        {/* HUD Corners */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#DC2626]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#DC2626]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#DC2626]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#DC2626]" />

        {/* Title */}
        <div className="text-center mb-6">
          <span className="text-[10px] tracking-widest text-[#DC2626] uppercase font-bold block mb-1">
            STATION BS-OBS-01 // BOOTSTRAP
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-black tracking-widest">
            BLACK S.H.E.E.P.
          </h2>
          <p className="text-xs text-[#DC2626] tracking-wider mt-1 uppercase font-bold">
            Strategic Human Experiment and Evaluation Protocol
          </p>
        </div>

        {/* Staggered Boot Stage List */}
        <div className="space-y-2.5 my-6 text-xs">
          {WAKE_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            const isUpcoming = idx > currentStageIdx;

            if (isUpcoming && idx > currentStageIdx + 1) return null;

            return (
              <motion.div
                key={stage.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start justify-between p-2.5 rounded-xs border transition-all ${
                  isCurrent
                    ? 'bg-red-50 border-[#DC2626] text-black font-semibold shadow-xs'
                    : isCompleted
                    ? 'bg-zinc-50 border-black/10 text-zinc-600'
                    : 'bg-transparent border-transparent text-zinc-400'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#DC2626]">
                      0{idx + 1}
                    </span>
                    <span className={`font-bold tracking-wider ${isCurrent ? 'text-black' : ''}`}>
                      {stage.text}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 pl-5 font-sans">
                    {stage.detail}
                  </p>
                </div>

                <div className="text-right shrink-0 ml-3">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>ONLINE</span>
                    </span>
                  ) : isCurrent ? (
                    <span className="text-[10px] text-[#DC2626] font-bold animate-pulse">
                      SYNCING...
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400">STANDBY</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar & Footer */}
        <div className="space-y-2 pt-2 border-t border-black/10">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-600">INITIALIZATION PROGRESS</span>
            <span className="text-[#DC2626]">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#DC2626] to-black transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
