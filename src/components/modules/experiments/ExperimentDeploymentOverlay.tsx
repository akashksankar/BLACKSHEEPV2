/**
 * BLACK S.H.E.E.P. - Section 23: Deployment Animation Overlay
 * Light Theme: Pure White (#FFFFFF), Deep Black (#000000), Scientific Red (#DC2626)
 * Zero robot terminology (Strictly human subjects)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Radio } from 'lucide-react';

interface ExperimentDeploymentOverlayProps {
  experimentCode?: string;
  experimentTitle?: string;
  onComplete: () => void;
}

const DEPLOY_STAGES = [
  { label: 'INITIALIZING SIMULATION ENGINE', detail: 'Allocating sandbox registers for trial' },
  { label: 'PACKAGING SCENARIO & STIMULUS', detail: 'Injecting variables (Peer Ostracism, Counter-Roasting)' },
  { label: 'INJECTING EVENT INTO ENVIRONMENT', detail: 'Transmitting trigger payload to campus social circle' },
  { label: 'SYNCING SUBJECT BEHAVIOR REGISTERS', detail: 'Attaching kinesic telemetry listeners to target human subjects' },
  { label: 'OBSERVATION ACTIVE', detail: 'Recording real-time behavioral responses against baseline' },
];

export const ExperimentDeploymentOverlay: React.FC<ExperimentDeploymentOverlayProps> = ({
  experimentCode = 'EXP-001',
  experimentTitle = 'Campus Peer Silence & Counter-Roast Trial',
  onComplete,
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < DEPLOY_STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setIsFinished(true);
          setTimeout(() => {
            onComplete();
          }, 900);
          return prev;
        }
      });
    }, 550);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none font-mono-data text-black">
      {/* Background Grid and Scanning Line */}
      <div className="absolute inset-0 bg-moving-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#DC2626] to-transparent animate-scanline pointer-events-none" />

      {/* Main Deployment Console HUD Box */}
      <div className="relative max-w-xl w-full bg-white border-2 border-[#DC2626] p-8 rounded-xs shadow-2xl text-center space-y-6">
        {/* HUD Corners */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#DC2626]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#DC2626]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#DC2626]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#DC2626]" />

        {/* Header Lockup */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-red-50 border border-red-200 text-[#DC2626] text-[10px] tracking-widest font-bold uppercase mb-2">
            <Radio className="w-3.5 h-3.5 text-[#DC2626] animate-ping" />
            <span>DEPLOYMENT MODE // LIVE STIMULUS INJECTION</span>
          </div>

          <h2 className="font-display text-4xl text-black tracking-widest">
            {experimentCode}
          </h2>
          <p className="text-xs text-zinc-600 font-sans mt-0.5">{experimentTitle}</p>
        </div>

        {/* Progressive Stages */}
        <div className="space-y-2 text-left my-4 text-xs">
          {DEPLOY_STAGES.map((st, idx) => {
            const isCompleted = idx < currentStage || isFinished;
            const isCurrent = idx === currentStage && !isFinished;

            return (
              <motion.div
                key={st.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-2.5 rounded-xs border transition-all ${
                  isCurrent
                    ? 'bg-red-50 border-[#DC2626] text-black shadow-xs font-semibold'
                    : isCompleted
                    ? 'bg-zinc-50 border-black/10 text-zinc-700'
                    : 'bg-transparent border-transparent text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold ${
                        isCurrent ? 'text-[#DC2626]' : isCompleted ? 'text-emerald-700' : 'text-zinc-400'
                      }`}
                    >
                      STEP 0{idx + 1}
                    </span>
                    <span className="font-bold tracking-wider">{st.label}</span>
                  </div>

                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#DC2626] border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <span className="text-[10px] text-zinc-400">PENDING</span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5 pl-6">{st.detail}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Status Callout Banner */}
        <div className="p-3 bg-zinc-50 rounded-xs border border-black/10 flex items-center justify-between text-xs">
          <span className="text-zinc-600">STATE:</span>
          <span className="text-[#DC2626] font-bold">
            {isFinished ? 'TRIAL ACTIVE & LIVE' : 'DEPLOYING VARIABLE PAYLOAD...'}
          </span>
        </div>
      </div>
    </div>
  );
};
