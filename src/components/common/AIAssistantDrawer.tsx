/**
 * BLACK S.H.E.E.P. - Section 57: AI Intel Assistant Slide-out Drawer
 * Light Theme: Pure White (#FFFFFF), Deep Black (#000000), Scientific Red (#DC2626)
 * Zero robot terminology (Strictly human subjects)
 */

import React, { useState } from 'react';
import {
  Brain,
  X,
  Send,
  ArrowRight,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { Subject, ResearchCase, Experiment, Anomaly } from '../../types';
import { ActiveModule } from '../layout/Shell';
import { api } from '../../services/api';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  cases: ResearchCase[];
  experiments: Experiment[];
  anomalies: Anomaly[];
  onSelectModule: (module: ActiveModule) => void;
  onSelectSubject?: (subId: string) => void;
}

interface AssistantMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  actionLinks?: Array<{
    label: string;
    module?: ActiveModule;
    subjectId?: string;
  }>;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  subjects,
  cases,
  experiments,
  anomalies,
  onSelectModule,
  onSelectSubject,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-01',
      sender: 'assistant',
      text: 'AI Intel Assistant online. Inquire about human psychological vulnerabilities, active anomalies, peer dynamic deviations, or A S Remin Krishna breaking point orchestration.',
      timestamp: '18:42:10',
    },
  ]);
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    const userText = query.trim();
    setQuery('');

    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    setProcessingStage('PARSING INQUIRY & RETRIEVING PSYCHOLOGICAL VECTORS...');
    await new Promise((r) => setTimeout(r, 400));

    setProcessingStage('SEARCHING RAG KNOWLEDGE BASE & CAMPUS COHORT LEDGER...');
    await new Promise((r) => setTimeout(r, 450));

    setProcessingStage('SYNTHESIZING BEHAVIORAL ARCHITECTURE...');
    await new Promise((r) => setTimeout(r, 400));

    const lower = userText.toLowerCase();
    let replyText = '';
    let actionLinks: AssistantMessage['actionLinks'] = [];

    try {
      const ragRes = await api.queryRAG(userText);
      if (ragRes && ragRes.geminiSynthesis) {
        replyText = ragRes.geminiSynthesis;
      }
    } catch {
      // Fallback to domain heuristics if network/offline
    }

    if (!replyText) {
      if (lower.includes('remin') || lower.includes('roast') || lower.includes('krishna') || lower.includes('mca')) {
        replyText =
          'Subject A S Remin Krishna (HX-001, 22yo MCA Student) exhibits high verbal dominance and compulsive roasting behavior as an attention-seeking defense mechanism. However, when his peer group isolates him or delivers a sharp counter-roast, his System 2 controls freeze, resulting in acute verbal mutism and backward physical retreat.';
      } else if (lower.includes('breaking') || lower.includes('vulnerability') || lower.includes('collapse')) {
        replyText =
          'Synthesizing Behavioral Architecture: Subject A S Remin Krishna’s primary vulnerability is "Peer Group Collective Silence & Counter-Roast Mutism." Orchestration Recipe requires coordinated deadpan peer silence followed by a calibrated counter-roast.';
      } else if (lower.includes('anomaly') || lower.includes('deviation')) {
        replyText = `Active telemetry records ${anomalies.length} total anomalies. The most prominent is ANOM-001 (CRITICAL Score), where A S Remin Krishna experienced complete verbal collapse after a coordinated canteen silence stimulus.`;
      } else if (lower.includes('experiment') || lower.includes('deploy')) {
        replyText = `Workstation currently manages ${experiments.length} experimental trials. The multi-stage experiment builder is calibrated for variable adjustment (Peer Pressure, Faculty Presence, Silence Protocol).`;
      } else {
        replyText = `Cross-referencing behavioral knowledge base: Found ${subjects.length} monitored human subjects and ${cases.length} active research cases across peer dynamics, cognitive heuristics, and power dynamics.`;
      }
    }

    // Contextual quick links
    if (lower.includes('remin') || lower.includes('roast') || lower.includes('krishna') || lower.includes('mca')) {
      actionLinks = [
        { label: 'View A S Remin Krishna Dossier', module: 'subjects', subjectId: 'HX-001' },
        { label: 'Inspect Peer Boycott Anomaly', module: 'analytics' },
      ];
    } else if (lower.includes('breaking') || lower.includes('vulnerability') || lower.includes('collapse')) {
      actionLinks = [
        { label: 'Open Breaking Point Architecture', module: 'subjects', subjectId: 'HX-001' },
        { label: 'Deploy Peer Silence Trial', module: 'experiments' },
      ];
    } else if (lower.includes('anomaly') || lower.includes('deviation')) {
      actionLinks = [{ label: 'Inspect Anomaly Center', module: 'analytics' }];
    } else if (lower.includes('experiment') || lower.includes('deploy')) {
      actionLinks = [{ label: 'Open Experiment Builder', module: 'experiments' }];
    } else {
      actionLinks = [
        { label: 'Examine Monitored Subjects', module: 'subjects' },
        { label: 'Open RAG Knowledge Base', module: 'rag_knowledge' },
      ];
    }

    const aiMsg: AssistantMessage = {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      actionLinks,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsProcessing(false);
    setProcessingStage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Click-away backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        title="Click to dismiss assistant drawer"
      />
      <div className="relative z-10 w-full sm:max-w-md h-full bg-white border-l-2 border-[#DC2626] shadow-2xl flex flex-col font-mono-data select-none text-black">
      {/* Header */}
      <div className="p-4 border-b border-black/10 flex items-center justify-between bg-zinc-50">
        <div className="flex items-center gap-2.5">
          <Brain className="w-5 h-5 text-[#DC2626]" />
          <div>
            <h3 className="font-display text-xl text-black tracking-wider">
              AI INTEL ASSISTANT
            </h3>
            <span className="text-[10px] text-[#DC2626] font-bold block">
              GEMINI 3.8 FLASH // CONTEXT AWARE
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

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-xs border text-xs leading-relaxed ${
              m.sender === 'assistant'
                ? 'bg-zinc-50 border-black/10 text-zinc-800'
                : 'bg-red-50 border-[#DC2626] text-black ml-6'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
              <span className="font-bold text-[#DC2626]">
                {m.sender === 'assistant' ? 'BLACK S.H.E.E.P. AI' : 'RESEARCHER'}
              </span>
              <span>{m.timestamp}</span>
            </div>
            <p className="font-sans font-normal text-xs">{m.text}</p>

            {/* Quick Action Deep Links */}
            {m.actionLinks && m.actionLinks.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-black/10 space-y-1">
                {m.actionLinks.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (link.subjectId && onSelectSubject) onSelectSubject(link.subjectId);
                      if (link.module) onSelectModule(link.module);
                      onClose();
                    }}
                    className="w-full text-left p-1.5 rounded-xs bg-white hover:bg-red-50 border border-black/15 text-[11px] text-black hover:text-[#DC2626] flex items-center justify-between cursor-pointer transition-colors shadow-xs"
                  >
                    <span className="font-semibold">{link.label}</span>
                    <ArrowRight className="w-3 h-3 text-[#DC2626]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Processing Indicator */}
        {isProcessing && processingStage && (
          <div className="p-3 rounded-xs bg-red-50 border border-red-200 text-[#DC2626] space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping" />
              <span>{processingStage}</span>
            </div>
            <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#DC2626] to-black animate-pulse w-full" />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Queries */}
      <div className="p-2 border-t border-black/10 bg-zinc-50 flex items-center gap-1.5 overflow-x-auto text-[10px]">
        <button
          onClick={() => setQuery("Analyze A S Remin Krishna's breaking point")}
          className="px-2 py-1 rounded bg-white hover:bg-red-50 text-zinc-700 hover:text-[#DC2626] border border-black/10 whitespace-nowrap cursor-pointer"
        >
          Remin Krishna
        </button>
        <button
          onClick={() => setQuery("Inspect behavioral anomalies")}
          className="px-2 py-1 rounded bg-white hover:bg-red-50 text-zinc-700 hover:text-[#DC2626] border border-black/10 whitespace-nowrap cursor-pointer"
        >
          Active Anomalies
        </button>
        <button
          onClick={() => setQuery("Show peer counter-roast stimulus")}
          className="px-2 py-1 rounded bg-white hover:bg-red-50 text-zinc-700 hover:text-[#DC2626] border border-black/10 whitespace-nowrap cursor-pointer"
        >
          Roast Stimulus
        </button>
      </div>

      {/* Query Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-black/10 bg-white flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI Intel about Remin Krishna, cases, trials..."
          className="flex-1 bg-zinc-50 border border-black/15 focus:border-[#DC2626] focus:bg-white rounded px-3 py-2 text-xs font-mono-data text-black focus:outline-none"
        />
        <button
          type="submit"
          disabled={!query.trim() || isProcessing}
          className="px-3.5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 text-white rounded font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
      </div>
    </div>
  );
};
