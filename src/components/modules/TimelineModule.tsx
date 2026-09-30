/**
 * BLACK S.H.E.E.P. - Module 08: Chronological Timeline
 * Light Theme: Pure White (#FFFFFF), Deep Black (#000000), Scientific Red (#DC2626)
 * Real-time event-sourced temporal ledger for campus peer interactions
 */

import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Filter,
  AlertTriangle,
  FlaskConical,
  MessageSquare,
  Activity,
  Heart,
  User,
  X,
  Compass,
} from 'lucide-react';
import { Subject, TimelineEvent } from '../../types';

interface TimelineModuleProps {
  events: TimelineEvent[];
  subjects: Subject[];
  onAddEvent?: (event: Partial<TimelineEvent>) => Promise<void>;
}

const CATEGORIES = ['ALL', 'Social', 'Emotional', 'Academic', 'Experiment', 'Anomaly'] as const;

export const TimelineModule: React.FC<TimelineModuleProps> = ({
  events = [],
  subjects = [],
  onAddEvent,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states for manual injection
  const [formSubjectId, setFormSubjectId] = useState<string>(subjects[0]?.id || '');
  const [formType, setFormType] = useState<TimelineEvent['type']>('Social');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDetail, setFormDetail] = useState<string>('');
  const [formLocation, setFormLocation] = useState<string>('MCA Department Corridor');
  const [isAnomaly, setIsAnomaly] = useState<boolean>(false);

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === 'ALL') return true;
    return e.type.toLowerCase() === selectedCategory.toLowerCase();
  });

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'experiment':
        return FlaskConical;
      case 'social':
        return MessageSquare;
      case 'emotional':
        return Heart;
      case 'academic':
        return Compass;
      case 'anomaly':
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !onAddEvent) return;

    const sub = subjects.find((s) => s.id === formSubjectId) || subjects[0];

    await onAddEvent({
      subjectId: formSubjectId || sub?.id || 'HX-001',
      subjectName: sub?.name || 'A S Remin Krishna',
      subjectCode: sub?.code || 'HX-001',
      type: formType,
      title: formTitle,
      detail: formDetail,
      location: formLocation,
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      deviationDetected: isAnomaly,
    });

    setFormTitle('');
    setFormDetail('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 select-none font-sans text-black">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-data text-[#DC2626] font-bold tracking-widest uppercase">
            <span>MODULE 08</span>
            <span>·</span>
            <span>TEMPORAL TELEMETRY</span>
            <span>·</span>
            <span className="text-black">EVENT-SOURCED LEDGER</span>
          </div>
          <h1 className="font-display text-4xl text-black tracking-wider mt-1">
            SUBJECT TIMELINE
          </h1>
          <p className="text-xs text-zinc-600 font-mono-data mt-0.5">
            Real-time chronological telemetry. Micro-actions, psychological shifts, and campus peer encounters.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xs text-xs font-mono-data font-bold tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>INJECT TIMELINE EVENT</span>
        </button>
      </div>

      {/* Category Filter Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 bg-white p-2.5 rounded-xs border border-black/15 shadow-xs">
        <Filter className="w-4 h-4 text-zinc-500 mr-1 shrink-0" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xs text-xs font-mono-data whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#DC2626] text-white font-bold'
                : 'text-zinc-600 hover:text-black bg-zinc-100 border border-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Chronological Event Stream */}
      {filteredEvents.length === 0 ? (
        <div className="border border-dashed border-black/20 rounded-xs text-center p-12 bg-white flex flex-col items-center justify-center space-y-4">
          <Clock className="w-10 h-10 text-[#DC2626]" />
          <div className="max-w-md space-y-1.5">
            <h3 className="font-display text-2xl text-black tracking-wide">
              NO TIMELINE EVENTS RECORDED
            </h3>
            <p className="text-xs text-zinc-600 font-mono-data">
              The event-sourced stream is empty. Inject events to observe behavioral trajectories.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xs text-xs font-mono-data font-bold tracking-wider cursor-pointer"
          >
            INJECT FIRST EVENT
          </button>
        </div>
      ) : (
        <div className="relative pl-6 md:pl-10 space-y-6 before:content-[''] before:absolute before:left-3 md:before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#DC2626] before:via-black/30 before:to-zinc-300">
          {filteredEvents.map((evt, idx) => {
            const Icon = getEventIcon(evt.type);
            const isAnomaly = evt.deviationDetected || evt.type.toLowerCase() === 'anomaly';
            const isExp = evt.type.toLowerCase() === 'experiment';

            return (
              <div key={evt.id} className="relative group">
                {/* Chrono Node / Icon */}
                <div
                  className={`absolute -left-6 md:-left-10 top-1 w-6 h-6 md:w-8 md:h-8 rounded-full border flex items-center justify-center transition-all ${
                    isAnomaly
                      ? 'border-[#DC2626] bg-[#DC2626] text-white shadow-md'
                      : isExp
                      ? 'border-[#DC2626] bg-white text-[#DC2626] shadow-xs'
                      : 'border-black/20 bg-white text-zinc-600 group-hover:border-[#DC2626] group-hover:text-[#DC2626]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Event Card */}
                <div
                  className={`p-5 rounded-xs border transition-all relative ${
                    isAnomaly
                      ? 'border-[#DC2626] bg-red-50/50 shadow-sm'
                      : isExp
                      ? 'border-black/20 bg-white shadow-xs'
                      : 'border-black/15 bg-white hover:border-[#DC2626]'
                  }`}
                >
                  {isAnomaly && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-mono-data text-[#DC2626] bg-red-50 border border-[#DC2626] px-2 py-0.5 rounded-xs font-bold">
                      <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
                      <span>DEVIATION DETECTED</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data text-xs font-bold text-[#DC2626]">
                        {evt.timeFormatted}
                      </span>
                      <span className="text-zinc-300">·</span>
                      <span className="font-mono-data text-xs text-black font-bold">
                        {evt.subjectName} ({evt.subjectCode})
                      </span>
                      <span className="text-zinc-300">·</span>
                      <span className="text-[10px] font-mono-data text-zinc-500">
                        LOC: {evt.location}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono-data px-2.5 py-0.5 rounded font-bold self-start sm:self-auto ${
                        isAnomaly
                          ? 'bg-[#DC2626] text-white'
                          : isExp
                          ? 'bg-red-50 text-[#DC2626] border border-red-200'
                          : 'bg-zinc-100 border border-zinc-200 text-zinc-700'
                      }`}
                    >
                      {evt.type.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-display text-xl text-black mb-1 tracking-wide">{evt.title}</h3>
                  <p className="text-xs text-zinc-700 font-normal leading-relaxed">{evt.detail}</p>

                  {evt.involvedSubjects && evt.involvedSubjects.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-black/10 text-[10px] font-mono-data text-zinc-600 flex items-center gap-2">
                      <span className="text-zinc-500">PEER PROXIMITY:</span>
                      <span className="text-[#DC2626] font-bold">{evt.involvedSubjects.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#DC2626] rounded-xs max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="font-display text-2xl text-black tracking-wider">
                INJECT TIMELINE EVENT
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-mono-data text-zinc-700 font-semibold mb-1">
                  TARGET SUBJECT *
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full bg-zinc-50 border border-black/20 rounded px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-[#DC2626]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-data text-zinc-700 font-semibold mb-1">
                    EVENT CATEGORY
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-black/20 rounded px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-[#DC2626]"
                  >
                    <option value="Social">Social</option>
                    <option value="Emotional">Emotional</option>
                    <option value="Academic">Academic</option>
                    <option value="Experiment">Experiment</option>
                    <option value="Anomaly">Anomaly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-data text-zinc-700 font-semibold mb-1">
                    LOCATION
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-zinc-50 border border-black/20 rounded px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-[#DC2626]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-data text-zinc-700 font-semibold mb-1">
                  EVENT TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peer Isolation after Mocking Episode"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-zinc-50 border border-black/20 rounded px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-[#DC2626]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-data text-zinc-700 font-semibold mb-1">
                  EVENT DETAILS
                </label>
                <textarea
                  rows={2}
                  placeholder="Description of the behavioral reaction or social withdrawal..."
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                  className="w-full bg-zinc-50 border border-black/20 rounded px-3 py-2 text-xs text-black font-mono-data focus:outline-none focus:border-[#DC2626]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkAnomaly"
                  checked={isAnomaly}
                  onChange={(e) => setIsAnomaly(e.target.checked)}
                  className="accent-[#DC2626]"
                />
                <label htmlFor="chkAnomaly" className="text-xs font-mono-data text-black font-semibold">
                  Flag as Behavioral Deviation / Anomaly
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-black/20 rounded text-xs font-mono-data text-zinc-600 hover:text-black cursor-pointer"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded text-xs font-mono-data cursor-pointer shadow-xs"
                >
                  INJECT TELEMETRY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
