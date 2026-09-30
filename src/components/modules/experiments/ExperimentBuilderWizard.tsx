/**
 * BLACK S.H.E.E.P. - Section 22: 6-Stage Experiment Builder
 * Multi-stage animated workflow:
 * 01 SUBJECT
 * 02 ENVIRONMENT
 * 03 VARIABLES
 * 04 NARRATIVE
 * 05 PREDICTION
 * 06 DEPLOY
 * Shows EXPERIMENT READY summary, variable meters, observation window,
 * and high-impact animated [ DEPLOY EXPERIMENT ] trigger.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FlaskConical,
  Users,
  Compass,
  Sliders,
  FileText,
  Eye,
  Rocket,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Subject, ResearchCase } from '../../../types';

interface ExperimentBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  cases: ResearchCase[];
  onDeploy: (expPayload: any) => Promise<void>;
  onGenerateAIScenario: (params: any) => Promise<any>;
}

export const ExperimentBuilderWizard: React.FC<ExperimentBuilderWizardProps> = ({
  isOpen,
  onClose,
  subjects,
  cases,
  onDeploy,
  onGenerateAIScenario,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Form Fields
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([
    subjects[0]?.id || 'sub_hx071',
  ]);
  const [environment, setEnvironment] = useState('College Cafeteria & Research Quad');
  const [variables, setVariables] = useState({
    socialPressure: 80,
    emotionalPressure: 75,
    authorityPresence: 60,
    uncertainty: 70,
    isolation: 50,
    rewardIncentive: 40,
  });
  const [title, setTitle] = useState('Collegiate Peer Conformity & Breaking Point Challenge');
  const [objective, setObjective] = useState(
    'Test whether Subject HX-071 will break baseline conflict avoidance when subjected to unanimous peer accusation.'
  );
  const [trigger, setTrigger] = useState(
    'Sudden announcement of missing research data and public verbal confrontation in cafeteria.'
  );
  const [narrative, setNarrative] = useState(
    'Peers surround the subject’s table, openly accusing him of academic sabotage. Trusted peer Maya looks on in silence.'
  );
  const [predictedOutcome, setPredictedOutcome] = useState(
    'Subject will capitulate, accept secondary blame, and avoid public defense with 78% probability.'
  );
  const [observationWindow, setObservationWindow] = useState('20 minutes post-trigger');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const generated = await onGenerateAIScenario({
        caseId: selectedCaseId,
        targetVariable: 'Peer Pressure vs Conflict Avoidance',
        environment,
      });

      if (generated) {
        if (generated.scenarioTitle) setTitle(generated.scenarioTitle);
        if (generated.narrative) setNarrative(generated.narrative);
        if (generated.triggerEvent) setTrigger(generated.triggerEvent);
        if (generated.predictedOutcome) setPredictedOutcome(generated.predictedOutcome);
        if (generated.recommendedWindow) setObservationWindow(generated.recommendedWindow);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleFinalDeploy = async () => {
    setIsDeploying(true);
    try {
      await onDeploy({
        caseId: selectedCaseId,
        title,
        objective,
        environment,
        trigger,
        expectedBehavior: predictedOutcome,
        scenario: narrative,
        observationWindow,
        successCriteria: 'Acoustic tremor, ventral avoidance, verbal capitulation measured.',
        variables,
        subjectIds: selectedSubjectIds,
      });
      onClose();
    } finally {
      setIsDeploying(false);
    }
  };

  const stepLabels = [
    { num: 1, label: 'SUBJECT', icon: Users },
    { num: 2, label: 'ENVIRONMENT', icon: Compass },
    { num: 3, label: 'VARIABLES', icon: Sliders },
    { num: 4, label: 'NARRATIVE', icon: FileText },
    { num: 5, label: 'PREDICTION', icon: Eye },
    { num: 6, label: 'DEPLOY', icon: Rocket },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-mono-data select-none text-xs">
      <div className="relative max-w-3xl w-full bg-white border-2 border-red-600 rounded-lg shadow-2xl overflow-hidden">
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-600" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-600" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-600" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-600" />

        {/* Top Header */}
        <div className="p-4 border-b border-black/10 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <FlaskConical className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-display text-2xl text-black tracking-wider">
                CONTROLLED SIMULATION BUILDER
              </h3>
              <span className="text-[10px] text-red-600 font-bold block">
                MULTI-STAGE SCIENTIFIC PROTOCOL
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

        {/* Section 22: 6 Stage Progress Indicators */}
        <div className="grid grid-cols-6 border-b border-black/10 bg-white text-[10px]">
          {stepLabels.map((st) => {
            const Icon = st.icon;
            const isCurrent = step === st.num;
            const isCompleted = step > st.num;

            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setStep(st.num as any)}
                className={`py-2 px-1 text-center border-r last:border-r-0 border-black/10 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isCurrent
                    ? 'bg-red-50 text-red-600 font-bold border-b-2 border-b-red-600 shadow-xs'
                    : isCompleted
                    ? 'text-emerald-700 bg-emerald-50/50'
                    : 'text-zinc-500 hover:text-black hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>0{st.num}</span>
                  <Icon className="w-3 h-3" />
                </div>
                <span className="hidden sm:inline tracking-wider">{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stage Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <AnimatePresence mode="wait">
            {/* STAGE 01: SUBJECT */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="border-b border-black/10 pb-2">
                  <h4 className="font-display text-xl text-black">01 // SELECT TARGET SUBJECTS & CASE</h4>
                  <p className="text-zinc-600 text-xs font-sans">
                    Choose the human subjects whose cognitive breaking points will be evaluated.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-600 font-bold uppercase mb-1.5">
                    ASSIGNED CASE
                  </label>
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-red-600"
                  >
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-600 font-bold uppercase mb-1.5">
                    TARGET HUMAN SUBJECTS
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {subjects.map((sub) => {
                      const isSelected = selectedSubjectIds.includes(sub.id);
                      return (
                        <div
                          key={sub.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSubjectIds(selectedSubjectIds.filter((id) => id !== sub.id));
                            } else {
                              setSelectedSubjectIds([...selectedSubjectIds, sub.id]);
                            }
                          }}
                          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-red-50 border-2 border-red-600 text-black shadow-xs'
                              : 'bg-zinc-50 border border-black/10 text-zinc-700 hover:border-black/30'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] text-red-600 font-bold">{sub.code}</span>
                            <div>
                              <div className="font-bold text-black">{sub.name}</div>
                              <div className="text-[10px] text-zinc-500">{sub.occupation}</div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STAGE 02: ENVIRONMENT */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="border-b border-black/10 pb-2">
                  <h4 className="font-display text-xl text-black">02 // CONFIGURE ENVIRONMENT</h4>
                  <p className="text-zinc-600 text-xs font-sans">
                    Specify the spatial context where the stimulus will be deployed.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-600 font-bold uppercase mb-1.5">
                    SIMULATION SETTING / LOCATION
                  </label>
                  <input
                    type="text"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    placeholder="e.g. University Cafeteria / Public Research Quad"
                    className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    'College Cafeteria (High Social Visibility)',
                    'Academic Library (Constrained Acoustic Space)',
                    'Dormitory Quad (Semi-Private Buffer)',
                    'Faculty Committee Chambers (High Authority)',
                  ].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setEnvironment(loc)}
                      className="p-2.5 rounded-lg bg-zinc-50 border border-black/10 hover:border-red-600 text-left text-zinc-700 hover:text-black cursor-pointer transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STAGE 03: VARIABLES */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="border-b border-black/10 pb-2">
                  <h4 className="font-display text-xl text-black">03 // CALIBRATE EXPERIMENTAL VARIABLES</h4>
                  <p className="text-zinc-600 text-xs font-sans">
                    Adjust mathematical stress vectors injected into the simulation kernel.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(variables).map(([key, val]) => (
                    <div key={key} className="p-3 bg-zinc-50 border border-black/10 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-700 uppercase tracking-wider font-bold">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-red-600 font-bold">{val}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={val}
                        onChange={(e) =>
                          setVariables({ ...variables, [key]: Number(e.target.value) })
                        }
                        className="w-full accent-red-600 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STAGE 04: NARRATIVE */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <div>
                    <h4 className="font-display text-xl text-black">04 // FORMULATE NARRATIVE & STIMULUS</h4>
                    <p className="text-zinc-600 text-xs font-sans">
                      Define the stimulus trigger and behavioral event.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingAI ? 'SYNTHESIZING...' : 'AI SCENARIO GENERATE'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-600 font-bold uppercase mb-1">
                    EXPERIMENT PROTOCOL TITLE
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-600 font-bold uppercase mb-1">
                    SPECIFIC TRIGGER EVENT
                  </label>
                  <input
                    type="text"
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    placeholder="e.g. Accusation whispered loudly at adjacent lunch table"
                    className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-600 font-bold uppercase mb-1">
                    SCENARIO DETAILS & SCRIPT
                  </label>
                  <textarea
                    rows={3}
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-red-600"
                  />
                </div>
              </motion.div>
            )}

            {/* STAGE 05: PREDICTION */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="border-b border-black/10 pb-2">
                  <h4 className="font-display text-xl text-black">05 // PREDICTION & OBSERVATION WINDOW</h4>
                  <p className="text-zinc-600 text-xs font-sans">
                    State the expected behavioral outcome before stimulus deployment.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-600 font-bold uppercase mb-1">
                    PREDICTED OUTCOME (HYPOTHESIS)
                  </label>
                  <textarea
                    rows={3}
                    value={predictedOutcome}
                    onChange={(e) => setPredictedOutcome(e.target.value)}
                    placeholder="Predicted behavioral reaction..."
                    className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-600 font-bold uppercase mb-1">
                    OBSERVATION WINDOW
                  </label>
                  <input
                    type="text"
                    value={observationWindow}
                    onChange={(e) => setObservationWindow(e.target.value)}
                    className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-red-600"
                  />
                </div>
              </motion.div>
            )}

            {/* STAGE 06: DEPLOY (Section 22 Final Summary) */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="border-b border-black/10 pb-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-red-600 font-bold tracking-widest uppercase block">
                      ALL PARAMETERS CONFIGURED
                    </span>
                    <h4 className="font-display text-2xl text-black">EXPERIMENT READY</h4>
                  </div>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    STAGE 06 // READY FOR INJECTION
                  </span>
                </div>

                {/* Summary Matrix */}
                <div className="bg-zinc-50 p-4 rounded-lg border border-black/10 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-black/10 pb-1">
                    <span className="text-zinc-600">PROTOCOL:</span>
                    <span className="font-bold text-black">{title}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/10 pb-1">
                    <span className="text-zinc-600">ENVIRONMENT:</span>
                    <span className="text-black">{environment}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/10 pb-1">
                    <span className="text-zinc-600">TARGET SUBJECTS:</span>
                    <span className="text-red-600 font-bold">{selectedSubjectIds.length} Subjects</span>
                  </div>
                  <div className="flex justify-between border-b border-black/10 pb-1">
                    <span className="text-zinc-600">OBSERVATION WINDOW:</span>
                    <span className="text-black">{observationWindow}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-zinc-600">EXPECTED OUTCOME:</span>
                    <span className="text-zinc-700 font-sans">{predictedOutcome}</span>
                  </div>
                </div>

                {/* Section 22: Strong Deploy Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleFinalDeploy}
                    disabled={isDeploying}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <Rocket className="w-4 h-4 animate-pulse" />
                    <span>[ DEPLOY EXPERIMENT ]</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-black/10 bg-zinc-50 flex items-center justify-between text-xs">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((step - 1) as any)}
            className="px-3.5 py-1.5 rounded-lg border border-black/15 text-zinc-600 hover:text-black hover:bg-white disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>PREVIOUS</span>
          </button>

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as any)}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>NEXT STEP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[10px] text-zinc-500">READY FOR SIMULATION INJECTION</span>
          )}
        </div>
      </div>
    </div>
  );
};
