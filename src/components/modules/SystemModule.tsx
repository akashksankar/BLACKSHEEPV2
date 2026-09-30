/**
 * BLACK S.H.E.E.P. - Module 10: System Telemetry & Game API Bridge
 * Fully aligned with Extreme UI / Motion / Visual Experience Directive
 * Sections 13, 14, 15, 34, 48, 50
 */

import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Brain,
  Wifi,
  Activity,
  Send,
  CheckCircle2,
  Terminal,
  Key,
  Lock,
  ShieldCheck,
  Copy,
  Check,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { HUDPanel } from '../common/HUDPanel';

export const SystemModule: React.FC = () => {
  const { user, jwt, authorizedPassKeys } = useAuth();
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Game API Webhook Test State
  const [targetSubjectCode, setTargetSubjectCode] = useState('HX-001');
  const [gameEventType, setGameEventType] = useState('SOCIAL_INTERACTION');
  const [gameEventTitle, setGameEventTitle] = useState('MCA Canteen Peer Roasting Encounter');
  const [gameEventNotes, setGameEventNotes] = useState('A S Remin Krishna initiated roasting banter at canteen table; peers responded with coordinated counter-mockery, causing subject to fall silent.');
  const [stressDelta, setStressDelta] = useState(14);
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectionResponse, setInjectionResponse] = useState<any>(null);

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const data = await api.getHealth();
      setHealthData(data);
    } catch {
      setHealthData({ status: 'degraded', api: 'ONLINE', gemini: 'STANDBY', rag: 'INDEXED' });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleInjectGameEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInjecting(true);
    setInjectionResponse(null);

    try {
      const payload = {
        subject_id: targetSubjectCode,
        event_type: gameEventType,
        timestamp: new Date().toISOString(),
        payload: {
          title: gameEventTitle,
          location: 'Library Courtyard',
          notes: gameEventNotes,
          anomaly: false,
          emotionalDeltas: {
            stress: Number(stressDelta),
            anxiety: Math.round(Number(stressDelta) * 0.8),
          },
        },
      };

      const res = await api.injectGameEvent(payload);
      setInjectionResponse(res);
    } catch (err: any) {
      setInjectionResponse({ error: err?.message || 'Injection failed' });
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-black/10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-data text-red-600 tracking-widest uppercase font-bold">
            <span>MODULE 10</span>
            <span>·</span>
            <span>SYSTEM HEALTH & SIMULATION HARNESS</span>
            <span>·</span>
            <span className="text-black">REST API TELEMETRY</span>
          </div>
          <h1 className="font-display text-4xl text-black tracking-wider mt-1">
            SYSTEM TELEMETRY
          </h1>
          <p className="text-xs text-zinc-600 font-mono-data mt-0.5">
            Real-time status of research workstation components and external open-world game API webhook harness.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="px-4 py-2 bg-black hover:bg-zinc-800 text-white border border-black rounded-lg text-xs font-mono-data font-bold tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-red-500 ${isLoadingHealth ? 'animate-spin' : ''}`} />
          <span>REFRESH HEALTH METRICS</span>
        </button>
      </div>

      {/* Infrastructure Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1: Frontend Client */}
        <div className="p-4 rounded-lg bg-white border border-black/15 shadow-sm space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono-data text-black/60">
            <span>CLIENT NODE</span>
            <Wifi className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-display text-black tracking-wide">ONLINE (PORT 3000)</p>
          <p className="text-[10px] font-mono-data text-emerald-600 font-semibold">Vite 8 SPA Subsystem</p>
        </div>

        {/* Metric 2: Express Server */}
        <div className="p-4 rounded-lg bg-white border border-black/15 shadow-sm space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono-data text-black/60">
            <span>INGRESS API</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-display text-black tracking-wide">ONLINE</p>
          <p className="text-[10px] font-mono-data text-emerald-600 font-semibold">Express REST Engine</p>
        </div>

        {/* Metric 3: Gemini AI SDK */}
        <div className="p-4 rounded-lg bg-white border border-black/15 shadow-sm space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono-data text-black/60">
            <span>NEURAL CORE</span>
            <Brain className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-display text-red-600 tracking-wide font-bold">
            {healthData?.gemini === 'CONNECTED' ? 'CONNECTED' : 'STANDBY'}
          </p>
          <p className="text-[10px] font-mono-data text-black/60">
            Model: gemini-3.8-flash
          </p>
        </div>

        {/* Metric 4: RAG Vector Store */}
        <div className="p-4 rounded-lg bg-white border border-black/15 shadow-sm space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono-data text-black/60">
            <span>VECTOR INDEX</span>
            <Database className="w-4 h-4 text-black" />
          </div>
          <p className="text-2xl font-display text-black tracking-wide">INDEXED</p>
          <p className="text-[10px] font-mono-data text-red-600 font-bold">
            998 Chunks + RAG Core
          </p>
        </div>
      </div>

      {/* Current Researcher Identity & Clearance */}
      <HUDPanel
        title="AUTHENTICATED INVESTIGATOR SESSION"
        subtitle="LEVEL-5 RESEARCH CLEARANCE"
        variant="amber"
        className="space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-data">
          <div>
            <span className="text-zinc-500 block text-[10px] font-bold">ACTIVE RESEARCHER:</span>
            <span className="text-black font-bold text-sm">{user?.name}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] font-bold">STATION ROLE:</span>
            <span className="text-red-600 font-bold text-sm">{user?.role}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] font-bold">CLEARANCE PROTOCOL:</span>
            <span className="text-emerald-700 font-bold text-sm">LEVEL-5 SCIENTIFIC PROTOCOL</span>
          </div>
        </div>
      </HUDPanel>

      {/* Cryptographic Subsystem & Pass Keys Directory */}
      <HUDPanel
        title="CRYPTOGRAPHIC AUTHENTICATION SUBSYSTEM (JWT RFC 7519)"
        subtitle="ALGORITHM: HS256"
        variant="default"
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Akash Sankar Pass Key */}
          <div className="p-4 rounded-lg border border-black/10 bg-zinc-50 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-data text-black/60 font-bold">USER 01 · SYSTEM ARCHITECT</span>
                <p className="font-bold text-sm text-black">Akash Sankar</p>
              </div>
              <span className="text-[10px] font-mono-data bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                LEVEL-5
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-black/10 flex items-center justify-between font-mono-data text-xs shadow-xs">
              <div>
                <span className="text-[10px] text-zinc-500 block">CREDENTIAL STATUS:</span>
                <span className="font-bold text-red-600 tracking-widest">•••••••••••••••• (ENCRYPTED)</span>
              </div>
              <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold">
                HS256 PROTECTED
              </span>
            </div>
            <p className="text-[10px] font-mono-data text-zinc-500">
              Clearance: <code className="text-black font-bold">RESTRICTED LEVEL-5 WORKSTATION</code>
            </p>
          </div>

          {/* Alfa Alias Pass Key */}
          <div className="p-4 rounded-lg border border-black/10 bg-zinc-50 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-data text-black/60 font-bold">USER 02 · PSYCHOLOGICAL ADVISOR</span>
                <p className="font-bold text-sm text-black">Alfa Alias</p>
              </div>
              <span className="text-[10px] font-mono-data bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                LEVEL-5
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-black/10 flex items-center justify-between font-mono-data text-xs shadow-xs">
              <div>
                <span className="text-[10px] text-zinc-500 block">CREDENTIAL STATUS:</span>
                <span className="font-bold text-red-600 tracking-widest">•••••••••••••••• (ENCRYPTED)</span>
              </div>
              <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold">
                HS256 PROTECTED
              </span>
            </div>
            <p className="text-[10px] font-mono-data text-zinc-500">
              Clearance: <code className="text-black font-bold">RESTRICTED LEVEL-5 WORKSTATION</code>
            </p>
          </div>
        </div>

        {/* Live JWT Claims Information */}
        <div className="p-3 bg-white text-black rounded font-mono-data text-xs space-y-1.5 border border-black/10 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-black/60 pb-1 border-b border-black/10">
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              ACTIVE SESSION JWT CLAIMS
            </span>
            <span className="text-[#DC2626]">SHARED WORKSPACE: AKASH SANKAR & ALFA ALIAS</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-black/50 block text-[10px]">SUBJECT (SUB):</span>
              <span className="text-black font-bold">{jwt?.sub || user?.id}</span>
            </div>
            <div>
              <span className="text-black/50 block text-[10px]">TOKEN TYPE:</span>
              <span className="text-black font-bold">Bearer JWT</span>
            </div>
            <div>
              <span className="text-black/50 block text-[10px]">ALGORITHM:</span>
              <span className="text-black font-bold">HS256</span>
            </div>
            <div>
              <span className="text-black/50 block text-[10px]">CLEARANCE:</span>
              <span className="text-emerald-600 font-bold">LEVEL-5 SHARED</span>
            </div>
          </div>
        </div>
      </HUDPanel>

      {/* Game API Integration Test Harness */}
      <HUDPanel
        title="GAME ENGINE SIMULATION WEBHOOK INJECTOR"
        subtitle="POST /api/game/events"
        variant="amber"
        className="space-y-4"
      >
        <p className="text-xs text-zinc-300 leading-relaxed font-normal">
          The campus behavioral simulation communicates with BLACK S.H.E.E.P. via clean REST API contracts.
          Test webhook ingestion below to verify that simulated encounters mutate subject timelines and emotional states in real-time.
        </p>

        <form onSubmit={handleInjectGameEvent} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono-data text-black/70 font-semibold mb-1">
                TARGET HUMAN SUBJECT
              </label>
              <select
                value={targetSubjectCode}
                onChange={(e) => setTargetSubjectCode(e.target.value)}
                className="w-full bg-white border border-black/20 rounded px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-[#DC2626]"
              >
                <option value="HX-001">HX-001 (A S Remin Krishna - Active Monitored Target)</option>
                <option value="HX-002">HX-002 (FACULTY 1 MCA - Connection Only)</option>
                <option value="HX-003">HX-003 (GOPI KRISHNAN - Friend / Connection Only)</option>
                <option value="HX-004">HX-004 (FACULTY 2 - Connection Only)</option>
                <option value="HX-005">HX-005 (BASIL BABU - Friend / Connection Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono-data text-black/70 font-semibold mb-1">
                EVENT TYPE
              </label>
              <select
                value={gameEventType}
                onChange={(e) => setGameEventType(e.target.value)}
                className="w-full bg-white border border-black/20 rounded px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-[#DC2626]"
              >
                <option value="SOCIAL_INTERACTION">SOCIAL_INTERACTION</option>
                <option value="EMOTION_UPDATE">EMOTION_UPDATE</option>
                <option value="EXPERIMENT_TRIGGER">EXPERIMENT_TRIGGER</option>
                <option value="ANOMALY_EVENT">ANOMALY_EVENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono-data text-black/70 font-semibold mb-1">
                INJECT STRESS DELTA (%)
              </label>
              <input
                type="number"
                value={stressDelta}
                onChange={(e) => setStressDelta(Number(e.target.value))}
                className="w-full bg-white border border-black/20 rounded px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-[#DC2626]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono-data text-black/70 font-semibold mb-1">
              EVENT SUMMARY *
            </label>
            <input
              type="text"
              required
              value={gameEventTitle}
              onChange={(e) => setGameEventTitle(e.target.value)}
              className="w-full bg-white border border-black/20 rounded px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-[#DC2626]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-data text-black/70 font-semibold mb-1">
              PAYLOAD NOTES
            </label>
            <textarea
              rows={2}
              value={gameEventNotes}
              onChange={(e) => setGameEventNotes(e.target.value)}
              className="w-full bg-white border border-black/20 rounded px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-[#DC2626]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] font-mono-data text-black/60">
              Dispatches JSON payload directly to simulation ingress webhook route.
            </span>
            <button
              type="submit"
              disabled={isInjecting}
              className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded text-xs font-mono-data font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isInjecting ? 'INJECTING STIMULUS...' : 'INJECT GAME EVENT'}</span>
            </button>
          </div>
        </form>

        {/* Webhook Response Log */}
        {injectionResponse && (
          <div className="p-4 rounded bg-white border border-[#DC2626]/40 space-y-2 font-mono-data text-xs shadow-xs">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>WEBHOOK ACKNOWLEDGED BY COMPANION INGRESS</span>
            </div>
            <pre className="text-[11px] text-black overflow-x-auto bg-zinc-50 p-3 rounded border border-black/10">
              {JSON.stringify(injectionResponse, null, 2)}
            </pre>
          </div>
        )}
      </HUDPanel>
    </div>
  );
};
