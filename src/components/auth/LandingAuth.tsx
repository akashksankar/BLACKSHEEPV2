/**
 * BLACK S.H.E.E.P. - Light Theme Cinematic Landing & Authentication Experience
 * Palette: Pure White (#FFFFFF), Deep Black (#000000), Scientific Red (#DC2626)
 * - Moving grid motion graphics & atmospheric scanline
 * - Technical boot sequence: INITIALIZING BEHAVIORAL RESEARCH SYSTEM
 * - Shared Level-5 Workspace for Akash Sankar & Alfa Alias
 * - Zero robot terminology (Strictly human behavioral dynamics)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Key,
  ArrowRight,
  UserCheck,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Lock,
  FileCode2,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthorizedBetaUser } from '../../types';
import { TechBackground } from '../common/TechBackground';

interface ResearcherProfileInfo {
  name: AuthorizedBetaUser;
  role: string;
  userNum: string;
  clearance: string;
}

const RESEARCHER_PROFILES: ResearcherProfileInfo[] = [
  {
    name: 'Akash Sankar',
    role: 'System Architect',
    userNum: 'OPERATOR 01',
    clearance: 'LEVEL-5 SCIENTIFIC',
  },
  {
    name: 'Alfa Alias',
    role: 'Psychological Advisor',
    userNum: 'OPERATOR 02',
    clearance: 'LEVEL-5 SCIENTIFIC',
  },
];

export const LandingAuth: React.FC = () => {
  const { login, error, clearError } = useAuth();

  const [bootStage, setBootStage] = useState<number>(0);
  const [selectedIdentity, setSelectedIdentity] = useState<AuthorizedBetaUser>('Akash Sankar');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authStepMessage, setAuthStepMessage] = useState<string | null>(null);
  const [showJwtInspector, setShowJwtInspector] = useState<boolean>(false);

  const [authSuccessData, setAuthSuccessData] = useState<{
    name: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setBootStage(1), 300);
    const t2 = setTimeout(() => setBootStage(2), 700);
    const t3 = setTimeout(() => setBootStage(3), 1300);
    const t4 = setTimeout(() => setBootStage(4), 2100);
    const t5 = setTimeout(() => setBootStage(5), 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const handleSelectIdentity = (identity: AuthorizedBetaUser) => {
    setSelectedIdentity(identity);
    clearError();
  };

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);

    setAuthStepMessage(`VERIFYING SECURITY PASS KEY FOR ${selectedIdentity.toUpperCase()}...`);
    await new Promise((r) => setTimeout(r, 350));

    setAuthStepMessage('ISSUING RFC 7519 HMAC-SHA256 (HS256) JSON WEB TOKEN...');
    await new Promise((r) => setTimeout(r, 400));

    setAuthStepMessage('ATTACHING SYNCHRONIZED LEVEL-5 WORKSPACE...');
    await new Promise((r) => setTimeout(r, 350));

    try {
      await login(selectedIdentity, password);

      const role =
        selectedIdentity === 'Akash Sankar' ? 'SYSTEM ARCHITECT' : 'PSYCHOLOGICAL ADVISOR';
      setAuthSuccessData({
        name: selectedIdentity.toUpperCase(),
        role,
      });

      await new Promise((r) => setTimeout(r, 1300));
    } catch {
      setIsAuthenticating(false);
      setAuthStepMessage(null);
    }
  };

  // Identity Verified Screen (Light Theme)
  if (authSuccessData) {
    return (
      <div className="fixed inset-0 z-50 bg-white text-black flex flex-col items-center justify-center p-6 font-mono-data select-none">
        <TechBackground state="NORMAL" />
        <div className="relative z-10 max-w-lg w-full bg-white/95 border-2 border-[#DC2626] p-8 rounded-xs shadow-2xl text-center space-y-4">
          <div className="w-3 h-3 border-t-2 border-l-2 border-[#DC2626] absolute top-0 left-0" />
          <div className="w-3 h-3 border-t-2 border-r-2 border-[#DC2626] absolute top-0 right-0" />
          <div className="w-3 h-3 border-b-2 border-l-2 border-[#DC2626] absolute bottom-0 left-0" />
          <div className="w-3 h-3 border-b-2 border-r-2 border-[#DC2626] absolute bottom-0 right-0" />

          <div className="inline-flex p-3 rounded-full bg-red-50 border border-[#DC2626] text-[#DC2626] mb-2">
            <CheckCircle2 className="w-8 h-8 animate-pulse" />
          </div>

          <h2 className="text-xs tracking-widest text-[#DC2626] font-bold uppercase">
            IDENTITY VERIFIED & LEVEL-5 CLEARANCE GRANTED
          </h2>

          <h1 className="font-display text-5xl text-black tracking-widest">
            {authSuccessData.name}
          </h1>

          <p className="text-sm text-[#DC2626] font-bold tracking-wider">
            {authSuccessData.role}
          </p>

          <div className="p-3 bg-zinc-50 rounded border border-black/10 space-y-1 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>SHARED WORKSPACE:</span>
              <span className="text-black font-bold">AKASH SANKAR & ALFA ALIAS (SYNCED)</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>PRIMARY SUBJECT:</span>
              <span className="text-[#DC2626] font-bold">A S REMIN KRISHNA (HX-001)</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>SECURITY TOKEN:</span>
              <span className="text-emerald-700 font-bold">HS256 VALIDATED</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="font-display text-3xl text-[#DC2626] tracking-widest animate-pulse block">
              ACCESS GRANTED
            </span>
            <span className="text-[11px] text-zinc-500 tracking-wider">
              TRANSITIONING TO SHARED RESEARCH WORKSTATION...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-white text-black flex flex-col justify-between overflow-hidden selection:bg-[#DC2626] selection:text-white font-sans">
      {/* Background Moving Grid System */}
      <TechBackground state={isAuthenticating ? 'AI_ANALYSIS' : 'NORMAL'} />

      {/* Top Station Header */}
      <header className="relative z-10 w-full px-4 md:px-8 py-3.5 flex items-center justify-between border-b border-black/10 bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-ping" />
          <span className="font-mono-data text-xs tracking-wider text-black font-bold">
            STATION ID: BS-OBS-01 // BETA AUTHENTICATION GATEWAY
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono-data">
          <span className="text-zinc-600 hidden sm:inline">AUTH: RFC 7519 JWT (HS256)</span>
          <span className="text-[#DC2626] border border-[#DC2626]/30 bg-red-50 px-2 py-0.5 rounded text-[11px] font-bold">
            CLEARANCE: LEVEL-5
          </span>
        </div>
      </header>

      {/* Main Terminal Focus */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto w-full">
        {/* Technical Boot Sequence Typography */}
        <AnimatePresence>
          {bootStage >= 2 && bootStage < 5 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center font-mono-data mb-6 max-w-lg mx-auto w-full"
            >
              <div className="text-xs text-[#DC2626] font-bold tracking-widest mb-3 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-ping" />
                <span>INITIALIZING BEHAVIORAL RESEARCH SYSTEM</span>
              </div>

              {bootStage >= 3 && (
                <div className="bg-white/95 border border-black/15 shadow-sm p-3.5 rounded-xs text-[11px] space-y-1 text-left">
                  <div className="text-black font-bold mb-1 border-b border-black/10 pb-1">
                    SYSTEM DIAGNOSTICS & HARDWARE SYNCHRONIZATION
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>BEHAVIORAL ENGINE</span>
                    <span className="text-emerald-600 font-bold">CALIBRATED</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>MOVING GRID SENSORS</span>
                    <span className="text-[#DC2626] font-bold">ACTIVE (60 FPS)</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>RAG KNOWLEDGE CORE</span>
                    <span className="text-emerald-600 font-bold">SYNCED</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>SHARED COHORT LINK</span>
                    <span className="text-black font-bold">ONLINE</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Title Typography Reveal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: bootStage >= 4 ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-xs bg-red-50 text-[#DC2626] border border-red-200 shadow-xs font-mono-data">
            <Shield className="w-3.5 h-3.5 text-[#DC2626]" />
            <span className="text-[11px] tracking-widest font-bold uppercase">
              BETA RESEARCH PROTOCOL v0.1 // CLASSIFIED WORKSTATION
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-widest text-black drop-shadow-sm leading-none break-words">
            BLACK S.H.E.E.P.
          </h1>

          <p className="font-display text-xl sm:text-3xl text-[#DC2626] tracking-widest mt-2 uppercase font-medium">
            STRATEGIC HUMAN EXPERIMENT AND EVALUATION PROTOCOL
          </p>

          <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl mx-auto mt-2 font-normal leading-relaxed">
            Classified behavioral observation, experimentation, and anomaly simulation for human psychological dynamics.
          </p>

          {/* Shared Workspace Banner */}
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-zinc-100 border border-black/15 rounded text-[11px] font-mono-data text-black">
            <Users className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Shared Workspace: <strong>Akash Sankar</strong> &amp; <strong>Alfa Alias</strong> see and operate on the exact same live research state.</span>
          </div>
        </motion.div>

        {/* Pass Key Directory + Auth Console Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: bootStage >= 5 ? 1 : 0, y: bootStage >= 5 ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* LEFT COLUMN: Pass Key Directory */}
          <div className="lg:col-span-5 bg-white/95 border border-black/15 rounded-xs p-5 shadow-md relative">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#DC2626]" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#DC2626]" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#DC2626]" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#DC2626]" />

            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/10">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#DC2626]" />
                <h3 className="font-mono-data text-xs font-bold text-black tracking-wider uppercase">
                  AUTHORIZED RESEARCH IDENTITIES
                </h3>
              </div>
              <span className="text-[10px] font-mono-data text-[#DC2626] font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-xs">
                2 OPERATORS
              </span>
            </div>

            <p className="text-xs text-zinc-600 font-mono-data mb-4 leading-relaxed">
              Select your active research identity below, then enter your assigned security pass key:
            </p>

            {/* Researcher Identity Cards */}
            <div className="space-y-3">
              {RESEARCHER_PROFILES.map((item) => {
                const isSelected = selectedIdentity === item.name;
                return (
                  <div
                    key={item.name}
                    onClick={() => handleSelectIdentity(item.name)}
                    className={`p-3.5 rounded-xs border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#DC2626] bg-red-50/50 shadow-sm ring-1 ring-[#DC2626]'
                        : 'border-zinc-200 bg-zinc-50/70 hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono-data font-bold text-zinc-500">
                            {item.userNum}
                          </span>
                          <span className="text-[10px] font-mono-data text-black font-bold bg-white border border-black/15 px-1.5 py-0.2 rounded-xs">
                            {item.clearance}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-black mt-1">{item.name}</h4>
                        <p className="text-[11px] font-mono-data text-[#DC2626] font-semibold">
                          {item.role}
                        </p>
                      </div>

                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono-data text-white bg-[#DC2626] px-2 py-0.5 rounded-xs font-bold">
                          <UserCheck className="w-3 h-3" />
                          SELECTED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono-data text-zinc-400">
                          CLICK TO SELECT
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick JWT Inspector Trigger */}
            <div className="mt-4 pt-3 border-t border-black/10 flex justify-between items-center text-[10px] font-mono-data text-zinc-600">
              <span>SECURITY: RFC 7519 JWT (HS256)</span>
              <button
                type="button"
                onClick={() => setShowJwtInspector(true)}
                className="text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <FileCode2 className="w-3 h-3" />
                <span>INSPECT JWT SPEC</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Terminal Authentication Gate */}
          <div className="lg:col-span-7 bg-white/95 border border-black/15 rounded-xs p-6 shadow-md relative">
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#DC2626]" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#DC2626]" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#DC2626]" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#DC2626]" />

            <div className="border-b border-black/10 pb-3 mb-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-data text-[#DC2626] font-bold tracking-wider uppercase block">
                  SECURITY GATEWAY
                </span>
                <h3 className="font-display text-2xl text-black tracking-wider">
                  RESEARCHER LOGIN CONSOLE
                </h3>
              </div>
              <Lock className="w-5 h-5 text-[#DC2626]" />
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xs bg-red-50 border border-red-300 flex items-center gap-2 text-xs font-mono-data text-red-800">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAuthenticate} className="space-y-4 font-mono-data text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  SELECTED OPERATOR IDENTITY
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Akash Sankar', 'Alfa Alias'] as AuthorizedBetaUser[]).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelectIdentity(name)}
                      className={`p-2.5 rounded-xs border text-left cursor-pointer transition-all ${
                        selectedIdentity === name
                          ? 'border-[#DC2626] bg-red-50 text-black font-bold shadow-xs'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:text-black hover:border-zinc-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{name}</div>
                      <div className="text-[9px] text-zinc-500 font-normal">
                        {name === 'Akash Sankar' ? 'System Architect' : 'Psychological Advisor'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">
                    SECURITY PASS KEY / TOKEN
                  </label>
                  <span className="text-[10px] text-zinc-500 font-bold">
                    CONFIDENTIAL CREDENTIAL
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter classified Level-5 pass key..."
                    className="w-full bg-zinc-50 border border-black/20 focus:border-[#DC2626] focus:bg-white focus:outline-none rounded-xs px-3 py-2.5 text-black font-mono-data text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-black cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Progress Telemetry during authentication */}
              {isAuthenticating && authStepMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-[#DC2626] font-bold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping" />
                    <span>{authStepMessage}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#DC2626] to-black animate-pulse w-full" />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full mt-2 py-3 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white rounded-xs font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAuthenticating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>AUTHENTICATING LEVEL-5 SESSION...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN TOKEN & ENTER RESEARCH LAB</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-white/90 border-t border-black/10 px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-xs font-mono-data text-zinc-600">
        <div>
          <span className="text-black font-bold">BLACK S.H.E.E.P. PROTOCOL</span>
          <span className="mx-2">·</span>
          <span>BETA v0.1</span>
          <span className="mx-2">·</span>
          <span>AUTHORIZED RESEARCH PERSONNEL ONLY</span>
        </div>
        <div className="mt-2 sm:mt-0 text-zinc-500">
          SHARED SYNCHRONIZED WORKSPACE // LEVEL-5 CLEARANCE
        </div>
      </footer>

      {/* JWT Inspector Modal */}
      {showJwtInspector && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#DC2626] rounded-xs max-w-xl w-full p-6 space-y-4 font-mono-data text-xs shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-[#DC2626]" />
                <h3 className="font-display text-xl text-black tracking-wider">
                  RFC 7519 HMAC-SHA256 (HS256) SPECIFICATION
                </h3>
              </div>
              <button
                onClick={() => setShowJwtInspector(false)}
                className="text-zinc-500 hover:text-black cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-zinc-600">
              BLACK S.H.E.E.P. signs cryptographic JSON Web Tokens with HS256 to ensure authenticated session integrity for Akash Sankar and Alfa Alias across their synchronized workspace.
            </p>
            <div className="p-3 bg-zinc-50 rounded border border-zinc-200 text-[11px] text-black overflow-x-auto">
              <code>
                {`{
  "alg": "HS256",
  "typ": "JWT"
}
.
{
  "sub": "user_alfa_02",
  "name": "Alfa Alias",
  "role": "Psychological Advisor",
  "clearance": "LEVEL-5",
  "iss": "black-sheep-auth-server",
  "sharedWorkspace": "akash-alfa-sync-01"
}`}
              </code>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowJwtInspector(false)}
                className="px-4 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xs font-bold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
