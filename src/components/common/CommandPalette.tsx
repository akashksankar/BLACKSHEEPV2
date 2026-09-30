/**
 * BLACK S.H.E.E.P. - Section 56: Classified Command Palette
 * Light Theme: Pure White (#FFFFFF), Deep Black (#000000), Scientific Red (#DC2626)
 * Instant fuzzy search over:
 * - Module Navigation
 * - Active Cases
 * - Human Subjects (A S Remin Krishna & peers)
 * - Experiment Trials
 * - AI Diagnostics & Triggers
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Users,
  FlaskConical,
  Activity,
  BookOpen,
  BarChart3,
  Clock,
  FileText,
  Settings,
  Sparkles,
  RefreshCw,
  LogOut,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { ActiveModule } from '../layout/Shell';
import { Subject, ResearchCase, Experiment, Anomaly } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: ActiveModule) => void;
  subjects?: Subject[];
  cases?: ResearchCase[];
  experiments?: Experiment[];
  anomalies?: Anomaly[];
  onSelectSubject?: (subId: string) => void;
  onSelectCase?: (caseId: string) => void;
  onSwitchResearcher?: () => void;
  onLogout?: () => void;
  onOpenAnalysisModal?: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  category: 'NAVIGATION' | 'ACTIONS' | 'AI INTEL' | 'SYSTEM';
  icon: React.ElementType;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  subjects = [],
  cases = [],
  experiments = [],
  anomalies = [],
  onSelectSubject,
  onSelectCase,
  onSwitchResearcher,
  onLogout,
  onOpenAnalysisModal,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global key listener for Escape and Arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const primaryCommands: CommandItem[] = [
    {
      id: 'cmd-overview',
      label: 'Navigate to 01. Overview Dashboard',
      category: 'NAVIGATION',
      icon: LayoutDashboard,
      action: () => {
        onSelectModule('overview');
        onClose();
      },
    },
    {
      id: 'cmd-cases',
      label: 'Navigate to 02. Research Cases',
      category: 'NAVIGATION',
      icon: FolderKanban,
      action: () => {
        onSelectModule('cases');
        onClose();
      },
    },
    {
      id: 'cmd-subjects',
      label: 'Navigate to 03. Subject Dossiers & Psych Architecture',
      category: 'NAVIGATION',
      icon: Users,
      action: () => {
        onSelectModule('subjects');
        onClose();
      },
    },
    {
      id: 'cmd-experiments',
      label: 'Navigate to 04. Experiment Simulation Lab',
      category: 'NAVIGATION',
      icon: FlaskConical,
      action: () => {
        onSelectModule('experiments');
        onClose();
      },
    },
    {
      id: 'cmd-behavior',
      label: 'Navigate to 05. Behavioral Signal Lab',
      category: 'NAVIGATION',
      icon: Activity,
      action: () => {
        onSelectModule('behavior_lab');
        onClose();
      },
    },
    {
      id: 'cmd-rag',
      label: 'Navigate to 06. RAG Knowledge Core',
      category: 'NAVIGATION',
      icon: BookOpen,
      action: () => {
        onSelectModule('rag_knowledge');
        onClose();
      },
    },
    {
      id: 'cmd-analytics',
      label: 'Navigate to 07. Analytics & Matrix',
      category: 'NAVIGATION',
      icon: BarChart3,
      action: () => {
        onSelectModule('analytics');
        onClose();
      },
    },
    {
      id: 'cmd-timeline',
      label: 'Navigate to 08. Chronological Timeline',
      category: 'NAVIGATION',
      icon: Clock,
      action: () => {
        onSelectModule('timeline');
        onClose();
      },
    },
    {
      id: 'cmd-new-case',
      label: 'Create New Research Case',
      category: 'ACTIONS',
      icon: Plus,
      action: () => {
        onSelectModule('cases');
        onClose();
      },
    },
    {
      id: 'cmd-new-subject',
      label: 'Register New Human Subject',
      category: 'ACTIONS',
      icon: Users,
      action: () => {
        onSelectModule('subjects');
        onClose();
      },
    },
    {
      id: 'cmd-new-exp',
      label: 'Build & Deploy Experiment',
      category: 'ACTIONS',
      icon: FlaskConical,
      action: () => {
        onSelectModule('experiments');
        onClose();
      },
    },
    {
      id: 'cmd-ai-audit',
      label: 'Trigger AI Behavioral Diagnostic Audit',
      category: 'AI INTEL',
      icon: Sparkles,
      action: () => {
        if (onOpenAnalysisModal) onOpenAnalysisModal();
        onClose();
      },
    },
    {
      id: 'cmd-reports',
      label: 'Compile Dossier & Research Reports',
      category: 'NAVIGATION',
      icon: FileText,
      action: () => {
        onSelectModule('reports');
        onClose();
      },
    },
    {
      id: 'cmd-system',
      label: 'Open System Telemetry & Diagnostics',
      category: 'SYSTEM',
      icon: Settings,
      action: () => {
        onSelectModule('system');
        onClose();
      },
    },
    {
      id: 'cmd-switch',
      label: 'Switch Active Researcher Persona (Akash Sankar / Alfa Alias)',
      category: 'SYSTEM',
      icon: RefreshCw,
      action: () => {
        if (onSwitchResearcher) onSwitchResearcher();
        onClose();
      },
    },
    {
      id: 'cmd-logout',
      label: 'Terminate Research Session / Logout',
      category: 'SYSTEM',
      icon: LogOut,
      action: () => {
        if (onLogout) onLogout();
        onClose();
      },
    },
  ];

  const filteredCommands = primaryCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const matchingSubjects = subjects
    .filter(
      (s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.code.toLowerCase().includes(query.toLowerCase()) ||
        s.occupation.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 4);

  const matchingCases = cases
    .filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase()) ||
        c.objective.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-8 sm:pt-20 px-2 sm:px-4 font-mono-data">
      <div
        className="fixed inset-0"
        onClick={onClose}
        title="Click to dismiss command palette"
      />

      <div className="relative z-10 w-full max-w-2xl bg-white border-2 border-[#DC2626] rounded-xs shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#DC2626]" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#DC2626]" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#DC2626]" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#DC2626]" />

        {/* Input Bar */}
        <div className="p-4 border-b border-black/10 flex items-center gap-3 bg-zinc-50">
          <Search className="w-5 h-5 text-[#DC2626] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search subjects, cases, experiments..."
            className="w-full bg-transparent text-black placeholder-zinc-400 focus:outline-none text-sm font-mono-data font-semibold"
          />
          <span className="text-[10px] text-zinc-600 bg-white border border-black/15 px-1.5 py-0.5 rounded font-bold">
            ESC
          </span>
        </div>

        {/* Results Stream */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs">
          {/* Matching Subjects */}
          {matchingSubjects.length > 0 && query.trim() !== '' && (
            <div>
              <div className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider px-2 mb-1">
                MATCHING HUMAN SUBJECTS
              </div>
              <div className="space-y-1">
                {matchingSubjects.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      if (onSelectSubject) onSelectSubject(sub.id);
                      onSelectModule('subjects');
                      onClose();
                    }}
                    className="p-2.5 rounded-xs hover:bg-red-50 border border-transparent hover:border-red-200 cursor-pointer flex items-center justify-between text-black transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] text-[#DC2626] font-bold">
                        {sub.code}
                      </span>
                      <span className="font-bold text-black">{sub.name}</span>
                      <span className="text-zinc-500 text-[11px]">— {sub.occupation}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#DC2626]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Cases */}
          {matchingCases.length > 0 && query.trim() !== '' && (
            <div>
              <div className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider px-2 mb-1">
                MATCHING RESEARCH CASES
              </div>
              <div className="space-y-1">
                {matchingCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (onSelectCase) onSelectCase(c.id);
                      onSelectModule('cases');
                      onClose();
                    }}
                    className="p-2.5 rounded-xs hover:bg-red-50 border border-transparent hover:border-red-200 cursor-pointer flex items-center justify-between text-black transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] text-[#DC2626] font-bold">{c.code}</span>
                      <span className="font-bold text-black">{c.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-black font-semibold">
                        {c.status}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#DC2626]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Command List */}
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 mb-1">
              SYSTEM COMMANDS
            </div>
            <div className="space-y-1">
              {filteredCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <div
                    key={cmd.id}
                    onClick={cmd.action}
                    className="p-2.5 rounded-xs hover:bg-red-50 border border-transparent hover:border-red-200 cursor-pointer flex items-center justify-between text-zinc-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#DC2626]" />
                      <span className="font-medium text-black group-hover:text-[#DC2626] transition-colors">{cmd.label}</span>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                      {cmd.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-black/10 bg-zinc-50 flex items-center justify-between text-[10px] text-zinc-600">
          <span>NAVIGATION: ↑ ↓ TO MOVE · ENTER TO EXECUTE</span>
          <span className="text-[#DC2626] font-bold">SHARED WORKSPACE COMMAND PALETTE</span>
        </div>
      </div>
    </div>
  );
};
