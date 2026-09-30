/**
 * BLACK S.H.E.E.P. - Intelligent Alert & Telemetry Center
 * Implements Section 54 of Extreme UI Directive:
 * - Categories: SYSTEM, EXPERIMENT, ANOMALY, RAG, AI, CASE
 * - Priority Levels: INFO, NOTICE, WARNING, CRITICAL
 * - Actionable buttons, timestamps, sources
 */

import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Flame,
  Info,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
  Brain,
  FlaskConical,
  FolderKanban,
  Database,
} from 'lucide-react';
import { ActiveModule } from '../layout/Shell';

export type AlertPriority = 'INFO' | 'NOTICE' | 'WARNING' | 'CRITICAL';
export type AlertCategory = 'SYSTEM' | 'EXPERIMENT' | 'ANOMALY' | 'RAG' | 'AI' | 'CASE';

export interface WorkstationAlert {
  id: string;
  category: AlertCategory;
  priority: AlertPriority;
  source: string;
  timestamp: string;
  title: string;
  description: string;
  targetModule?: ActiveModule;
}

interface AlertCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: ActiveModule) => void;
}

const SAMPLE_ALERTS: WorkstationAlert[] = [
  {
    id: 'alt-01',
    category: 'ANOMALY',
    priority: 'CRITICAL',
    source: 'BEHAVIOR_OBSERVER',
    timestamp: '18:42:29',
    title: 'Behavioral Deviation in Subject HX-071 (Arjun)',
    description:
      'Baseline Conflict Avoidance of 84% violated. Subject engaged in direct peer confrontation during Experiment EXP-038.',
    targetModule: 'analytics',
  },
  {
    id: 'alt-02',
    category: 'EXPERIMENT',
    priority: 'WARNING',
    source: 'SIMULATION_KERNEL',
    timestamp: '18:38:15',
    title: 'Trial EXP-038 Observation Window Closing',
    description:
      'Post-trigger stimulus window has reached 80% elapsed time. Record outcome data before cycle concludes.',
    targetModule: 'experiments',
  },
  {
    id: 'alt-03',
    category: 'AI',
    priority: 'NOTICE',
    source: 'GEMINI_ENGINE',
    timestamp: '18:25:00',
    title: 'Hypothesis H-019 Supported by New Kinesic Signals',
    description:
      'Ventral denial and micro-expression twitch frequency confirmed conformity breakdown hypothesis.',
    targetModule: 'cases',
  },
  {
    id: 'alt-04',
    category: 'RAG',
    priority: 'INFO',
    source: 'VECTOR_STORE',
    timestamp: '18:10:44',
    title: 'RAG Knowledge Core Index Verification',
    description:
      '998 chunks successfully vectorized across 8 treatises. Cosine distance matrix calibrated.',
    targetModule: 'rag_knowledge',
  },
  {
    id: 'alt-05',
    category: 'SYSTEM',
    priority: 'INFO',
    source: 'HS256_AUTH',
    timestamp: '18:00:12',
    title: 'Level-5 Research Session Re-verified',
    description:
      'Cryptographic signature validated for current operator session. Telemetry streaming active.',
    targetModule: 'system',
  },
];

export const AlertCenterModal: React.FC<AlertCenterModalProps> = ({
  isOpen,
  onClose,
  onSelectModule,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory | 'ALL'>('ALL');
  const [alerts, setAlerts] = useState<WorkstationAlert[]>(SAMPLE_ALERTS);

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter(
    (a) => selectedCategory === 'ALL' || a.category === selectedCategory
  );

  const getPriorityStyle = (priority: AlertPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          badge: 'bg-red-100 text-red-700 border-red-300',
          border: 'border-red-300 bg-red-50/40',
          icon: Flame,
          iconColor: 'text-red-600',
        };
      case 'WARNING':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          border: 'border-amber-300 bg-amber-50/40',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
        };
      case 'NOTICE':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          border: 'border-blue-200 bg-blue-50/40',
          icon: Info,
          iconColor: 'text-blue-600',
        };
      default:
        return {
          badge: 'bg-zinc-100 text-zinc-700 border-zinc-300',
          border: 'border-black/10 bg-zinc-50',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 font-mono-data select-none">
      <div className="fixed inset-0" onClick={onClose} title="Click to dismiss" />
      <div className="relative z-10 max-w-2xl w-full bg-white border-2 border-red-600 rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-600" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-600" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-600" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-600" />

        {/* Header */}
        <div className="p-4 border-b border-black/10 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-display text-2xl text-black tracking-wider">
                INTELLIGENT ALERT CENTER
              </h3>
              <span className="text-[10px] text-red-600 font-bold block">
                CLASSIFIED TELEMETRY & BEHAVIORAL WARNINGS
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-black hover:bg-zinc-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="p-3 border-b border-black/10 bg-white flex items-center gap-1.5 overflow-x-auto text-[10px]">
          {(['ALL', 'ANOMALY', 'EXPERIMENT', 'AI', 'RAG', 'SYSTEM'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-xs border font-bold cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white border-red-600 shadow-xs'
                  : 'bg-zinc-50 text-zinc-600 border-black/15 hover:text-black hover:bg-zinc-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Alerts Stream */}
        <div className="max-h-[55vh] overflow-y-auto p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              NO ACTIVE ALERTS IN THIS CATEGORY // TELEMETRY NOMINAL
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const style = getPriorityStyle(alert.priority);
              const Icon = style.icon;

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-lg border ${style.border} space-y-2`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${style.iconColor}`} />
                      <span className="font-bold text-black tracking-wider">
                        {alert.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-xs border uppercase ${style.badge}`}
                      >
                        {alert.priority}
                      </span>
                      <span className="text-[10px] text-zinc-500">{alert.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-700 font-sans leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 border-t border-black/10">
                    <span>SOURCE: {alert.source}</span>
                    {alert.targetModule && (
                      <button
                        onClick={() => {
                          onSelectModule(alert.targetModule!);
                          onClose();
                        }}
                        className="text-red-600 hover:text-red-700 flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <span>GO TO {alert.targetModule.toUpperCase()}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-black/10 bg-zinc-50 flex items-center justify-between text-xs text-zinc-600">
          <span>{alerts.length} TOTAL AUDIT SIGNALS</span>
          <button
            onClick={() => setAlerts([])}
            className="text-[10px] text-zinc-600 hover:text-black underline cursor-pointer"
          >
            Acknowledge All
          </button>
        </div>
      </div>
    </div>
  );
};
