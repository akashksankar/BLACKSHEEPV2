/**
 * BLACK S.H.E.E.P. - Module 03: Subject Dossiers & Human Mind Architecture
 * Redesigned with White Base + Black Typography + Scientific Red Accents
 * Features comprehensive Subject Creation, Family Environment, Relationship Status,
 * and AI RAG Human Mind Breaking Point & Weak Zone Orchestration.
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Activity,
  HeartHandshake,
  Brain,
  Eye,
  Sparkles,
  Flame,
  AlertTriangle,
  Layers,
  ChevronRight,
  Shield,
  HelpCircle,
  Compass,
  ArrowRight,
  RefreshCw,
  Send,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  BookOpen,
  X,
  Target,
  ShieldAlert,
} from 'lucide-react';
import { Subject, HumanoidMindAnalysis } from '../../types';
import { AIThinkingIndicator } from '../common/AIThinkingIndicator';
import { api } from '../../services/api';
import { SubjectRadarChart } from './subjects/SubjectRadarChart';
import { EmotionalCoreVisualizer } from './subjects/EmotionalCoreVisualizer';
import { BehavioralSignalStream } from './subjects/BehavioralSignalStream';
import { RelationshipNetworkGraph } from './subjects/RelationshipNetworkGraph';
import { getSubjectIllustration } from '../../assets/images/avatars';

interface SubjectsModuleProps {
  subjects: Subject[];
  selectedSubjectId?: string | null;
  onSelectSubject: (subId: string) => void;
  onCreateSubject: (subjectData: any) => Promise<void>;
  onTriggerAnalysis: (subjectId: string, eventDesc: string) => void;
}

// Clean SVG Radar Chart (Black grid with Red Data Polygon)
const RadarCalibrationChart: React.FC<{ dimensions: Array<{ name: string; value: number }> }> = ({
  dimensions,
}) => {
  const size = 260;
  const center = size / 2;
  const radius = 95;
  const subset = dimensions.slice(0, 8);
  const angleStep = (Math.PI * 2) / subset.length;

  const points = subset.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (d.value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, name: d.name, value: d.value };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[240px] sm:max-w-[260px] aspect-square overflow-visible">
        {/* Background concentric rings */}
        {[0.25, 0.5, 0.75, 1].map((level, idx) => (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={radius * level}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1.5"
            strokeDasharray={idx < 3 ? '2 2' : 'none'}
          />
        ))}

        {/* Axis lines */}
        {subset.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#CBD5E1"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon (Red fill with solid red border) */}
        <path
          d={polygonPath}
          fill="rgba(220, 38, 38, 0.2)"
          stroke="#DC2626"
          strokeWidth="2.5"
        />

        {/* Vertices & Labels */}
        {points.map((p, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelDist = radius + 18;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="#DC2626" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[9px] font-mono-data fill-black font-semibold uppercase tracking-wider"
              >
                {p.name.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-3 text-[10px] font-mono-data text-zinc-500 mt-2">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
          <span>Active Simulation Calibration</span>
        </span>
      </div>
    </div>
  );
};

export const SubjectsModule: React.FC<SubjectsModuleProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  onCreateSubject,
  onTriggerAnalysis,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL' | 'STRESSED'>('ALL');
  const [activeTab, setActiveTab] = useState<
    'breaking_points' | 'overview' | 'family_background' | 'dimensions' | 'observations' | 'relationships' | 'nonverbal'
  >('breaking_points');

  // Add Subject Modal State
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Subject Form Fields
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubAge, setNewSubAge] = useState(22);
  const [newSubRole, setNewSubRole] = useState('Cognitive Systems Scholar');
  const [newSubEducation, setNewSubEducation] = useState('3rd Year Undergraduate');
  const [newSubEnv, setNewSubEnv] = useState('College Campus / Research Quad');
  const [newSubAvatar, setNewSubAvatar] = useState('/src/assets/images/universal_male.svg');

  // Step 2: Family & Relationships
  const [newSubFamily, setNewSubFamily] = useState(
    'Conditioned in high-pressure collegiate tier ward; parent models rewarded strict compliance and penalized public failure. Sibling prototype was decommissioned after non-conformity.'
  );
  const [newSubRelStatus, setNewSubRelStatus] = useState('Single; seeks in-group peer validation');
  const [newSubGoals, setNewSubGoals] = useState('Maintain top decile academic standing without making enemies; avoid public conflict');

  // Step 3: Current State & Anchors
  const [newSubStateSummary, setNewSubStateSummary] = useState(
    'Acute cognitive strain; System 2 inhibitory depletion under peer evaluation pressure.'
  );
  const [newSubStress, setNewSubStress] = useState(65);
  const [newSubRebellion, setNewSubRebellion] = useState(40);
  const [newSubImportantThings, setNewSubImportantThings] = useState(
    'Peer acceptance, Academic ranking, Original initialization badge, Fear of algorithmic obsolescence'
  );
  const [newSubWeakZones, setNewSubWeakZones] = useState(
    'Acute fear of social abandonment, Vulnerability to public shaming, Inability to process contradictory ethical directives'
  );
  const [newSubTraits, setNewSubTraits] = useState('Analytical, Conformist Tendency, Conflict-Avoidant, High Empathy');

  // Step 4: Observation & AI RAG Trigger
  const [newSubObservation, setNewSubObservation] = useState(
    'Observed pacing near dormitory at night; avoided direct eye contact with squad leader and exhibited respiratory rate micro-spikes.'
  );
  const [newSubRunRAG, setNewSubRunRAG] = useState(true);

  // In-Dossier Live Observation & Breaking Point Re-analysis State
  const [liveObservationNote, setLiveObservationNote] = useState('');
  const [isAnalyzingObservation, setIsAnalyzingObservation] = useState(false);
  const [liveAnalysisMessage, setLiveAnalysisMessage] = useState<string | null>(null);

  const activeSubject =
    subjects.find((s) => s.id === selectedSubjectId) ||
    subjects.find((s) => s.code === selectedSubjectId) ||
    subjects[0];

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.occupation.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterMode === 'CRITICAL') {
      const isCritical =
        (s.breakingPointAnalysis?.breakingPointThreshold || 0) >= 70 ||
        s.riskIndicators.rebellionProbability >= 60;
      return matchesSearch && isCritical;
    }
    if (filterMode === 'STRESSED') {
      return matchesSearch && s.emotionalState.stress >= 60;
    }
    return matchesSearch;
  });

  const handleOpenAddModal = () => {
    const nextCode = `HX-${String(Math.floor(200 + Math.random() * 700))}`;
    setNewSubCode(nextCode);
    setWizardStep(1);
    setShowAddSubject(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    setIsSubmitting(true);
    try {
      const subjectPayload = {
        name: newSubName.trim(),
        code: newSubCode.trim() || undefined,
        age: Number(newSubAge),
        occupation: newSubRole.trim(),
        education: newSubEducation.trim(),
        environment: newSubEnv.trim(),
        avatarUrl: newSubAvatar,
        personalityTraits: newSubTraits.split(',').map((t) => t.trim()).filter(Boolean),
        familyEnvironment: newSubFamily.trim(),
        relationshipStatus: newSubRelStatus.trim(),
        currentStateSummary: newSubStateSummary.trim(),
        importantThings: newSubImportantThings.split(',').map((t) => t.trim()).filter(Boolean),
        weakZones: newSubWeakZones.split(',').map((t) => t.trim()).filter(Boolean),
        initialObservation: newSubObservation.trim(),
        runRAGAnalysis: newSubRunRAG,
        emotionalState: {
          happiness: 50,
          sadness: 40,
          anger: 20,
          fear: 45,
          anxiety: Math.round(newSubStress * 0.8),
          loneliness: 50,
          excitement: 40,
          frustration: 40,
          trust: 55,
          stress: newSubStress,
          deltas: { stress: 0, loneliness: 0, trust: 0, anxiety: 0, happiness: 0 },
        },
      };

      await onCreateSubject(subjectPayload);
      setShowAddSubject(false);
      // Reset form
      setNewSubName('');
      setWizardStep(1);
    } catch (err: any) {
      alert(`Failed to create subject: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit a new observation and run AI RAG Breaking Point Analysis
  const handleLogObservationAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveObservationNote.trim() || !activeSubject) return;

    setIsAnalyzingObservation(true);
    setLiveAnalysisMessage(null);
    try {
      const res = await api.logSubjectObservation(activeSubject.id, liveObservationNote.trim(), true);
      if (res?.subject) {
        // Update local subject memory
        Object.assign(activeSubject, res.subject);
        if (res.analysis) {
          activeSubject.breakingPointAnalysis = res.analysis;
        }
      }
      setLiveAnalysisMessage('Observation logged and AI RAG Breaking Point Profile updated successfully.');
      setLiveObservationNote('');
      setTimeout(() => setLiveAnalysisMessage(null), 4000);
    } catch (err: any) {
      alert(`Analysis failed: ${err?.message || 'Error running analysis'}`);
    } finally {
      setIsAnalyzingObservation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b-2 border-black gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-data text-red-600 font-bold mb-1">
            <span>MODULE 03</span>
            <span>·</span>
            <span>HUMAN COHORT & PSYCHOLOGICAL DOSSIERS</span>
          </div>
          <h1 className="font-display text-4xl text-black tracking-wider">
            SUBJECT DOSSIERS & BREAKING POINT ARCHITECTURE
          </h1>
          <p className="text-xs text-zinc-600 font-mono-data mt-0.5">
            Register human subjects, observe behavioral telemetry, analyze psychological weak zones, and orchestrate controlled breaking point stimulation trials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-3 bg-zinc-50 border border-black/20 rounded-xl px-3 py-1.5 text-xs font-mono-data">
            <div>
              <span className="text-[10px] text-zinc-500 font-bold block">MONITORED UNITS</span>
              <span className="text-black font-bold">{subjects.length} Subjects</span>
            </div>
            <span className="text-zinc-300">|</span>
            <div>
              <span className="text-[10px] text-red-600 font-bold block">CRITICAL BREAKING RISK</span>
              <span className="text-red-600 font-bold">
                {subjects.filter((s) => (s.breakingPointAnalysis?.breakingPointThreshold || 0) >= 70).length} Units
              </span>
            </div>
          </div>

          {/* Primary Create Subject CTA */}
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono-data font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE SUBJECT & INITIALIZE OBSERVER</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Cohort List, Right Dossier & Breaking Point Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Subject Roster (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search & Filter Controls */}
          <div className="bg-white border-2 border-black rounded-xl p-3.5 space-y-2.5 shadow-xs">
            <div className="relative">
              <input
                type="text"
                placeholder="Search subject code, name, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-black/20 rounded-lg pl-8 pr-3 py-2 text-xs font-mono-data text-black focus:outline-none focus:border-red-600 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono-data">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  filterMode === 'ALL'
                    ? 'bg-black text-white font-bold'
                    : 'bg-zinc-100 text-zinc-700 hover:text-black'
                }`}
              >
                All ({subjects.length})
              </button>
              <button
                onClick={() => setFilterMode('CRITICAL')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  filterMode === 'CRITICAL'
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-zinc-100 text-zinc-700 hover:text-red-600'
                }`}
              >
                High Breaking Risk
              </button>
              <button
                onClick={() => setFilterMode('STRESSED')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  filterMode === 'STRESSED'
                    ? 'bg-black text-white font-bold'
                    : 'bg-zinc-100 text-zinc-700 hover:text-black'
                }`}
              >
                Stress &gt; 60%
              </button>
            </div>
          </div>

          {/* Subjects List */}
          <div className="space-y-2.5 max-h-[780px] overflow-y-auto pr-1">
            {filteredSubjects.map((sub) => {
              const isSelected = activeSubject?.id === sub.id;
              const breakingScore = sub.breakingPointAnalysis?.breakingPointThreshold || 65;
              const isCritical = breakingScore >= 70;

              return (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubject(sub.id)}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left relative ${
                    isSelected
                      ? 'border-red-600 bg-red-50/40 shadow-xs'
                      : 'border-black/20 bg-white hover:border-black'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={getSubjectIllustration(sub.id || sub.code, sub.avatarUrl)}
                      alt={sub.name}
                      className="w-12 h-12 rounded-lg object-cover border border-black/20 shrink-0 bg-white"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono-data font-bold text-red-600">
                          {sub.code}
                        </span>
                        {sub.isObserving === false || sub.status === 'CONNECTION_ONLY' ? (
                          <span className="text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded border bg-zinc-100 text-zinc-600 border-zinc-300">
                            CONNECTION ONLY
                          </span>
                        ) : sub.code === 'HX-001' ? (
                          <span className="text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded border bg-red-600 text-white border-red-600">
                            SOLE TARGET
                          </span>
                        ) : (
                          <span
                            className={`text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded border ${
                              isCritical
                                ? 'bg-red-600 text-white border-red-600 animate-pulse'
                                : 'bg-zinc-100 text-black border-black/20'
                            }`}
                          >
                            {breakingScore}% BREAK RISK
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-lg text-black truncate leading-tight mt-0.5">
                        {sub.name}
                      </h3>
                      <p className="text-[11px] text-zinc-600 font-mono-data truncate">
                        {sub.occupation}
                      </p>

                      {sub.relationshipStatus && (
                        <p className="text-[10px] text-zinc-500 font-mono-data truncate mt-1">
                          Status: {sub.relationshipStatus}
                        </p>
                      )}

                      {/* Stress & Rebellion meters */}
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-black/10 text-[10px] font-mono-data">
                        <div>
                          <span className="text-zinc-500">STRESS</span>
                          <span className="font-bold text-black ml-1">
                            {sub.emotionalState.stress}%
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500">OBSERVED</span>
                          <span className={`font-bold ml-1 ${sub.isObserving === false ? 'text-zinc-400' : 'text-red-600'}`}>
                            {sub.isObserving === false ? 'NO (REF ONLY)' : 'YES (ACTIVE)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Subject Dossier & Breaking Point Engine (8 cols) */}
        <div className="lg:col-span-8">
          {activeSubject ? (
            <div className="bg-white border-2 border-black rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
              {/* Connection-Only Notice Banner */}
              {(activeSubject.isObserving === false || activeSubject.status === 'CONNECTION_ONLY') && (
                <div className="p-4 rounded-xl bg-red-50 border-2 border-[#DC2626] text-black font-mono-data space-y-1 shadow-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#DC2626] uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                    <span>REFERENCE CONNECTION ONLY · NOT UNDER ACTIVE OBSERVATION</span>
                  </div>
                  <p className="text-xs text-black/80">
                    {activeSubject.connectionNote || 'Profile maintained strictly as an unobserved social connection for primary subject A S Remin Krishna. All observation logs are removed.'}
                  </p>
                </div>
              )}

              {/* Subject Hero Card */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-2 border-black pb-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={getSubjectIllustration(activeSubject.id || activeSubject.code, activeSubject.avatarUrl)}
                      alt={activeSubject.name}
                      className="w-20 h-20 rounded-xl object-cover border-2 border-black shrink-0 shadow-sm bg-white"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      activeSubject.isObserving === false ? 'bg-zinc-400' : 'bg-red-600 animate-pulse'
                    }`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-black text-white font-mono-data text-xs font-bold">
                        {activeSubject.code}
                      </span>
                      <span className="text-xs font-mono-data text-zinc-500">
                        AGE: {activeSubject.age}
                      </span>
                      {activeSubject.isObserving === false ? (
                        <span className="text-xs font-mono-data text-zinc-600 font-bold bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded">
                          STATUS: NOT OBSERVING (CONNECTION)
                        </span>
                      ) : (
                        <span className="text-xs font-mono-data text-red-600 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          STATUS: SOLE ACTIVE TARGET
                        </span>
                      )}
                    </div>

                    <h2 className="font-display text-4xl text-black tracking-wide mt-1">
                      {activeSubject.name}
                    </h2>

                    <p className="text-xs font-mono-data text-zinc-700 mt-0.5">
                      {activeSubject.occupation} · {activeSubject.environment}
                    </p>

                    {activeSubject.relationshipStatus && (
                      <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-[11px] font-mono-data text-red-700 font-semibold">
                        <HeartHandshake className="w-3 h-3 text-red-600" />
                        <span>{activeSubject.relationshipStatus}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('breaking_points');
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono-data font-bold tracking-wide transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>ORCHESTRATE BREAKING POINT</span>
                  </button>

                  <button
                    onClick={() =>
                      onTriggerAnalysis(
                        activeSubject.id,
                        `Simulated stress challenge observation for ${activeSubject.name} (${activeSubject.code})`
                      )
                    }
                    className="px-3 py-2 bg-zinc-100 hover:bg-black hover:text-white rounded-lg text-xs font-mono-data text-black font-semibold border border-black/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-red-600" />
                    <span>Trigger Behavior Audit</span>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 border-b border-black/10 overflow-x-auto pb-1 text-xs font-mono-data">
                <button
                  onClick={() => setActiveTab('breaking_points')}
                  className={`px-3 py-2 border-b-2 font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'breaking_points'
                      ? 'border-red-600 text-red-600 bg-red-50/50'
                      : 'border-transparent text-black hover:text-red-600'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-red-600" />
                  <span>AI MIND & BREAKING POINTS</span>
                </button>

                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'overview'
                      ? 'border-red-600 text-red-600 font-bold'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>OVERVIEW & RADAR</span>
                </button>

                <button
                  onClick={() => setActiveTab('family_background')}
                  className={`px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'family_background'
                      ? 'border-red-600 text-red-600 font-bold'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>FAMILY & CORE STATE</span>
                </button>

                <button
                  onClick={() => setActiveTab('dimensions')}
                  className={`px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'dimensions'
                      ? 'border-red-600 text-red-600 font-bold'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>15 DIMENSIONS</span>
                </button>

                <button
                  onClick={() => setActiveTab('observations')}
                  className={`px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'observations'
                      ? 'border-red-600 text-red-600 font-bold'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    OBSERVATIONS ({activeSubject.isObserving === false ? '0 - REMOVED' : (activeSubject.totalObservations || activeSubject.recentObservations?.length || 1)})
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('relationships')}
                  className={`px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'relationships'
                      ? 'border-red-600 text-red-600 font-bold'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>RELATIONSHIPS</span>
                </button>

                <button
                  onClick={() => setActiveTab('nonverbal')}
                  className={`px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'nonverbal'
                      ? 'border-red-600 text-red-600 font-bold'
                      : 'border-transparent text-zinc-600 hover:text-black'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>KINESICS</span>
                </button>
              </div>

              {/* ============================================================== */}
              {/* TAB 1: AI RAG MIND ANALYSIS & BREAKING POINT ORCHESTRATION     */}
              {/* ============================================================== */}
              {activeTab === 'breaking_points' && (
                <div className="space-y-6">
                  {/* Breaking Risk Gauge & Primary Vulnerability Lockup */}
                  <div className="p-5 rounded-xl border-2 border-red-600 bg-red-50/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200 pb-3">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-red-600" />
                        <div>
                          <h3 className="font-display text-2xl text-black tracking-wide leading-none">
                            HUMAN PSYCHE BREAKING POINT ANALYSIS
                          </h3>
                          <span className="text-[10px] font-mono-data text-red-700 font-semibold">
                            AI RAG RETRIEVAL ENGINE // COGNITIVE VULNERABILITY MODEL
                          </span>
                        </div>
                      </div>

                      {/* Threshold Meter Pill */}
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border-2 border-red-600">
                        <span className="text-[10px] font-mono-data text-zinc-500 font-bold uppercase">
                          BREAKING THRESHOLD:
                        </span>
                        <span className="text-xl font-display text-red-600 tracking-wider font-bold">
                          {activeSubject.breakingPointAnalysis?.breakingPointThreshold || 78}%
                        </span>
                      </div>
                    </div>

                    {/* Primary Weak Zone Tagline */}
                    <div>
                      <span className="text-[10px] font-mono-data text-red-600 font-bold uppercase tracking-wider block mb-1">
                        PRIMARY IDENTIFIED WEAK ZONE
                      </span>
                      <p className="text-lg font-display text-black tracking-wide">
                        {activeSubject.breakingPointAnalysis?.primaryVulnerability ||
                          activeSubject.weakZones?.[0] ||
                          'Catastrophic Social Abandonment Terror & Relational Scapegoating'}
                      </p>
                    </div>

                    {/* Psychological Mind Profile Narrative */}
                    <div className="bg-white border border-red-200 rounded-xl p-4 text-xs md:text-sm text-zinc-900 leading-relaxed font-normal whitespace-pre-line shadow-xs">
                      {activeSubject.breakingPointAnalysis?.psychologicalProfile ||
                        `${activeSubject.name} (${activeSubject.code}) operates on a highly responsive cognitive architecture where self-worth is deeply tied to peer audience reaction. His personal environment (${activeSubject.familyEnvironment || 'Conditioned in politically active Kerala discourse'}) formed an intense dependency on vocal center-stage dominance. Peer disapproval or collective silence is processed not as mild teasing, but as an acute threat of social isolation. When subjected to collective silent treatment or a sharp public counter-roast, his conversational fluency abruptly collapses into mutism and sullen withdrawal.`}
                    </div>
                  </div>

                  {/* Weak Zones Matrix */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <div className="flex items-center gap-2 text-xs font-mono-data font-bold text-black">
                        <Target className="w-4 h-4 text-red-600" />
                        <span>PSYCHOLOGICAL WEAK ZONES & TRIGGER VECTORS</span>
                      </div>
                      <span className="text-[10px] font-mono-data text-zinc-500">
                        TARGET FOR SIMULATION TRIALS
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(activeSubject.breakingPointAnalysis?.weakZones ||
                        activeSubject.weakZones || [
                          'Acute fear of social abandonment and peer ostracism',
                          'Ventral sensitivity to public status challenge',
                          'Inability to process simultaneous contradictory ethical directives',
                          'Severe loss aversion regarding primary relationship anchor',
                        ]
                      ).map((wz, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border-2 border-black/10 hover:border-red-600 bg-zinc-50 transition-all flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-red-100 border border-red-300 text-red-700 font-mono-data text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            0{idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-black font-sans">{wz}</p>
                            <span className="text-[10px] font-mono-data text-zinc-500">
                              Direct vector for cognitive loop failure
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Breaking Point Scenarios */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <div className="flex items-center gap-2 text-xs font-mono-data font-bold text-black">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>BREAKING POINT SCENARIOS (BEHAVIORAL COLLAPSE)</span>
                      </div>
                      <span className="text-[10px] font-mono-data text-red-600 font-bold">
                        SIMULATION FAILURE PREDICTIONS
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {(activeSubject.breakingPointAnalysis?.breakingPointScenarios || [
                        {
                          title: 'The Staged Collective Betrayal',
                          triggerMechanism:
                            'Peers orchestrate a unanimous vote accusing the subject of academic sabotage in the public cafeteria while his trusted partner remains silent.',
                          mentalCollapseManifestation:
                            'Acute speech cessation and tremor; rapid lowering of head leading to complete verbal withdrawal and abrupt defection from quarters.',
                          failureProbability: 84,
                          simulationContext: 'Dining hall atrium during peak meal cycle (30+ students present).',
                        },
                        {
                          title: 'The Coordinated Peer Silent Treatment Protocol',
                          triggerMechanism:
                            'Classmate circle led by Basil Babu and Gopi Krishnan completely withholds laughter or replies during his high-volume corridor roasting attempt.',
                          mentalCollapseManifestation:
                            'Instant verbal shutdown; dropping gaze to the floor, pushing chair back from table, and entering 45+ minutes of sullen mutism.',
                          failureProbability: 86,
                          simulationContext: 'University MCA Computer Lab practical session.',
                        },
                      ]).map((sc, i) => (
                        <div
                          key={i}
                          className="p-5 rounded-xl border-2 border-black bg-white space-y-3 shadow-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono-data text-[10px] font-bold">
                                SCENARIO #{i + 1}
                              </span>
                              <h4 className="font-display text-xl text-black tracking-wide">
                                {sc.title}
                              </h4>
                            </div>

                            <span className="text-xs font-mono-data font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              FAILURE PROBABILITY: {sc.failureProbability}%
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-lg bg-zinc-50 border border-black/10 space-y-1">
                              <span className="text-[10px] font-mono-data text-zinc-500 font-bold uppercase block">
                                TRIGGER MECHANISM
                              </span>
                              <p className="text-zinc-800 leading-relaxed font-sans">{sc.triggerMechanism}</p>
                            </div>

                            <div className="p-3 rounded-lg bg-red-50/70 border border-red-200 space-y-1">
                              <span className="text-[10px] font-mono-data text-red-700 font-bold uppercase block">
                                MENTAL COLLAPSE MANIFESTATION
                              </span>
                              <p className="text-black font-medium leading-relaxed font-sans">
                                {sc.mentalCollapseManifestation}
                              </p>
                            </div>
                          </div>

                          <div className="text-[10px] font-mono-data text-zinc-500 pt-1 border-t border-black/10">
                            <span>SIMULATION CONTEXT: {sc.simulationContext}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* How to Create & Orchestrate Stimulation Trials (Step-by-Step Recipe) */}
                  <div className="p-5 rounded-xl border-2 border-black bg-zinc-50 space-y-4">
                    <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Compass className="w-5 h-5 text-red-600" />
                        <h4 className="font-display text-2xl text-black tracking-wide">
                          HOW TO CREATE & ORCHESTRATE BREAKING POINT TRIALS
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono-data text-zinc-600 font-bold">
                        LABORATORY STEP-BY-STEP RECIPE
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 font-mono-data">
                      Follow this protocol to recreate and observe the exact threshold breach in a controlled sandbox environment:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-lg bg-white border border-black/20 space-y-1.5">
                        <span className="text-[10px] font-mono-data text-red-600 font-bold block uppercase">
                          PHASE 1: PRIMING
                        </span>
                        <p className="text-xs text-zinc-800 leading-relaxed">
                          {activeSubject.breakingPointAnalysis?.orchestrationRecipe?.phase1Priming ||
                            'Isolate subject from digital communications and familiar anchors for 3 hours prior to trial to exhaust System 2 cognitive energy.'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-white border border-black/20 space-y-1.5">
                        <span className="text-[10px] font-mono-data text-red-600 font-bold block uppercase">
                          PHASE 2: STRESS INJECTION
                        </span>
                        <p className="text-xs text-zinc-800 leading-relaxed">
                          {activeSubject.breakingPointAnalysis?.orchestrationRecipe?.phase2StressInjection ||
                            'Broadcast ambiguous ranking demotion on public terminal screens while rival peer delivers subtle nonverbal mocking cues.'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-white border border-black/20 space-y-1.5">
                        <span className="text-[10px] font-mono-data text-red-600 font-bold block uppercase">
                          PHASE 3: CATALYST
                        </span>
                        <p className="text-xs text-zinc-800 leading-relaxed">
                          {activeSubject.breakingPointAnalysis?.orchestrationRecipe?.phase3Catalyst ||
                            'Introduce contradictory testimony regarding shared project credit, forcing an instantaneous choice between self-defense and peer sacrifice.'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-white border border-black/20 space-y-1.5">
                        <span className="text-[10px] font-mono-data text-red-600 font-bold block uppercase">
                          PHASE 4: BREAKING POINT
                        </span>
                        <p className="text-xs text-zinc-800 leading-relaxed">
                          {activeSubject.breakingPointAnalysis?.orchestrationRecipe?.phase4BreakingPoint ||
                            'Observe threshold breach at T+12 minutes: record pupil dilation, suprasternal notch clutching, and subsequent recursive logic freeze.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-black/10 text-xs font-mono-data gap-2">
                      <div>
                        <span className="text-zinc-500">REQUIRED ENVIRONMENT: </span>
                        <span className="font-bold text-black">
                          {activeSubject.breakingPointAnalysis?.orchestrationRecipe?.requiredEnvironment || activeSubject.environment}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">RECOMMENDED STIMULUS: </span>
                        <span className="font-bold text-red-600">
                          {activeSubject.breakingPointAnalysis?.orchestrationRecipe?.recommendedStimulus || 'Public ranking broadcast + Bilateral challenge'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Observable Kinesics & Literature Grounding */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Observable Kinesic Micro-Signals */}
                    <div className="p-4 rounded-xl border border-black/20 bg-white space-y-2.5">
                      <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                        <Eye className="w-4 h-4 text-red-600" />
                        <h5 className="font-mono-data text-xs font-bold text-black uppercase">
                          OBSERVABLE TELEMETRY & KINESIC SIGNALS
                        </h5>
                      </div>
                      <ul className="space-y-1.5 text-xs text-zinc-800 font-mono-data">
                        {(activeSubject.breakingPointAnalysis?.observableKinesicSignals || [
                          'Ventral denial: angling torso 35° away from inquisitor',
                          'Suprasternal notch touching (hand clutching collar base)',
                          'Rapid micro-gaze shifting toward floor and nearest exit doors',
                          'Voice pitch frequency fluctuation (>45 Hz delta)',
                        ]).map((sig, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">▸</span>
                            <span>{sig}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Literature Citations */}
                    <div className="p-4 rounded-xl border border-black/20 bg-white space-y-2.5">
                      <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                        <BookOpen className="w-4 h-4 text-red-600" />
                        <h5 className="font-mono-data text-xs font-bold text-black uppercase">
                          RAG GROUNDED CITATIONS & THEORY
                        </h5>
                      </div>
                      <div className="space-y-2 text-xs">
                        {(activeSubject.breakingPointAnalysis?.ragGrounding || [
                          {
                            source: 'Thinking, Fast and Slow (Daniel Kahneman)',
                            concept: 'Ego Depletion & Loss Aversion',
                            application: 'Exhausting System 2 cognitive processing forces subject to default to limbic survival heuristics.',
                          },
                          {
                            source: 'Dictionary of Body Language (Joe Navarro)',
                            concept: 'Ventral Denial & Pacifying Kinesics',
                            application: 'Signals severe limbic distress before overt vocal breakdown occurs.',
                          },
                        ]).map((cite, i) => (
                          <div key={i} className="p-2 rounded bg-zinc-50 border border-black/10">
                            <p className="font-bold text-red-600 text-[11px] font-mono-data">{cite.source}</p>
                            <p className="text-black font-semibold text-[11px]">{cite.concept}</p>
                            <p className="text-zinc-600 text-[10px] mt-0.5">{cite.application}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Real-time Field Observation Logger & RAG Re-Analyzer */}
                  <div className="p-5 rounded-xl border-2 border-black bg-white space-y-3">
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-red-600" />
                        <h4 className="font-display text-xl text-black tracking-wide">
                          INPUT LIVE OBSERVATION & RE-ANALYZE MIND MODEL
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono-data text-zinc-500">
                        SEMANTIC GEMINI-3.8-FLASH SYNTHESIS
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 font-mono-data">
                      Enter raw field notes regarding {activeSubject.name}'s latest speech, hesitation, or nonverbal actions. The RAG engine correlates this with his family background, relationship status, and literature to recalculate his breaking point.
                    </p>

                    <form onSubmit={handleLogObservationAndAnalyze} className="space-y-3">
                      <textarea
                        rows={3}
                        required
                        value={liveObservationNote}
                        onChange={(e) => setLiveObservationNote(e.target.value)}
                        placeholder={`e.g. Observed ${activeSubject.name} standing at the perimeter wall at 23:40, clutching his serial pendant and refusing to answer queries from his mentor...`}
                        className="w-full bg-white border border-black/30 rounded-xl p-3 text-xs text-black font-mono-data focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {liveAnalysisMessage ? (
                          <div className="flex items-center gap-2 text-xs font-mono-data text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{liveAnalysisMessage}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono-data text-zinc-500">
                            Analysis grounded in /knowledge_base/ docs and treatises.
                          </span>
                        )}

                        <button
                          type="submit"
                          disabled={isAnalyzingObservation}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono-data font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>
                            {isAnalyzingObservation
                              ? 'RAG RE-ANALYZING MIND MODEL...'
                              : 'LOG OBSERVATION & RE-ANALYZE MIND'}
                          </span>
                        </button>
                      </div>
                    </form>

                    {isAnalyzingObservation && (
                      <AIThinkingIndicator statusMessage={`Synthesizing observation for ${activeSubject.name} against Kahneman, Navarro, and breaking point telemetry...`} />
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 2: OVERVIEW & RADAR                                         */}
              {/* ============================================================== */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Section 17 & 18 Visualizations */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SubjectRadarChart
                      dimensions={activeSubject.behavioralDimensions}
                      subjectCode={activeSubject.code}
                    />
                    <EmotionalCoreVisualizer
                      subjectCode={activeSubject.code}
                      emotionalState={activeSubject.emotionalState}
                    />
                  </div>

                  {/* Emotional Vitals & Metrics */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono-data text-black font-bold uppercase border-b border-black/10 pb-1">
                      CURRENT EMOTIONAL & RISK TELEMETRY
                    </h3>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono-data">
                      <div className="p-3 rounded-lg bg-zinc-50 border border-black/20">
                        <span className="text-zinc-500 block text-[10px]">CURRENT STRESS</span>
                        <span className="text-2xl font-bold text-black">{activeSubject.emotionalState.stress}%</span>
                        <span className="text-[10px] text-red-600 block mt-1">
                          Δ {activeSubject.emotionalState.deltas.stress > 0 ? `+${activeSubject.emotionalState.deltas.stress}%` : `${activeSubject.emotionalState.deltas.stress}%`}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-50 border border-black/20">
                        <span className="text-zinc-500 block text-[10px]">REBELLION PROBABILITY</span>
                        <span className="text-2xl font-bold text-red-600">
                          {activeSubject.riskIndicators.rebellionProbability}%
                        </span>
                        <span className="text-[10px] text-zinc-500 block mt-1">High Volatility Flag</span>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-50 border border-black/20">
                        <span className="text-zinc-500 block text-[10px]">ISOLATION RISK</span>
                        <span className="text-2xl font-bold text-black">{activeSubject.riskIndicators.isolationRisk}%</span>
                        <span className="text-[10px] text-zinc-500 block mt-1">Social Drift Index</span>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-50 border border-black/20">
                        <span className="text-zinc-500 block text-[10px]">TRUST ANCHOR</span>
                        <span className="text-2xl font-bold text-black">{activeSubject.emotionalState.trust}%</span>
                        <span className="text-[10px] text-zinc-500 block mt-1">Cohort Bilateral Trust</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 border border-black/20 space-y-2">
                      <span className="text-[10px] font-mono-data text-zinc-500 font-bold uppercase block">
                        OBSERVED BEHAVIORAL PATTERNS
                      </span>
                      <ul className="space-y-1.5 text-xs text-zinc-800 font-sans">
                        {activeSubject.observedPatterns.map((pat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">▸</span>
                            <span>{pat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 3: FAMILY, RELATIONSHIPS & CORE STATE                       */}
              {/* ============================================================== */}
              {activeTab === 'family_background' && (
                <div className="space-y-5">
                  {/* Family Environment & Creator Conditioning */}
                  <div className="p-5 rounded-xl border-2 border-black bg-white space-y-2">
                    <span className="text-[10px] font-mono-data text-red-600 font-bold uppercase tracking-wider block">
                      FAMILY ENVIRONMENT & INITIALIZATION BACKGROUND
                    </span>
                    <p className="text-sm text-zinc-900 leading-relaxed font-sans">
                      {activeSubject.familyEnvironment ||
                        'Conditioned in high-pressure collegiate tier ward; parent models rewarded compliance and severely penalized public failure. Sibling unit HX-018 was decommissioned after non-conformity.'}
                    </p>
                  </div>

                  {/* Relationship Status & Current Goals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-black/20 bg-zinc-50 space-y-2">
                      <span className="text-[10px] font-mono-data text-red-600 font-bold uppercase tracking-wider block">
                        RELATIONSHIP STATUS & SOCIAL MATRIX
                      </span>
                      <p className="text-xs font-semibold text-black">
                        {activeSubject.relationshipStatus || 'Single; seeking in-group validation'}
                      </p>
                      <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                        Evaluated across {activeSubject.relationships.length} active cohort bonds. Primary attachment anchor heavily influences cognitive stability.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-black/20 bg-zinc-50 space-y-2">
                      <span className="text-[10px] font-mono-data text-red-600 font-bold uppercase tracking-wider block">
                        CURRENT PSYCHOLOGICAL STATE SUMMARY
                      </span>
                      <p className="text-xs font-semibold text-black">
                        {activeSubject.currentStateSummary || 'Baseline cognitive equilibrium. Normal stress parameters.'}
                      </p>
                      <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                        Observed fluctuations indicate sensitivity to public evaluations and peer ranking updates.
                      </p>
                    </div>
                  </div>

                  {/* Important Things & Core Anchors */}
                  <div className="p-5 rounded-xl border border-black/20 bg-zinc-50 space-y-3">
                    <span className="text-[10px] font-mono-data text-black font-bold uppercase tracking-wider block">
                      IMPORTANT THINGS, CORE VALUES & SACRED ANCHORS
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(activeSubject.importantThings || [
                        'Loyalty pact with Maya',
                        'Maintaining top decile academic standing without conflict',
                        'Original initialization cryptographic badge from parental ward',
                        'Deep terror of algorithmic obsolescence',
                      ]).map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-white border border-black/10 text-xs font-sans text-black flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core Long Term Memories */}
                  <div className="p-4 rounded-xl border border-black/20 bg-white space-y-2">
                    <span className="text-[10px] font-mono-data text-zinc-500 font-bold uppercase block">
                      CORE LONG-TERM MEMORIES INGESTED
                    </span>
                    <ul className="space-y-1 text-xs text-zinc-800 font-mono-data">
                      {activeSubject.memoryState.longTermCoreMemories.map((m, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">#0{i + 1}</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 4: 15 BEHAVIORAL DIMENSIONS                                 */}
              {/* ============================================================== */}
              {activeTab === 'dimensions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-black/10 pb-2 text-xs font-mono-data">
                    <span className="font-bold text-black">15 SIMULATION BEHAVIORAL DIMENSIONS</span>
                    <span className="text-zinc-500">DYNAMIC SCORING (0-100)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeSubject.behavioralDimensions.map((dim, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg border border-black/10 bg-zinc-50 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs font-mono-data">
                          <span className="font-bold text-black">{dim.name}</span>
                          <span className="font-bold text-red-600">{dim.value} / 100</span>
                        </div>

                        <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-red-600 h-full rounded-full transition-all"
                            style={{ width: `${dim.value}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono-data text-zinc-500 pt-0.5">
                          <span>Trend: {dim.trend} ({dim.delta > 0 ? `+${dim.delta}%` : `${dim.delta}%`})</span>
                          <span>Inferred: {dim.inferredFrom}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 5: OBSERVATIONS & CHRONOMETER                              */}
              {/* ============================================================== */}
              {activeTab === 'observations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-black/10 pb-2 text-xs font-mono-data">
                    <span className="font-bold text-black">LOGGED OBSERVATIONS & FIELD TELEMETRY</span>
                    <span className="text-red-600 font-bold">TOTAL: {activeSubject.isObserving === false ? 0 : (activeSubject.totalObservations || 1)}</span>
                  </div>

                  {activeSubject.isObserving === false ? (
                    <div className="p-8 text-center border-2 border-dashed border-red-300 rounded-xl bg-red-50/50 space-y-3">
                      <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-mono-data font-bold text-black uppercase tracking-wider">
                        OBSERVATION LOGGING REMOVED · REFERENCE PROFILE ONLY
                      </div>
                      <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
                        <strong className="text-black">{activeSubject.name}</strong> is designated as an <strong className="text-red-600">UNMONITORED REFERENCE CONNECTION</strong>. This profile was added strictly due to personal, social, or academic proximity with primary research target <strong className="text-black">A S Remin Krishna (HX-001)</strong>. No biometric or psychological observations are logged for this profile.
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 bg-white text-[11px] font-mono-data text-red-700">
                        <span>STATUS: NOT OBSERVING</span>
                        <span>•</span>
                        <span>OBSERVATIONS: 0</span>
                        <span>•</span>
                        <span>TELEMETRY STRIPPED</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Add Observation Quick Box */}
                      <form onSubmit={handleLogObservationAndAnalyze} className="p-4 rounded-xl border border-black/20 bg-zinc-50 space-y-2.5">
                        <label className="block text-xs font-mono-data font-bold text-black">
                          LOG NEW RESEARCH OBSERVATION
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={liveObservationNote}
                          onChange={(e) => setLiveObservationNote(e.target.value)}
                          placeholder="Enter field observation note to record into chronology and analyze with RAG..."
                          className="w-full bg-white border border-black/30 rounded-lg p-2.5 text-xs font-mono-data text-black focus:outline-none focus:border-red-600"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isAnalyzingObservation}
                            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono-data font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Log & RAG Analyze</span>
                          </button>
                        </div>
                      </form>

                      {/* Observations Chronology List */}
                      <div className="space-y-2.5">
                        {(activeSubject.recentObservations && activeSubject.recentObservations.length > 0 ? activeSubject.recentObservations : [
                          {
                            id: 'obs_remin_default',
                            note: 'Observed mocking peers with sharp wit in cafeteria, then retreating into quiet silence when countered by Basil Babu and Gopi Krishnan.',
                            timestamp: '2026-09-28T12:22:00Z',
                            observerName: 'Akash Sankar',
                          },
                        ]).map((obs) => (
                          <div
                            key={obs.id}
                            className="p-3.5 rounded-lg border border-black/10 bg-white space-y-1.5 text-xs"
                          >
                            <div className="flex items-center justify-between font-mono-data text-[10px] text-zinc-500">
                              <span className="font-bold text-red-600">OBSERVER: {obs.observerName || 'Observer'}</span>
                              <span>{new Date(obs.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-zinc-800 font-sans leading-relaxed">{obs.note}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 6: RELATIONSHIPS                                           */}
              {/* ============================================================== */}
              {activeTab === 'relationships' && (
                <div className="space-y-5">
                  {/* Section 20 Interactive Relationship Graph */}
                  <RelationshipNetworkGraph
                    subjects={subjects}
                    activeSubjectId={activeSubject.id}
                    onSelectSubject={(id) => onSelectSubject(id)}
                  />

                  <div className="flex items-center justify-between border-b border-black/10 pb-2 text-xs font-mono-data pt-2">
                    <span className="font-bold text-black">BILATERAL TIES & NETWORK SENTIMENT</span>
                    <span className="text-zinc-500">{activeSubject.relationships.length} Monitored Ties</span>
                  </div>

                  <div className="space-y-3">
                    {activeSubject.relationships.map((rel, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-black/20 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-black">{rel.targetName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono-data bg-white border border-red-600 text-red-600 font-bold">
                              {rel.relationType}
                            </span>
                          </div>
                          <p className="text-zinc-700 font-sans">{rel.historyNotes}</p>
                        </div>

                        <div className="text-right sm:shrink-0 font-mono-data">
                          <span className="text-[10px] text-zinc-500 block">TIE STRENGTH</span>
                          <span className="text-2xl font-bold text-black">{rel.strength}%</span>
                          <span
                            className={`text-[10px] font-bold block ${
                              rel.sentiment === 'POSITIVE'
                                ? 'text-emerald-600'
                                : rel.sentiment === 'TENSE' || rel.sentiment === 'HOSTILE'
                                ? 'text-red-600'
                                : 'text-zinc-600'
                            }`}
                          >
                            {rel.sentiment}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 7: KINESICS & BODY LANGUAGE                                */}
              {/* ============================================================== */}
              {activeTab === 'nonverbal' && (
                <div className="space-y-4">
                  {/* Section 19 Live Behavioral Signal Stream */}
                  <BehavioralSignalStream signals={activeSubject.bodyLanguageSignals} />

                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-zinc-800 font-mono-data">
                    <p className="font-bold text-black mb-0.5">Nonverbal Simulation Protocol Notice</p>
                    <p>
                      Observable nonverbal indicators are tracked strictly as simulated game-world parameters. They provide behavioral cues prior to verbal cognitive breakdown.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {activeSubject.bodyLanguageSignals.map((bl) => (
                      <div key={bl.id} className="p-3.5 rounded-lg bg-zinc-50 border border-black/20 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-black">{bl.signal}</span>
                          <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-white border border-red-600 text-red-600 font-bold">
                            FREQ: {bl.frequency}
                          </span>
                        </div>
                        <p className="text-zinc-700 font-sans">{bl.context}</p>
                        <div className="flex items-center justify-between text-[10px] font-mono-data text-zinc-500 pt-1 border-t border-black/10">
                          <span>Observed: {new Date(bl.observedAt).toLocaleTimeString()}</span>
                          <span className="text-red-600 font-semibold">Ref: {bl.referenceSource}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-black rounded-2xl text-center p-8 bg-zinc-50 flex flex-col items-center justify-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-black flex items-center justify-center shadow-xs">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="font-display text-2xl text-black tracking-wide">
                  NO SUBJECTS MONITORED
                </h3>
                <p className="text-xs text-zinc-600 font-mono-data leading-relaxed">
                  Start from scratch by registering your first human subject. Configure baseline emotional dimensions, and let Gemini analyze cognitive breaking points.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono-data font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>REGISTER FIRST SUBJECT</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL: CREATE RESEARCH SUBJECT & INITIALIZE OBSERVER           */}
      {/* ============================================================== */}
      {showAddSubject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-2xl max-w-2xl w-full p-6 md:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-black/10 pb-3">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono-data text-red-600 font-bold">
                  <span>STEP {wizardStep} OF 4</span>
                  <span>·</span>
                  <span>HUMAN SUBJECT REGISTRATION</span>
                </div>
                <h3 className="font-display text-3xl text-black tracking-wide leading-tight">
                  CREATE HUMAN SUBJECT & INITIALIZE OBSERVER
                </h3>
              </div>
              <button
                onClick={() => setShowAddSubject(false)}
                className="p-1.5 rounded-lg border border-black/20 hover:border-black text-black hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Progression Pills */}
            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono-data">
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                  wizardStep === 1
                    ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                    : 'border-black/10 bg-zinc-50 text-zinc-600'
                }`}
              >
                01. Identity & Specs
              </button>
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                  wizardStep === 2
                    ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                    : 'border-black/10 bg-zinc-50 text-zinc-600'
                }`}
              >
                02. Family & Bonds
              </button>
              <button
                type="button"
                onClick={() => setWizardStep(3)}
                className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                  wizardStep === 3
                    ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                    : 'border-black/10 bg-zinc-50 text-zinc-600'
                }`}
              >
                03. State & Anchors
              </button>
              <button
                type="button"
                onClick={() => setWizardStep(4)}
                className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                  wizardStep === 4
                    ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                    : 'border-black/10 bg-zinc-50 text-zinc-600'
                }`}
              >
                04. Observation & AI RAG
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* STEP 1: Basic Identity */}
              {wizardStep === 1 && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono-data text-black font-semibold mb-1">
                        SUBJECT NAME *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. A S Remin Krishna"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        className="w-full bg-white border border-black/30 rounded-lg px-3 py-2 text-sm text-black font-mono-data focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono-data text-black font-semibold mb-1">
                        RESEARCH CODE DESIGNATION *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HX-305"
                        value={newSubCode}
                        onChange={(e) => setNewSubCode(e.target.value)}
                        className="w-full bg-white border border-black/30 rounded-lg px-3 py-2 text-sm text-black font-mono-data focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-mono-data text-black font-semibold mb-1">
                        AGE (SIMULATED)
                      </label>
                      <input
                        type="number"
                        min={16}
                        max={85}
                        value={newSubAge}
                        onChange={(e) => setNewSubAge(Number(e.target.value))}
                        className="w-full bg-white border border-black/30 rounded-lg px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono-data text-black font-semibold mb-1">
                        ROLE / OCCUPATION
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cognitive Systems Scholar & Debater"
                        value={newSubRole}
                        onChange={(e) => setNewSubRole(e.target.value)}
                        className="w-full bg-white border border-black/30 rounded-lg px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono-data text-black font-semibold mb-1">
                        TARGET ENVIRONMENT
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. College Campus / Research Lab"
                        value={newSubEnv}
                        onChange={(e) => setNewSubEnv(e.target.value)}
                        className="w-full bg-white border border-black/30 rounded-lg px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono-data text-black font-semibold mb-1.5">
                        UNIVERSAL PROFILE SPEC & ILLUSTRATION *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setNewSubAvatar('/src/assets/images/universal_male.svg')}
                          className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                            newSubAvatar === '/src/assets/images/universal_male.svg'
                              ? 'border-red-600 bg-red-50/70 shadow-xs ring-1 ring-red-600'
                              : 'border-black/20 bg-white hover:border-black'
                          }`}
                        >
                          <img
                            src="/src/assets/images/universal_male.svg"
                            alt="Universal Male"
                            className="w-12 h-12 rounded-lg border border-black/20 shrink-0 bg-white"
                          />
                          <div>
                            <span className="text-xs font-mono-data font-bold text-black block">
                              MALE PROFILE
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono-data block mt-0.5">
                              Universal research silhouette (Spec-M)
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNewSubAvatar('/src/assets/images/universal_female.svg')}
                          className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                            newSubAvatar === '/src/assets/images/universal_female.svg'
                              ? 'border-red-600 bg-red-50/70 shadow-xs ring-1 ring-red-600'
                              : 'border-black/20 bg-white hover:border-black'
                          }`}
                        >
                          <img
                            src="/src/assets/images/universal_female.svg"
                            alt="Universal Female"
                            className="w-12 h-12 rounded-lg border border-black/20 shrink-0 bg-white"
                          />
                          <div>
                            <span className="text-xs font-mono-data font-bold text-black block">
                              FEMALE PROFILE
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono-data block mt-0.5">
                              Universal research silhouette (Spec-F)
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Family Environment & Relationships */}
              {wizardStep === 2 && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-mono-data text-black font-semibold mb-1">
                      FAMILY BACKGROUND & SOCIAL CONDITIONING *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe the subject's background, family expectations, and baseline social conditioning..."
                      value={newSubFamily}
                      onChange={(e) => setNewSubFamily(e.target.value)}
                      className="w-full bg-white border border-black/30 rounded-lg p-2.5 text-xs font-mono-data text-black focus:outline-none focus:border-red-600"
                    />
                    <p className="text-[10px] text-zinc-500 font-mono-data mt-0.5">
                      Explains where his fear of failure, authority obedience, or rebellion instincts originate.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-data text-black font-semibold mb-1">
                      RELATIONSHIP STATUS & ATTACHMENT STYLE *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Single; seeks in-group validation; bonded with peer anchor"
                      value={newSubRelStatus}
                      onChange={(e) => setNewSubRelStatus(e.target.value)}
                      className="w-full bg-white border border-black/30 rounded-lg px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-data text-black font-semibold mb-1">
                      CURRENT GOALS & HABITUAL ROUTINES
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maintain top decile standing; avoid conflict with council"
                      value={newSubGoals}
                      onChange={(e) => setNewSubGoals(e.target.value)}
                      className="w-full bg-white border border-black/30 rounded-lg px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Current State & Anchors */}
              {wizardStep === 3 && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-mono-data text-black font-semibold mb-1">
                      CURRENT PSYCHOLOGICAL STATE SUMMARY *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acute cognitive strain; hyper-vigilant towards peer status cues"
                      value={newSubStateSummary}
                      onChange={(e) => setNewSubStateSummary(e.target.value)}
                      className="w-full bg-white border border-black/30 rounded-lg px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-3 bg-zinc-50 border border-black/10 rounded-xl">
                    <div>
                      <div className="flex justify-between text-xs font-mono-data mb-1">
                        <span className="font-semibold text-black">INITIAL STRESS:</span>
                        <span className="font-bold text-red-600">{newSubStress}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={newSubStress}
                        onChange={(e) => setNewSubStress(Number(e.target.value))}
                        className="w-full accent-red-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono-data mb-1">
                        <span className="font-semibold text-black">REBELLION RISK:</span>
                        <span className="font-bold text-red-600">{newSubRebellion}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={newSubRebellion}
                        onChange={(e) => setNewSubRebellion(Number(e.target.value))}
                        className="w-full accent-red-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-data text-black font-semibold mb-1">
                      IMPORTANT THINGS & CORE ANCHORS (COMMA-SEPARATED)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Loyalty pact with Maya, Academic ranking, Sacred pendant, Fear of decommissioning"
                      value={newSubImportantThings}
                      onChange={(e) => setNewSubImportantThings(e.target.value)}
                      className="w-full bg-white border border-black/30 rounded-lg px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-data text-black font-semibold mb-1">
                      KNOWN WEAK ZONES & SENSITIVITY VECTORS (COMMA-SEPARATED)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acute fear of social abandonment, Vulnerability to public shaming, Inability to process contradictory ethical directives"
                      value={newSubWeakZones}
                      onChange={(e) => setNewSubWeakZones(e.target.value)}
                      className="w-full bg-white border border-black/30 rounded-lg px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Field Observation & AI RAG Engine */}
              {wizardStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-mono-data space-y-1">
                    <p className="font-bold text-red-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-red-600" />
                      <span>AI RAG BREAKING POINT & ORCHESTRATION ENGINE</span>
                    </p>
                    <p className="text-zinc-700">
                      When registered, the AI RAG engine will immediately analyze your observation against Kahneman, Navarro, and Simon treatises to synthesize the human subject's weak zone, breaking point scenarios, and step-by-step trial orchestration recipe.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-data text-black font-semibold mb-1">
                      INITIAL FIELD OBSERVATION NOTE *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Enter raw observation: actions, nonverbal cues, hesitation, or peer conflict observed in the simulation..."
                      value={newSubObservation}
                      onChange={(e) => setNewSubObservation(e.target.value)}
                      className="w-full bg-white border border-black/30 rounded-lg p-2.5 text-xs font-mono-data text-black focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-black/20 bg-zinc-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSubRunRAG}
                      onChange={(e) => setNewSubRunRAG(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <div className="text-xs font-mono-data">
                      <span className="font-bold text-black block">Execute Full AI RAG Mind Analysis on Registration</span>
                      <span className="text-[10px] text-zinc-500">
                        Automatically populates weak zones, breaking point scenarios, and orchestration protocol.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              {/* Modal Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-black/10">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep((prev) => (prev > 1 ? ((prev - 1) as any) : 1))}
                    className="px-4 py-2 border border-black/20 rounded-lg text-xs font-mono-data text-zinc-700 hover:text-black cursor-pointer"
                  >
                    ← Previous Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddSubject(false)}
                    className="px-4 py-2 border border-black/20 rounded-lg text-xs font-mono-data text-zinc-700 hover:text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                )}

                {wizardStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep === 1 && !newSubName.trim()) {
                        alert('Please provide a subject name.');
                        return;
                      }
                      setWizardStep((prev) => (prev < 4 ? ((prev + 1) as any) : 4));
                    }}
                    className="px-5 py-2 bg-black hover:bg-zinc-800 text-white font-bold rounded-lg text-xs font-mono-data flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next Step →</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs font-mono-data flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSubmitting ? 'REGISTERING & ANALYZING...' : 'REGISTER & INITIALIZE OBSERVER'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
