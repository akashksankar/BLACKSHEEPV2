/**
 * BLACK S.H.E.E.P. - Section 19: Behavioral Signal Stream
 * Light Theme: Pure White (#FFFFFF), Deep Black (#000000), Scientific Red (#DC2626)
 * Real-time kinesic and behavioral signal stream calibrated for campus dynamics
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Clock } from 'lucide-react';
import { BodyLanguageSignal } from '../../../types';

interface SignalEvent {
  id: string;
  time: string;
  category: 'AVOIDANCE' | 'KINESIC' | 'PROXEMIC' | 'PARALINGUISTIC';
  signal: string;
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
  frequency: string;
  context: string;
}

interface BehavioralSignalStreamProps {
  signals?: BodyLanguageSignal[];
}

const DEFAULT_STREAM: SignalEvent[] = [
  {
    id: 'sig-01',
    time: '18:42:34',
    category: 'PARALINGUISTIC',
    signal: 'Sudden vocal cessation and mutism following sharp peer counter-roast',
    confidence: 'HIGH',
    frequency: 'ACUTE',
    context: 'MCA Department Canteen table confrontation',
  },
  {
    id: 'sig-02',
    time: '18:42:29',
    category: 'PROXEMIC',
    signal: 'Ventral denial & immediate 3-step backward retreat away from peer circle',
    confidence: 'HIGH',
    frequency: 'RECURRING',
    context: 'Campus corridor after friends turned their backs',
  },
  {
    id: 'sig-03',
    time: '18:42:23',
    category: 'PARALINGUISTIC',
    signal: 'Hyper-familiar joking rhetoric and teasing directed at faculty member',
    confidence: 'HIGH',
    frequency: 'HIGH',
    context: 'Department lab entry greeting to FACULTY 1 MCA',
  },
  {
    id: 'sig-04',
    time: '18:42:18',
    category: 'AVOIDANCE',
    signal: 'Total gaze avoidance, looking down at smartphone screen in silence',
    confidence: 'HIGH',
    frequency: 'HIGH',
    context: 'Peer group discussion isolating him after offensive roast',
  },
  {
    id: 'sig-05',
    time: '18:40:02',
    category: 'KINESIC',
    signal: 'Vigorous hand gestures while debating Kerala CPIM / LDF government policies',
    confidence: 'HIGH',
    frequency: 'FREQUENT',
    context: 'Campus union lobby political discussion',
  },
];

export const BehavioralSignalStream: React.FC<BehavioralSignalStreamProps> = ({ signals }) => {
  const [filter, setFilter] = useState<'ALL' | 'AVOIDANCE' | 'KINESIC' | 'PROXEMIC' | 'PARALINGUISTIC'>('ALL');

  const streamData: SignalEvent[] =
    signals && signals.length > 0
      ? signals.map((s, idx) => ({
          id: s.id || `sig-${idx}`,
          time: s.observedAt ? s.observedAt.slice(11, 19) : `18:42:${10 + idx}`,
          category: (s.signal.toLowerCase().includes('avoid')
            ? 'AVOIDANCE'
            : s.signal.toLowerCase().includes('proximity') || s.signal.toLowerCase().includes('retreat') || s.signal.toLowerCase().includes('step')
            ? 'PROXEMIC'
            : s.signal.toLowerCase().includes('vocal') || s.signal.toLowerCase().includes('mutism') || s.signal.toLowerCase().includes('speech')
            ? 'PARALINGUISTIC'
            : 'KINESIC') as any,
          signal: s.signal,
          confidence: s.confidence as any,
          frequency: s.frequency,
          context: s.context,
        }))
      : DEFAULT_STREAM;

  const filteredStream = streamData.filter(
    (item) => filter === 'ALL' || item.category === filter
  );

  return (
    <div className="bg-white/95 border border-black/15 rounded-xs p-4 select-none font-mono-data text-xs shadow-sm relative">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#DC2626]" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#DC2626]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#DC2626]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#DC2626]" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-black/10 gap-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#DC2626]" />
          <span className="font-display text-lg text-black tracking-wider">
            BEHAVIORAL SIGNALS STREAM
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse ml-1" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[9px] overflow-x-auto">
          {(['ALL', 'AVOIDANCE', 'KINESIC', 'PROXEMIC', 'PARALINGUISTIC'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-0.5 rounded-xs border font-bold cursor-pointer transition-all ${
                filter === cat
                  ? 'bg-[#DC2626] text-white border-[#DC2626]'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-black hover:border-black/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Live Stream List */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        <AnimatePresence>
          {filteredStream.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="p-2.5 rounded-xs border border-black/10 bg-zinc-50/70 hover:border-[#DC2626] hover:bg-white transition-all space-y-1 shadow-xs"
            >
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 flex items-center gap-1 font-bold">
                    <Clock className="w-3 h-3 text-[#DC2626]" />
                    {ev.time}
                  </span>
                  <span className="text-[#DC2626] font-bold uppercase tracking-wider">
                    {ev.category}
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 rounded-xs bg-red-50 text-[#DC2626] border border-red-200 font-semibold">
                  {ev.confidence} CONFIDENCE
                </span>
              </div>

              <p className="text-xs text-black font-sans font-medium">{ev.signal}</p>

              <div className="text-[10px] text-zinc-500 pt-0.5">
                <span className="text-zinc-600 font-medium">Context:</span> {ev.context}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] text-zinc-600">
        <span>AUTO-INGESTION: CAMPUS TELEMETRY ACTIVE</span>
        <span className="text-[#DC2626] font-bold">STREAM SYNCHRONIZED</span>
      </div>
    </div>
  );
};
