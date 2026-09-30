/**
 * BLACK S.H.E.E.P. - Module 01: Central Telemetry & Dashboard Hero
 * Light Theme: Pure White (#FFFFFF), Deep Black (#000000), Scientific Red (#DC2626)
 * - Upper-level System Overview Hero with Live Greeting & Shared Workspace info
 * - Animated Number Counters for Active Cases, Human Subjects, Trials, Anomalies, RAG Chunks
 * - Zero robot terminology
 */

import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Users,
  FlaskConical,
  AlertTriangle,
  BrainCircuit,
  Database,
  ArrowUpRight,
  Activity,
  Flame,
} from 'lucide-react';
import { ResearchCase, Subject, Experiment, Anomaly } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { HUDPanel } from '../common/HUDPanel';

interface OverviewModuleProps {
  cases: ResearchCase[];
  subjects: Subject[];
  experiments: Experiment[];
  anomalies: Anomaly[];
  onNavigate: (module: any) => void;
  onSelectCase: (caseId: string) => void;
  onSelectSubject: (subId: string) => void;
}

const AnimatedCounter: React.FC<{ value: number; padDigits?: number }> = ({
  value,
  padDigits = 2,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 800; // ms
    const stepTime = 30;
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const formatted =
    padDigits > 0 ? displayValue.toString().padStart(padDigits, '0') : displayValue.toString();

  return <span>{formatted}</span>;
};

export const OverviewModule: React.FC<OverviewModuleProps> = ({
  cases,
  subjects,
  experiments,
  anomalies,
  onNavigate,
  onSelectCase,
  onSelectSubject,
}) => {
  const { user } = useAuth();

  const activeCases = cases.filter((c) => c.status === 'ACTIVE').length;
  const runningExperiments = experiments.filter(
    (e) => e.status === 'RUNNING' || e.status === 'OBSERVING'
  ).length;
  const highAnomalies = anomalies.filter(
    (a) => a.anomalyScore === 'HIGH' || a.anomalyScore === 'CRITICAL'
  ).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const researcherFirstName = user?.name ? user.name.toUpperCase() : 'OPERATOR';

  return (
    <div className="space-y-6 select-none font-sans text-black">
      {/* Dashboard Hero Overview Panel */}
      <HUDPanel scanline cornerBrackets className="bg-white/95 border-black/15 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-black/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-data text-[#DC2626] font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping" />
              <span>{getGreeting()}, {researcherFirstName}</span>
              <span className="text-zinc-300">·</span>
              <span>SHARED LEVEL-5 WORKSPACE [AKASH SANKAR &amp; ALFA ALIAS]</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-black tracking-widest">
              RESEARCH COMMAND CENTER
            </h1>
            <p className="text-xs text-zinc-600 font-mono-data mt-1">
              Continuous psychological telemetry observation, campus peer experimentation, and breaking point synthesis.
            </p>
          </div>

          {/* Quick Command Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('experiments')}
              className="px-4 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xs text-xs font-mono-data font-bold tracking-wider uppercase transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              <span>DEPLOY EXPERIMENT</span>
            </button>
            <button
              onClick={() => onNavigate('rag_knowledge')}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-black hover:text-[#DC2626] rounded-xs text-xs font-mono-data font-bold tracking-wider uppercase transition-all border border-black/15 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <BrainCircuit className="w-4 h-4 text-[#DC2626]" />
              <span>KNOWLEDGE CORE</span>
            </button>
          </div>
        </div>

        {/* Status Strip */}
        <div className="pt-3 flex flex-wrap items-center justify-between text-xs font-mono-data text-zinc-600 gap-2">
          <div className="flex items-center gap-3">
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              SYSTEM STATUS: OPERATIONAL
            </span>
            <span className="text-zinc-300">|</span>
            <span>CAMPUS COHORT: MCA BATCH (2026)</span>
            <span className="text-zinc-300">|</span>
            <span className="text-[#DC2626] font-semibold">GRID MOTION: 60Hz DYNAMIC</span>
          </div>
          <div className="text-[11px] text-zinc-800 font-bold">
            SHARED WORKSPACE SYNC // REAL-TIME CO-PRESENCE ACTIVE
          </div>
        </div>
      </HUDPanel>

      {/* Primary Animated Metrics Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 font-mono-data">
        {/* Metric 1: Active Cases */}
        <HUDPanel cornerBrackets className="p-3.5 bg-white">
          <div className="flex items-center justify-between text-zinc-600 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-black">
              ACTIVE CASES
            </span>
            <FolderKanban className="w-4 h-4 text-[#DC2626]" />
          </div>
          <p className="text-4xl font-display text-black tracking-wider">
            <AnimatedCounter value={activeCases || 1} />
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            {cases.length} Registered Cases
          </p>
        </HUDPanel>

        {/* Metric 2: Monitored Subjects */}
        <HUDPanel cornerBrackets className="p-3.5 bg-white">
          <div className="flex items-center justify-between text-zinc-600 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-black">
              SUBJECTS
            </span>
            <Users className="w-4 h-4 text-[#DC2626]" />
          </div>
          <p className="text-4xl font-display text-black tracking-wider">
            <AnimatedCounter value={subjects.length || 5} />
          </p>
          <p className="text-[10px] text-[#DC2626] font-semibold mt-1">
            Primary: A S Remin Krishna
          </p>
        </HUDPanel>

        {/* Metric 3: Running Trials */}
        <HUDPanel cornerBrackets className="p-3.5 bg-white">
          <div className="flex items-center justify-between text-zinc-600 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-black">
              TRIALS RUNNING
            </span>
            <FlaskConical className="w-4 h-4 text-[#DC2626]" />
          </div>
          <p className="text-4xl font-display text-black tracking-wider">
            <AnimatedCounter value={runningExperiments || 1} />
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            {experiments.length} Total Built
          </p>
        </HUDPanel>

        {/* Metric 4: Anomalies */}
        <HUDPanel cornerBrackets className="p-3.5 bg-white">
          <div className="flex items-center justify-between text-zinc-600 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-black">
              ANOMALIES
            </span>
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
          </div>
          <p className="text-4xl font-display text-[#DC2626] tracking-wider">
            <AnimatedCounter value={anomalies.length || 1} />
          </p>
          <p className="text-[10px] text-[#DC2626] font-bold mt-1">
            {highAnomalies || 1} Critical Priority
          </p>
        </HUDPanel>

        {/* Metric 5: RAG Chunks */}
        <HUDPanel cornerBrackets className="p-3.5 bg-white">
          <div className="flex items-center justify-between text-zinc-600 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-black">
              RAG CHUNKS
            </span>
            <Database className="w-4 h-4 text-black" />
          </div>
          <p className="text-4xl font-display text-black tracking-wider">
            <AnimatedCounter value={998} padDigits={3} />
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            8 Treatises Ingested
          </p>
        </HUDPanel>

        {/* Metric 6: Simulation Epoch */}
        <HUDPanel cornerBrackets className="p-3.5 bg-white">
          <div className="flex items-center justify-between text-zinc-600 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-black">
              OBSERVATION CYCLE
            </span>
            <Activity className="w-4 h-4 text-[#DC2626]" />
          </div>
          <p className="text-4xl font-display text-black tracking-wider">
            #042
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            MCA Campus Term 2
          </p>
        </HUDPanel>
      </div>

      {/* High Attention Anomaly Alert Banner */}
      {anomalies.length > 0 && (
        <div className="bg-red-50 border-2 border-[#DC2626] p-4 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm font-mono-data relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#DC2626] to-transparent animate-scanline pointer-events-none" />

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xs bg-[#DC2626] text-white shadow-xs shrink-0">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl text-black tracking-wider">
                  CRITICAL BEHAVIORAL ANOMALY: {anomalies[0].code}
                </span>
                <span className="text-[10px] bg-[#DC2626] text-white font-bold px-2 py-0.5 rounded-xs">
                  SCORE: {anomalies[0].anomalyScore}
                </span>
              </div>
              <p className="text-xs text-zinc-700 font-sans mt-0.5">
                Subject {anomalies[0].subjectName} ({anomalies[0].subjectCode}) — {anomalies[0].title}. Ostracism stimulus triggered instant verbal mutism and backward retreat.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('analytics')}
            className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xs text-xs font-bold tracking-wider uppercase whitespace-nowrap cursor-pointer transition-colors shadow-xs"
          >
            INVESTIGATE DEVIATION
          </button>
        </div>
      )}

      {/* Two-Column Classified Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Cases & Monitored Subjects (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Cases Section */}
          <HUDPanel
            title="ACTIVE RESEARCH CASES"
            tag="MODULE 02"
            headerRight={
              <button
                onClick={() => onNavigate('cases')}
                className="text-xs font-mono-data text-[#DC2626] hover:text-[#B91C1C] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>ALL CASES</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="space-y-3 font-mono-data">
              {cases.length === 0 ? (
                <div className="p-6 rounded-xs border border-dashed border-black/20 bg-zinc-50 text-center space-y-2">
                  <p className="text-xs text-black font-bold">
                    NO ACTIVE CASES // INITIALIZE CASE 001
                  </p>
                  <p className="text-[11px] text-zinc-600 max-w-sm mx-auto">
                    Define behavioral variables and begin observing human subject interactions.
                  </p>
                  <button
                    onClick={() => onNavigate('cases')}
                    className="mt-2 px-3.5 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xs text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>INITIALIZE CASE</span>
                  </button>
                </div>
              ) : (
                cases.slice(0, 2).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCase(c.id)}
                    className="p-4 rounded-xs border border-black/15 bg-white hover:border-[#DC2626] transition-all cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#DC2626] font-bold">{c.code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-xs bg-red-50 border border-red-200 font-bold text-[#DC2626]">
                        {c.status}
                      </span>
                    </div>
                    <h3 className="font-display text-xl text-black group-hover:text-[#DC2626] transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-xs text-zinc-600 font-sans mt-1 line-clamp-2">{c.objective}</p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/10 text-[11px] text-zinc-600 font-medium">
                      <span>ENV: {c.environment}</span>
                      <span>SUBJECTS: {c.assignedSubjectIds.length}</span>
                      <span className="text-[#DC2626] font-bold">ANOMALIES: {c.anomalyCount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </HUDPanel>

          {/* Subjects Live Telemetry Summary */}
          <HUDPanel
            title="MONITORED SUBJECT DOSSIERS"
            tag="MODULE 03"
            headerRight={
              <button
                onClick={() => onNavigate('subjects')}
                className="text-xs font-mono-data text-[#DC2626] hover:text-[#B91C1C] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>OPEN DOSSIERS</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono-data">
              {subjects.length === 0 ? (
                <div className="p-6 rounded-xs border border-dashed border-black/20 bg-zinc-50 text-center space-y-2 col-span-full">
                  <p className="text-xs text-black font-bold">
                    NO HUMAN SUBJECTS REGISTERED
                  </p>
                  <button
                    onClick={() => onNavigate('subjects')}
                    className="mt-2 px-3.5 py-1.5 bg-[#DC2626] text-white rounded-xs text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>REGISTER NEW SUBJECT</span>
                  </button>
                </div>
              ) : (
                subjects.slice(0, 3).map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => onSelectSubject(sub.id)}
                    className="p-3.5 rounded-xs border border-black/15 bg-white hover:border-[#DC2626] transition-all cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center gap-3 mb-2.5">
                      <img
                        src={sub.avatarUrl || '/src/assets/images/universal_male.svg'}
                        alt={sub.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xs object-cover border border-black/20 bg-zinc-100"
                      />
                      <div>
                        <span className="text-[10px] text-[#DC2626] font-bold">{sub.code}</span>
                        <h4 className="font-display text-lg text-black group-hover:text-[#DC2626] transition-colors leading-tight">
                          {sub.name}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-zinc-600">
                        <span>Stress</span>
                        <span className="text-[#DC2626] font-bold">{sub.emotionalState?.stress || 50}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 h-1.5 rounded-xs overflow-hidden">
                        <div
                          className="bg-[#DC2626] h-full"
                          style={{ width: `${sub.emotionalState?.stress || 50}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-zinc-600 pt-1">
                        <span>Role</span>
                        <span className="text-black font-bold truncate max-w-[130px]">
                          {sub.occupation}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </HUDPanel>
        </div>

        {/* Right Column: Active Experiment Spotlight & Local Knowledge Base (1 Col) */}
        <div className="space-y-6">
          {/* Active Experiment Spotlight */}
          <HUDPanel title="LATEST TRIAL SPOTLIGHT" tag="EXP-001">
            {experiments.length === 0 ? (
              <div className="p-4 rounded-xs border border-dashed border-black/20 text-center space-y-2 bg-zinc-50 font-mono-data">
                <p className="text-xs text-zinc-600 font-bold">NO EXPERIMENTS BUILT</p>
                <button
                  onClick={() => onNavigate('experiments')}
                  className="mt-1 px-3 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xs text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>BUILD EXPERIMENT</span>
                </button>
              </div>
            ) : (
              experiments[0] && (
                <div className="space-y-3 font-mono-data">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#DC2626] font-bold">{experiments[0].code}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-xs bg-red-50 text-[#DC2626] font-bold border border-red-200">
                      {experiments[0].status}
                    </span>
                  </div>

                  <h3 className="font-display text-xl text-black">{experiments[0].title}</h3>
                  <p className="text-xs text-zinc-600 font-sans">{experiments[0].objective}</p>

                  {/* Prediction vs Actual Box */}
                  {experiments[0].actualOutcome && (
                    <div className="p-3 rounded-xs bg-zinc-50 border border-black/10 space-y-2 text-xs">
                      <div className="text-zinc-600">
                        <span className="text-black font-bold">PREDICTED:</span>{' '}
                        {experiments[0].prediction?.predictedOutcome}
                      </div>
                      <div className="text-zinc-800">
                        <span className="text-[#DC2626] font-bold">ACTUAL:</span>{' '}
                        {experiments[0].actualOutcome.observedBehavior}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-black/10 text-[10px] font-bold">
                        <span className="text-[#DC2626]">DEVIATION: HIGH</span>
                        <span className="text-black">ERROR: {experiments[0].actualOutcome.predictionErrorPct}%</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onNavigate('experiments')}
                    className="w-full mt-2 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xs text-xs font-bold tracking-wider uppercase transition-colors text-center cursor-pointer shadow-xs"
                  >
                    OPEN EXPERIMENT LAB
                  </button>
                </div>
              )
            )}
          </HUDPanel>

          {/* Local Knowledge Repository Spotlight */}
          <HUDPanel title="KNOWLEDGE REPOSITORY" tag="RAG_INDEX">
            <p className="text-xs text-zinc-600 font-sans leading-relaxed mb-3">
              Mounted at <code className="bg-zinc-100 text-[#DC2626] px-1 py-0.5 rounded font-mono-data border border-zinc-200">/knowledge_base/</code>. Contains 8 foundational treatises on behavioral psychology, kinesics, and social dynamics.
            </p>
            <div className="space-y-1.5 text-xs font-mono-data text-zinc-700">
              <div className="flex justify-between py-1 border-b border-black/10">
                <span>/knowledge_base/docs/</span>
                <span className="text-[#DC2626] font-bold">8 MANUSCRIPTS</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/10">
                <span>/knowledge_base/pdfs/</span>
                <span className="text-emerald-700 font-bold">INDEXED</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('rag_knowledge')}
              className="w-full mt-3 py-2 border border-black/20 text-black hover:border-[#DC2626] hover:text-[#DC2626] hover:bg-red-50 rounded-xs text-xs font-mono-data font-bold transition-colors cursor-pointer"
            >
              BROWSE KNOWLEDGE REPOSITORY
            </button>
          </HUDPanel>
        </div>
      </div>
    </div>
  );
};
