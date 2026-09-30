/**
 * BLACK S.H.E.E.P. - Module 05: Behavioral Dynamics & Signal Lab
 * Light Theme: Pure White (#FFFFFF), Deep Black (#000000), Scientific Red (#DC2626)
 * Real-time 15 behavioral dimensions, ego-depletion testing, and kinesic signals
 */

import React, { useState } from 'react';
import {
  Sliders,
  Info,
} from 'lucide-react';
import { Subject } from '../../types';
import { HUDPanel } from '../common/HUDPanel';

interface BehaviorLabModuleProps {
  subjects: Subject[];
  selectedSubjectId?: string | null;
}

export const BehaviorLabModule: React.FC<BehaviorLabModuleProps> = ({
  subjects = [],
  selectedSubjectId,
}) => {
  const [selectedSubId, setSelectedSubId] = useState<string>(
    selectedSubjectId || (subjects.length > 0 ? subjects[0].id : '')
  );

  const [socialPressureMultiplier, setSocialPressureMultiplier] = useState<number>(1.2);
  const [egoDepletionFactor, setEgoDepletionFactor] = useState<number>(1.1);

  const activeSubject = subjects.find((s) => s.id === selectedSubId) || subjects[0];

  const baseRebellion = activeSubject?.riskIndicators.rebellionProbability || 35;
  const simulatedRebellion = Math.min(
    99,
    Math.round(baseRebellion * socialPressureMultiplier * egoDepletionFactor)
  );

  if (!activeSubject) {
    return (
      <div className="space-y-6 select-none font-sans text-black">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-black/10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-data text-[#DC2626] tracking-widest uppercase font-bold">
              <span>MODULE 05</span>
              <span>·</span>
              <span>BEHAVIORAL DYNAMICS & SIGNAL LAB</span>
            </div>
            <h1 className="font-display text-4xl text-black tracking-wider mt-1">
              BEHAVIOR LAB
            </h1>
          </div>
        </div>

        <div className="border border-dashed border-black/20 rounded-xs text-center p-12 bg-white flex flex-col items-center justify-center space-y-4">
          <Sliders className="w-10 h-10 text-[#DC2626]" />
          <h3 className="font-display text-2xl text-black tracking-wide">
            NO SUBJECTS IN BEHAVIOR LAB // CLEAN SLATE
          </h3>
          <p className="text-xs text-zinc-600 font-mono-data max-w-md">
            Register your first human subject to calibrate behavioral dimensions, test ego depletion multipliers, and analyze nonverbal kinesics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none font-sans text-black">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-black/10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-data text-[#DC2626] tracking-widest uppercase font-bold">
            <span>MODULE 05</span>
            <span>·</span>
            <span>BEHAVIORAL DYNAMICS & SIGNAL LAB</span>
            <span>·</span>
            <span className="text-black">KAHNEMAN COGNITIVE MATRIX</span>
          </div>
          <h1 className="font-display text-4xl text-black tracking-wider mt-1">
            BEHAVIOR LAB
          </h1>
          <p className="text-xs text-zinc-600 font-mono-data mt-0.5">
            Calibrate 15 simulation dimensions, track nonverbal micro-signals, and simulate sensitivity shifts under stress multipliers.
          </p>
        </div>

        {/* Subject Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xs border border-black/15 shadow-xs">
          <span className="text-xs font-mono-data text-zinc-600 font-bold px-2">TARGET:</span>
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSubId(s.id)}
              className={`px-3 py-1 rounded-xs text-xs font-mono-data transition-colors cursor-pointer ${
                selectedSubId === s.id
                  ? 'bg-[#DC2626] text-white font-bold'
                  : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              {s.code} ({s.name})
            </button>
          ))}
        </div>
      </div>

      {/* Non-Diagnostic Disclaimer Banner */}
      <div className="p-3.5 rounded-xs bg-red-50/60 border border-red-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-700 font-mono-data leading-relaxed">
          <span className="font-bold text-[#DC2626]">BEHAVIORAL VARIABLE CLASSIFICATION:</span> The 15
          behavioral dimensions and nonverbal indicators are scientific psychological variables. They model peer dynamics, ego depletion, and social sensitivity.
        </div>
      </div>

      {/* Grid: 15 Dimensions + Sensitivity Tuning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 15 Behavioral Dimensions Grid (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono-data text-zinc-600 border-b border-black/10 pb-2">
            <span>15 PSYCHOLOGICAL DIMENSIONS — {activeSubject?.name.toUpperCase()} ({activeSubject?.code})</span>
            <span className="text-[#DC2626] font-bold">CONFIDENCE: &gt;80%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeSubject?.behavioralDimensions.map((dim, i) => (
              <div
                key={i}
                className="p-4 rounded-xs bg-white border border-black/15 space-y-2 hover:border-[#DC2626] transition-all relative overflow-hidden shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-black tracking-wide">{dim.name}</span>
                  <div className="flex items-center gap-1.5 font-mono-data text-xs">
                    <span className="text-[#DC2626] font-bold">{dim.value}%</span>
                    <span
                      className={`text-[10px] font-bold ${
                        dim.delta > 0
                          ? 'text-[#DC2626]'
                          : dim.delta < 0
                          ? 'text-emerald-700'
                          : 'text-zinc-500'
                      }`}
                    >
                      ({dim.delta > 0 ? `+${dim.delta}%` : `${dim.delta}%`})
                    </span>
                  </div>
                </div>

                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden border border-black/10">
                  <div
                    className="bg-[#DC2626] h-full rounded-full transition-all duration-500"
                    style={{ width: `${dim.value}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono-data text-zinc-500">
                  <span>Confidence: {dim.confidence}%</span>
                  <span className="truncate max-w-[150px]">Ref: {dim.inferredFrom}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sensitivity Tuning & Nonverbal Matrix (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Dynamic Sensitivity Tuner */}
          <HUDPanel
            title="SENSITIVITY & DEVIATION PROJECTION"
            subtitle="KAHNEMAN DYNAMICS"
            className="space-y-4 bg-white"
          >
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono-data text-zinc-700 mb-1 font-semibold">
                  <span>Peer Ostracism / Silence Multiplier</span>
                  <span className="text-[#DC2626] font-bold">{socialPressureMultiplier}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={socialPressureMultiplier}
                  onChange={(e) => setSocialPressureMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-[#DC2626]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono-data text-zinc-700 mb-1 font-semibold">
                  <span>Cognitive Ego Depletion (Post-Roast)</span>
                  <span className="text-black font-bold">{egoDepletionFactor}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={egoDepletionFactor}
                  onChange={(e) => setEgoDepletionFactor(parseFloat(e.target.value))}
                  className="w-full accent-black"
                />
              </div>
            </div>

            {/* Inferred Output */}
            <div className="p-4 rounded-xs bg-red-50/50 border border-red-200 space-y-1.5 font-mono-data text-xs">
              <span className="text-zinc-600 block text-[10px] font-bold uppercase tracking-wider">
                PROJECTED MUTISM & RETREAT PROBABILITY:
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-black">{simulatedRebellion}%</span>
                <span className="text-xs text-[#DC2626] font-bold">
                  Base: {baseRebellion}% ({simulatedRebellion > baseRebellion ? `+${simulatedRebellion - baseRebellion}%` : '0%'})
                </span>
              </div>
              <p className="text-[10px] text-zinc-600 italic pt-1 border-t border-red-200">
                At this depletion level, Kahneman System 1 paralysis overrides habitual verbal roasting.
              </p>
            </div>
          </HUDPanel>

          {/* Observed Body Language Signals */}
          <HUDPanel
            title="NONVERBAL SIGNALS TRACKER"
            subtitle="KINESICS TELEMETRY"
            className="space-y-3 bg-white"
          >
            <div className="space-y-2.5">
              {activeSubject?.bodyLanguageSignals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-3.5 rounded-xs bg-zinc-50 border border-black/10 space-y-1 text-xs hover:border-[#DC2626] transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black">{sig.signal}</span>
                    <span className="text-[10px] font-mono-data px-2 py-0.5 rounded-xs bg-red-50 border border-red-200 text-[#DC2626] font-bold">
                      {sig.frequency}
                    </span>
                  </div>
                  <p className="text-zinc-600 text-[11px] font-mono-data">{sig.context}</p>
                  <p className="text-[10px] font-mono-data text-zinc-500 pt-1 border-t border-black/10">
                    Ref: <span className="text-[#DC2626] font-semibold">{sig.referenceSource}</span>
                  </p>
                </div>
              ))}
            </div>
          </HUDPanel>
        </div>
      </div>
    </div>
  );
};
