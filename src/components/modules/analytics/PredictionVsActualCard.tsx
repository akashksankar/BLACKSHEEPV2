/**
 * BLACK S.H.E.E.P. - Sections 28 & 29: Prediction vs Actual & Anomaly Deviations
 * - High-attention alert header: ANOMALY DETECTED // SUBJECT HX-071 // BEHAVIORAL DEVIATION
 * - EXPECTED (Avoid confrontation 78%) vs ACTUAL (Confronted subject 100%)
 * - Animated comparison bars counting up from zero
 * - PREDICTION ERROR: HIGH badge
 * - Sequential Potential Explanations cards
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Flame, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { Anomaly } from '../../../types';

interface PredictionVsActualCardProps {
  anomaly?: Anomaly;
}

export const PredictionVsActualCard: React.FC<PredictionVsActualCardProps> = ({ anomaly }) => {
  const [expectedPct, setExpectedPct] = useState(0);
  const [actualPct, setActualPct] = useState(0);

  const targetExpected = 78;
  const targetActual = 100;

  useEffect(() => {
    // Animate comparison bars from zero to actual values
    const t1 = setTimeout(() => setExpectedPct(targetExpected), 200);
    const t2 = setTimeout(() => setActualPct(targetActual), 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const subjectCode = anomaly?.subjectCode || 'HX-071';
  const subjectName = anomaly?.subjectName || 'Arjun';
  const anomalyTitle = anomaly?.title || 'Broke baseline conflict avoidance in public cafeteria';

  const explanations = [
    {
      title: 'Cognitive Ego Depletion Threshold Breach',
      theory: 'Kahneman System 2 Exhaustion',
      detail:
        'Continuous 3-hour academic trial depleted the subject’s prefrontal inhibitory control loops, leading to an involuntary limbic fight reaction.',
    },
    {
      title: 'Status-Defense Reflex',
      theory: 'Loss Aversion Asymmetry',
      detail:
        'The silent presence of trusted peer Basil Babu triggered an acute status-defense reflex, overpowering the default conformist heuristic.',
    },
    {
      title: 'Reputational Vulnerability Surge',
      theory: 'Social Self-Preservation',
      detail:
        'Direct peer pushback from Gopi Krishnan and Basil Babu challenged his extroverted conversational dominance, provoking a sharp retreat into silence.',
    },
  ];

  return (
    <div className="bg-white border-2 border-red-600 rounded-lg p-6 select-none font-mono-data text-xs shadow-lg space-y-5 relative overflow-hidden">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-600" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-600" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-600" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-600" />

      {/* Subtle Scanline */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scanline pointer-events-none" />

      {/* Section 28: Anomaly Alert Lockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-600 text-white shadow-md animate-pulse">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-red-600 font-bold tracking-widest uppercase">
                ANOMALY DETECTED // BEHAVIORAL DEVIATION
              </span>
              <span className="text-[9px] bg-red-600 text-white font-bold px-2 py-0.5 rounded">
                SCORE: CRITICAL
              </span>
            </div>
            <h3 className="font-display text-2xl text-black tracking-wider">
              SUBJECT {subjectCode} ({subjectName.toUpperCase()})
            </h3>
          </div>
        </div>

        <div className="text-right font-mono-data">
          <span className="text-[10px] text-zinc-500 block font-bold">PREDICTION ERROR</span>
          <span className="text-2xl font-display text-red-600 font-bold tracking-wider">
            HIGH (92%)
          </span>
        </div>
      </div>

      <p className="text-xs text-zinc-700 font-sans leading-relaxed">
        {anomalyTitle}. Baseline conflict avoidance probability collapsed under experimental stimulus injection.
      </p>

      {/* Section 29: Animated Comparison Bars (EXPECTED vs ACTUAL) */}
      <div className="p-4 bg-zinc-50 rounded-lg border border-black/10 space-y-3">
        <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">
          SIMULATION PREDICTION VS OBSERVED REALITY
        </div>

        {/* Expected Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-600">EXPECTED: Avoid confrontation</span>
            <span className="font-bold text-black">{targetExpected}%</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-200 rounded-sm overflow-hidden border border-zinc-300">
            <motion.div
              className="h-full bg-zinc-600"
              initial={{ width: '0%' }}
              animate={{ width: `${expectedPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        {/* Actual Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-red-700 font-bold">ACTUAL: Confronted subject directly</span>
            <span className="font-bold text-red-700">{targetActual}%</span>
          </div>
          <div className="w-full h-2.5 bg-red-100 rounded-sm overflow-hidden border border-red-200">
            <motion.div
              className="h-full bg-red-600 shadow-sm"
              initial={{ width: '0%' }}
              animate={{ width: `${actualPct}%` }}
              transition={{ duration: 0.9 }}
            />
          </div>
        </div>
      </div>

      {/* Section 29: Sequential Explanations Cards */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center gap-2 text-[10px] text-red-600 font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span>POTENTIAL EXPLANATIONS (AI SYNTHESIS)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {explanations.map((exp, idx) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.15 }}
              className="p-3 bg-white border border-black/10 rounded-lg space-y-1.5 shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-[10px] text-red-600 font-bold">
                <span>0{idx + 1}.</span>
                <span>{exp.theory}</span>
              </div>
              <h5 className="font-bold text-black text-xs leading-tight">{exp.title}</h5>
              <p className="text-[11px] text-zinc-600 font-sans leading-relaxed pt-0.5">
                {exp.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
