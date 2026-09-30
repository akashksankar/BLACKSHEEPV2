/**
 * BLACK S.H.E.E.P. - Module 02: Research Cases Dossier
 * Fully aligned with Extreme UI / Motion / Visual Experience Directive
 * Sections 14, 15, 34, 52 (Case Detail Experience), 53 (Research Note Experience)
 */

import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Users,
  FlaskConical,
  X,
  FileText,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ResearchCase, Subject } from '../../types';
import { HUDPanel } from '../common/HUDPanel';
import { useAuth } from '../../context/AuthContext';

interface CasesModuleProps {
  cases: ResearchCase[];
  subjects: Subject[];
  onCreateCase: (caseData: any) => Promise<void>;
  onSelectCaseDetail: (caseId: string) => void;
  selectedCaseId?: string | null;
}

const ENVIRONMENTS = [
  'College',
  'Workplace',
  'Family',
  'Neighborhood',
  'Public Space',
  'Social Event',
  'Online Environment',
  'Controlled Laboratory',
  'Custom',
];

interface CaseNote {
  id: string;
  caseId: string;
  author: string;
  timestamp: string;
  content: string;
  classification: 'OBSERVATION' | 'HYPOTHESIS' | 'CORRELATION';
}

export const CasesModule: React.FC<CasesModuleProps> = ({
  cases,
  subjects,
  onCreateCase,
  onSelectCaseDetail,
  selectedCaseId,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnv, setSelectedEnv] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Progressive construction state for Section 52
  const [revealStep, setRevealStep] = useState(0);

  // Research Notes state for Section 53
  const [notes, setNotes] = useState<CaseNote[]>([
    {
      id: 'note-01',
      caseId: cases[0]?.id || 'case-01',
      author: 'Akash Sankar (System Architect)',
      timestamp: '29 SEP 2026 14:22:09',
      content: 'Subject HX-071 exhibited elevated cortisol proxy under peer confrontation.',
      classification: 'OBSERVATION',
    },
  ]);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteClass, setNewNoteClass] = useState<'OBSERVATION' | 'HYPOTHESIS' | 'CORRELATION'>('OBSERVATION');
  const [lastCapturedNote, setLastCapturedNote] = useState<CaseNote | null>(null);

  // New Case Form State
  const [formData, setFormData] = useState({
    name: '',
    environment: 'College',
    objective: '',
    description: '',
    researchQuestion: '',
    initialHypothesis: '',
    variablesStr: 'Social Pressure, Emotional Reactivity, Authority Presence',
    tagsStr: 'Conformity, Simulation Trial, Peer Stress',
  });

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.objective.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnv = selectedEnv === 'ALL' || c.environment === selectedEnv;
    return matchesSearch && matchesEnv;
  });

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Section 52: Progressive construction sequence whenever activeCase changes
  useEffect(() => {
    setRevealStep(0);
    const intervals = [100, 200, 320, 450, 600, 750, 900];
    const timers = intervals.map((delay, index) =>
      setTimeout(() => {
        setRevealStep(index + 1);
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [activeCase?.id]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.objective) return;

    setIsSubmitting(true);
    try {
      await onCreateCase({
        name: formData.name,
        environment: formData.environment,
        objective: formData.objective,
        description: formData.description,
        researchQuestion: formData.researchQuestion,
        initialHypothesis: formData.initialHypothesis,
        variables: formData.variablesStr.split(',').map((s) => s.trim()).filter(Boolean),
        tags: formData.tagsStr.split(',').map((s) => s.trim()).filter(Boolean),
        assignedSubjectIds: subjects.length > 0 ? subjects.map((s) => s.id) : [],
      });
      setShowCreateModal(false);
      setFormData({
        name: '',
        environment: 'College',
        objective: '',
        description: '',
        researchQuestion: '',
        initialHypothesis: '',
        variablesStr: 'Social Pressure, Emotional Reactivity, Authority Presence',
        tagsStr: 'Conformity, Simulation Trial, Peer Stress',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptureNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeCase) return;

    const newNote: CaseNote = {
      id: `note-${Date.now()}`,
      caseId: activeCase.id,
      author: user?.name || 'Authorized Investigator',
      timestamp: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ' ' + new Date().toLocaleTimeString('en-GB'),
      content: newNoteText.trim(),
      classification: newNoteClass,
    };

    setNotes((prev) => [newNote, ...prev]);
    setLastCapturedNote(newNote);
    setNewNoteText('');

    setTimeout(() => {
      setLastCapturedNote(null);
    }, 4000);
  };

  const activeNotes = notes.filter((n) => n.caseId === activeCase?.id);

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-black/10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-data text-[#DC2626] font-bold tracking-widest uppercase">
            <span>MODULE 02</span>
            <span className="text-zinc-400">·</span>
            <span>INVESTIGATION REPOSITORY</span>
            <span className="text-zinc-400">·</span>
            <span className="text-zinc-700">CLASSIFIED LEVEL 5</span>
          </div>
          <h1 className="font-display text-4xl text-black tracking-wider mt-1">
            RESEARCH CASES
          </h1>
          <p className="text-xs text-zinc-600 font-mono-data mt-0.5">
            The core unit of behavioral inquiry. Open-world parameters, boundary variables, and longitudinal human tracking.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xs text-xs font-mono-data font-bold tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>INITIALIZE NEW CASE</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3 rounded-xs border border-black/15 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dossier by case ID, title, or core objective..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-black/15 rounded pl-9 pr-3.5 py-1.5 text-xs text-black placeholder:text-zinc-400 font-mono-data focus:outline-none focus:border-[#DC2626] focus:bg-white"
          />
        </div>

        {/* Environment Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedEnv('ALL')}
            className={`px-3 py-1 rounded-xs text-[11px] font-mono-data whitespace-nowrap transition-colors cursor-pointer ${
              selectedEnv === 'ALL'
                ? 'bg-[#DC2626] text-white font-bold'
                : 'text-zinc-600 hover:text-black bg-zinc-100 border border-zinc-200'
            }`}
          >
            All Environments
          </button>
          {['College', 'Workplace', 'Public Space', 'Social Event'].map((env) => (
            <button
              key={env}
              onClick={() => setSelectedEnv(env)}
              className={`px-3 py-1 rounded-xs text-[11px] font-mono-data whitespace-nowrap transition-colors cursor-pointer ${
                selectedEnv === env
                  ? 'bg-[#DC2626] text-white font-bold'
                  : 'text-zinc-600 hover:text-black bg-zinc-100 border border-zinc-200'
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cases Listing (1 Col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-data text-zinc-500 px-1">
            <span>REGISTERED CASES ({filteredCases.length})</span>
            <span>ORD: RECENT</span>
          </div>

          {filteredCases.length === 0 ? (
            <div className="p-6 rounded border border-dashed border-black/20 text-center bg-zinc-50 space-y-2">
              <p className="text-xs font-mono-data text-black font-bold">NO INVESTIGATIONS MATCHED</p>
              <p className="text-[11px] text-zinc-600 font-mono-data">Create a new case to initialize observation.</p>
            </div>
          ) : (
            filteredCases.map((c) => {
              const isSelected = activeCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCaseDetail(c.id)}
                  className={`p-4 rounded-xs border transition-all cursor-pointer relative overflow-hidden shadow-xs ${
                    isSelected
                      ? 'border-[#DC2626] bg-red-50/50'
                      : 'border-black/15 bg-white hover:border-[#DC2626]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#DC2626]" />
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono-data text-[#DC2626] font-bold tracking-wider">{c.code}</span>
                    <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-black font-semibold">
                      {c.environment}
                    </span>
                  </div>

                  <h3 className="font-display text-xl text-black tracking-wide mb-1 leading-snug">
                    {c.name}
                  </h3>
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-3">
                    {c.objective}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 border-t border-black/10 text-[11px] font-mono-data text-zinc-500">
                    <span>SUBJECTS: {c.assignedSubjectIds.length}</span>
                    <span>TRIALS: {c.experimentCount}</span>
                    <span className="text-[#DC2626] font-bold">ANOMALIES: {c.anomalyCount}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Case Deep Dossier (2 Cols) */}
        <div className="lg:col-span-2">
          {activeCase ? (
            <HUDPanel
              title={`INVESTIGATION DOSSIER // ${activeCase.code}`}
              subtitle="CLASSIFIED PROTOCOL"
              variant="amber"
              className="space-y-6"
            >
              {/* Section 52 Step 1 & 2: Identifier & Title */}
              <div
                className={`transition-all duration-300 ${
                  revealStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono-data text-xs px-2 py-0.5 rounded bg-[#DC2626] text-white font-bold">
                        {activeCase.code}
                      </span>
                      <span className="font-mono-data text-xs text-zinc-600">
                        ENV: <span className="text-black font-bold">{activeCase.environment}</span>
                      </span>
                      <span className="text-zinc-400">·</span>
                      <span className="text-xs font-mono-data text-[#DC2626] font-bold">
                        STATUS: {activeCase.status}
                      </span>
                    </div>
                    <h2 className="font-display text-3xl text-black tracking-wider">
                      {activeCase.name}
                    </h2>
                  </div>

                  <div className="text-right text-[11px] font-mono-data text-zinc-500">
                    <div>UPDATED: {new Date(activeCase.updatedAt).toLocaleDateString()}</div>
                    <div>INITIALIZED: {new Date(activeCase.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Section 52 Step 3: Objective & Working Hypotheses */}
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ${
                  revealStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <div className="p-4 rounded-lg bg-zinc-50 border border-black/10">
                  <span className="text-[10px] font-mono-data text-red-600 font-bold uppercase tracking-wider block mb-1">
                    PRIMARY RESEARCH QUESTION
                  </span>
                  <p className="text-xs text-zinc-800 leading-relaxed">
                    "{activeCase.researchQuestion || activeCase.objective}"
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-50 border border-black/10">
                  <span className="text-[10px] font-mono-data text-red-600 font-bold uppercase tracking-wider block mb-1">
                    WORKING SIMULATION HYPOTHESIS
                  </span>
                  <p className="text-xs text-zinc-800 leading-relaxed font-medium">
                    "{activeCase.initialHypothesis || 'Testing human behavioral threshold under variable social pressure.'}"
                  </p>
                </div>
              </div>

              {/* Section 52 Step 4: Active Variables */}
              <div
                className={`space-y-2 transition-all duration-300 ${
                  revealStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <span className="text-xs font-mono-data text-zinc-600 font-bold block tracking-wider">
                  CONTROLLED SIMULATION VARIABLES
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeCase.variables.map((v, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded text-xs font-mono-data bg-zinc-100 border border-black/15 text-black font-semibold"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Section 52 Step 5: Assigned Subjects */}
              <div
                className={`space-y-3 pt-2 transition-all duration-300 ${
                  revealStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <span className="text-xs font-mono-data text-zinc-700 font-bold block tracking-wider">
                  ASSIGNED HUMAN COHORT ({activeCase.assignedSubjectIds.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {subjects
                    .filter((s) => activeCase.assignedSubjectIds.includes(s.id))
                    .map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-xs border border-black/15 bg-white flex items-center gap-3 hover:border-[#DC2626] transition-all shadow-xs"
                      >
                        <img
                          src={s.avatarUrl}
                          alt={s.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded object-cover border border-black/15 bg-zinc-100"
                        />
                        <div>
                          <span className="text-[10px] font-mono-data text-[#DC2626] font-bold">{s.code}</span>
                          <p className="text-xs font-bold text-black">{s.name}</p>
                          <p className="text-[10px] font-mono-data text-zinc-500">
                            STRESS: {s.emotionalState?.stress ?? 50}%
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Section 53: Research Note Experience */}
              <div
                className={`space-y-4 pt-4 border-t border-black/10 transition-all duration-300 ${
                  revealStep >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#DC2626]" />
                    <span className="text-xs font-mono-data text-black font-bold tracking-wider">
                      RESEARCH EVIDENCE & INVESTIGATION NOTES
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-data text-zinc-500">
                    SECTION 53 DIRECTIVE
                  </span>
                </div>

                {/* Section 53 Flash Banner when note is saved */}
                {lastCapturedNote && (
                  <div className="p-3 rounded border border-red-300 bg-red-50 animate-pulse flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#DC2626]" />
                      <div className="text-xs font-mono-data">
                        <span className="text-[#DC2626] font-bold">NOTE CAPTURED // </span>
                        <span className="text-black font-bold">{lastCapturedNote.timestamp} · </span>
                        <span className="text-zinc-700">{lastCapturedNote.author} · </span>
                        <span className="text-[#DC2626] font-bold">{activeCase.code}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono-data text-[#DC2626] bg-white border border-red-300 px-2 py-0.5 rounded font-bold">
                      EVIDENCE LOGGED
                    </span>
                  </div>
                )}

                {/* Log Note Input Form */}
                <form onSubmit={handleCaptureNote} className="space-y-3 bg-zinc-50 p-4 rounded-lg border border-black/10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {(['OBSERVATION', 'HYPOTHESIS', 'CORRELATION'] as const).map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => setNewNoteClass(cls)}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono-data tracking-wider transition-all cursor-pointer ${
                            newNoteClass === cls
                              ? 'bg-red-600 text-white font-bold'
                              : 'bg-white text-zinc-600 border border-black/15 hover:text-black'
                          }`}
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] font-mono-data text-zinc-500">
                      OPERATOR: {user?.name || 'RESEARCHER'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Append classified research evidence or behavioral hypothesis..."
                      className="flex-1 bg-white border border-black/20 rounded-lg px-3 py-2 text-xs font-mono-data text-black placeholder:text-zinc-400 focus:outline-none focus:border-red-600"
                    />
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-lg text-xs font-mono-data font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      LOG EVIDENCE
                    </button>
                  </div>
                </form>

                {/* Evidence Timeline Log */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-white border border-black/10 space-y-1 hover:border-black/25 transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono-data">
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 font-bold">[{note.classification}]</span>
                          <span className="text-zinc-600">{note.author}</span>
                        </div>
                        <span className="text-zinc-400">{note.timestamp}</span>
                      </div>
                      <p className="text-xs text-zinc-800 font-mono-data">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="pt-3 border-t border-black/10 flex items-center gap-2 text-xs font-mono-data text-zinc-500">
                <span className="font-bold text-black">TAXONOMY:</span>
                {activeCase.tags.map((t, i) => (
                  <span key={i} className="text-red-600 font-bold">
                    #{t} {i < activeCase.tags.length - 1 && '·'}
                  </span>
                ))}
              </div>
            </HUDPanel>
          ) : (
            <div className="border border-dashed border-black/20 rounded-xl text-center p-12 bg-zinc-50 flex flex-col items-center justify-center space-y-4 shadow-xs">
              <FolderKanban className="w-10 h-10 text-red-600" />
              <div className="max-w-md space-y-1.5">
                <h3 className="font-display text-2xl text-black tracking-wide">
                  NO INVESTIGATION DOSSIER ACTIVE
                </h3>
                <p className="text-xs text-zinc-600 font-mono-data">
                  Select a case from the portfolio or initialize an experimental investigation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono-data font-bold tracking-wider cursor-pointer shadow-xs"
              >
                INITIALIZE CASE
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create New Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-red-600 rounded-lg max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-red-600" />
                <h3 className="font-display text-2xl text-black tracking-wider">
                  INITIALIZE RESEARCH INVESTIGATION
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-black cursor-pointer p-1 rounded hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono-data text-zinc-600 font-bold mb-1">
                  CASE NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAMPUS SOCIAL PRESSURE DYNAMICS"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-sm text-black font-mono-data focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-data text-zinc-600 font-bold mb-1">
                    ENVIRONMENT *
                  </label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                    className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-red-600"
                  >
                    {ENVIRONMENTS.map((env) => (
                      <option key={env} value={env}>
                        {env}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-data text-zinc-600 font-bold mb-1">
                    TAXONOMY TAGS
                  </label>
                  <input
                    type="text"
                    value={formData.tagsStr}
                    onChange={(e) => setFormData({ ...formData, tagsStr: e.target.value })}
                    className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-data text-zinc-600 font-bold mb-1">
                  RESEARCH OBJECTIVE *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="What core behavioral phenomena is this case evaluating?"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-data text-zinc-600 font-bold mb-1">
                  RESEARCH QUESTION
                </label>
                <input
                  type="text"
                  placeholder="e.g. Under what threshold does subject conformity break down?"
                  value={formData.researchQuestion}
                  onChange={(e) => setFormData({ ...formData, researchQuestion: e.target.value })}
                  className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-data text-zinc-600 font-bold mb-1">
                  INITIAL WORKING HYPOTHESIS
                </label>
                <textarea
                  rows={2}
                  placeholder="Predicted behavioral outcomes before trial execution..."
                  value={formData.initialHypothesis}
                  onChange={(e) => setFormData({ ...formData, initialHypothesis: e.target.value })}
                  className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-black/15 rounded-lg text-xs font-mono-data text-zinc-600 hover:text-black hover:bg-zinc-100 cursor-pointer"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono-data font-bold tracking-wider cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'INITIALIZING...' : 'CONFIRM CASE CREATION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
