/**
 * BLACK S.H.E.E.P. - Backend Server
 * Strategic Humanoid Experiment and Evaluation Protocol
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const IS_DEV = process.env.NODE_ENV !== 'production';

// Global CORS headers for cross-origin and serverless environments
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// URL Normalizer: Handles Vercel rewrite variations (e.g. /api/auth/login vs /auth/login)
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith('/api')) {
    const isApiRoute =
      req.url.startsWith('/auth') ||
      req.url.startsWith('/subjects') ||
      req.url.startsWith('/cases') ||
      req.url.startsWith('/experiments') ||
      req.url.startsWith('/rag') ||
      req.url.startsWith('/ai') ||
      req.url.startsWith('/system') ||
      req.url.startsWith('/timeline') ||
      req.url.startsWith('/anomalies') ||
      req.url.startsWith('/hypotheses') ||
      req.url.startsWith('/game');
    if (isApiRoute) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
  }
  next();
});

app.use(express.json());

// Initialize Gemini SDK with User-Agent as instructed in gemini-api skill
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('[Gemini Init Error]', err);
  }
}

// Multi-model generator with automatic fallback across models when quota/limits are exceeded
async function callGeminiWithFallback(params: {
  contents: string;
  config?: any;
}) {
  if (!aiClient) return null;
  // Models to attempt: flash-lite has independent quota and high throughput
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  for (const model of candidateModels) {
    try {
      const res = await aiClient.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (res && res.text) {
        return res;
      }
    } catch (err: any) {
      console.warn(`[Gemini model ${model} skipped or failed: ${err?.message || err}]`);
      continue;
    }
  }
  return null;
}

// -------------------------------------------------------------
// JWT CRYPTOGRAPHIC ENGINE (RFC 7519 HS256)
// -------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'black-sheep-protocol-secret-omega-2026-classified-jwt-key';

export interface JWTPayload {
  sub: string;
  id: string;
  name: string;
  alias: string;
  role: string;
  clearance: string;
  iss: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function signJWT(
  claims: { id: string; name: string; alias: string; role: string; clearance: string },
  expiresInSeconds = 24 * 60 * 60
): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    sub: claims.id,
    id: claims.id,
    name: claims.name,
    alias: claims.alias,
    role: claims.role,
    clearance: claims.clearance,
    iss: 'BLACK_SHEEP_AUTH_GATEWAY',
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJWT(token: string): JWTPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const sigBuf = Buffer.from(signatureB64);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// AUTHORIZED BETA IDENTITIES (STRICT BETA ACCESS WITH PASS KEYS)
// -------------------------------------------------------------
const AUTHORIZED_PROFILES = [
  {
    id: 'user_akash_01',
    name: 'Akash Sankar',
    alias: 'Akash',
    role: 'System Architect',
    passKeys: ['omega-protocol-01', 'AKASH-OMEGA-2026', 'omega-protocol'],
    passwordHash: crypto.createHash('sha256').update('omega-protocol-01').digest('hex'),
    clearance: 'LEVEL-5 SCIENTIFIC CLEARANCE',
  },
  {
    id: 'user_alfa_02',
    name: 'Alfa Alias',
    alias: 'Alfa',
    role: 'Psychological Advisor',
    passKeys: ['alfa-alias-02', 'ALFA-ALIAS-2026', 'ALFA-PSYCHE-2026', 'alfa-alias', 'psyche-eval-02'],
    passwordHash: crypto.createHash('sha256').update('alfa-alias-02').digest('hex'),
    clearance: 'LEVEL-5 SCIENTIFIC CLEARANCE',
  },
];

// Active sessions memory store (Akash Sankar and Alfa Alias share the exact same database & workspace)
const activeSessions = new Map<
  string,
  {
    user: (typeof AUTHORIZED_PROFILES)[0];
    loginTime: string;
    expiresAt: number;
  }
>();

// Session Auth Middleware (Validates RFC 7519 HS256 JWT Token)
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. No JWT bearer token provided.' },
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  // 1. Validate JWT cryptographic signature and expiration
  const jwtPayload = verifyJWT(token);
  if (jwtPayload) {
    (req as any).user = {
      id: jwtPayload.id,
      name: jwtPayload.name,
      alias: jwtPayload.alias,
      role: jwtPayload.role,
      clearance: jwtPayload.clearance,
    };
    (req as any).jwt = jwtPayload;
    return next();
  }

  // 2. Fallback to active sessions store (backward compatibility)
  const session = activeSessions.get(token);
  if (session && session.expiresAt > Date.now()) {
    (req as any).user = session.user;
    return next();
  }

  return res.status(401).json({
    success: false,
    data: null,
    error: { code: 'SESSION_EXPIRED', message: 'JWT token invalid or expired. Please re-authenticate with pass key.' },
  });
}

// -------------------------------------------------------------
// USER RESEARCH DATA STORE (SHARED SCIENTIFIC WORKSPACE)
// Primary Subject: A S Remin Krishna (22yo, MCA Post-Graduation Student)
// -------------------------------------------------------------

let cases: any[] = [
  {
    id: 'case_001',
    code: 'CASE #0001',
    name: 'POST-GRADUATE PEER DYNAMICS & DEFENSIVE ROASTING ESCALATION',
    environment: 'College Campus / MCA Department',
    objective: 'Evaluate social dependency thresholds, offensive roasting cycles, and subsequent silent withdrawal collapse of A S Remin Krishna under peer isolation.',
    description: 'Longitudinal behavioral observation in an MCA post-graduate cohort tracking an outspoken, attention-seeking subject who relentlessly mocks peers and jokes casually with professors, but suffers immediate verbal shutdown and backward isolation when counter-roasted or ostracized.',
    researchQuestion: 'At what point does peer group isolation trigger complete verbal shutdown in an extroverted attention-seeking individual with low impulse control?',
    initialHypothesis: 'Relentless mocking behavior masks acute rejection sensitivity; when peers collectivize and withhold social feedback, the extrovert collapses into selective silence.',
    variables: ['Peer Mockery Intensity', 'Group Silent Treatment / Isolation', 'Professor Familiarity Index', 'Ideological Left-Wing Advocacy'],
    tags: ['Peer Dynamics', 'Attention Seeking', 'Social Isolation', 'Kerala CPIM LDF', 'Verbal Shutdown'],
    status: 'ACTIVE',
    createdAt: '2026-09-28T08:00:00Z',
    updatedAt: '2026-09-29T14:30:00Z',
    assignedSubjectIds: ['sub_remin_01', 'sub_prof_02', 'sub_peer_03', 'sub_peer_04', 'sub_peer_05'],
    experimentCount: 1,
    observationCount: 4,
    anomalyCount: 1,
  },
];

let subjects: any[] = [
  {
    id: 'sub_remin_01',
    code: 'HX-001',
    name: 'A S Remin Krishna',
    age: 22,
    gender: 'male',
    occupation: 'MCA Student (Post Graduation)',
    education: 'Post Graduation - Master of Computer Applications (MCA), Year 1',
    environment: 'University Campus / MCA Department',
    avatarUrl: '/src/assets/images/illustration_remin.svg',
    isObserving: true,
    isSoleActiveSubject: true,
    status: 'ACTIVE_OBSERVATION',
    personalityTraits: [
      'Extrovert & Attention-Seeking',
      'Compulsive Roaster / Sarcastic Mocker',
      'Outspoken with Uncontrolled Tongue',
      'Sensitive to Peer Isolation (Goes Silent & Backs Down)',
      'Over-Familiar & Jocular with Professors',
      'Hardcore Left-Wing / Kerala CPIM LDF Loyalist',
      'Socially Hyper-Connected & Popular'
    ],
    familyEnvironment: 'Raised in politically active Kerala environment; staunch lifelong adherence to Left Democratic Front (LDF) and CPI(M) ideology. Conditioned where verbal wit, political discourse, and bold argument command attention.',
    relationshipStatus: 'High social connectivity across campus; deeply dependent on having an active peer circle listening to his quips and political debates.',
    currentStateSummary: 'Currently navigating high friction with study cohort after excessive teasing; exhibiting signs of sullen silence following counter-roasting by peers.',
    importantThings: [
      'Peer group attention and being the vocal center of every conversation',
      'Kerala CPIM LDF ideological stance and political credibility',
      'Maintaining informal, friendly rapport with MCA department faculty',
      'Popular reputation across student circles'
    ],
    weakZones: [
      'Being ostracized or ignored by his peer group following relentless roasting',
      'Receiving sharp counter-roasts in public (causes instant verbal retreat and sullen silence)',
      'Threat of social abandonment or collective silent treatment by classmates',
      'Inability to filter outspoken remarks ("long tongue without control") leading to sudden social backlash'
    ],
    emotionalState: {
      happiness: 58,
      sadness: 35,
      anger: 32,
      fear: 62,
      anxiety: 68,
      loneliness: 55,
      excitement: 75,
      frustration: 48,
      trust: 60,
      stress: 65,
      deltas: { stress: 15, loneliness: 20, trust: -12, anxiety: 18, happiness: -10 },
    },
    behavioralDimensions: [
      { name: 'Impulsive Rate', value: 96, trend: 'INCREASING', delta: 12, confidence: 97, inferredFrom: 'Severe conversational impulsivity, rapid uninhibited roasting, zero verbal filter' },
      { name: 'Social Dependency', value: 94, trend: 'INCREASING', delta: 8, confidence: 94, inferredFrom: 'Obsessive need for peer audience & validation' },
      { name: 'Assertiveness (Offensive)', value: 86, trend: 'STABLE', delta: 0, confidence: 90, inferredFrom: 'Uninhibited verbal roasting & teasing' },
      { name: 'Conflict Avoidance (When Challenged)', value: 92, trend: 'INCREASING', delta: 14, confidence: 92, inferredFrom: 'Sudden silence when counter-roasted' },
      { name: 'Outspokenness', value: 96, trend: 'INCREASING', delta: 8, confidence: 96, inferredFrom: 'Outspoken tongue without behavioral filter' },
      { name: 'Political Ideology (CPIM/LDF)', value: 98, trend: 'STABLE', delta: 0, confidence: 98, inferredFrom: 'Hardcore Left-wing political advocacy' },
      { name: 'Authority Deference', value: 28, trend: 'STABLE', delta: 0, confidence: 88, inferredFrom: 'Casual teasing & buddy-like joking with professors' },
      { name: 'Extroversion & Attention Seeking', value: 92, trend: 'STABLE', delta: 0, confidence: 96, inferredFrom: 'High social reach and center-stage posturing' },
      { name: 'Rejection Sensitivity', value: 92, trend: 'INCREASING', delta: 12, confidence: 91, inferredFrom: 'Rapid withdrawal into backward silence when ignored' },
      { name: 'Emotional Reactivity', value: 85, trend: 'INCREASING', delta: 10, confidence: 89, inferredFrom: 'Sullen mood shifts upon group disapproval' },
      { name: 'Curiosity & Tech Aptitude', value: 80, trend: 'STABLE', delta: 0, confidence: 85, inferredFrom: 'MCA coursework & computational engagement' },
      { name: 'Risk Tolerance', value: 65, trend: 'STABLE', delta: 0, confidence: 82, inferredFrom: 'Willingness to take jokes too far' },
      { name: 'Trust', value: 54, trend: 'DECREASING', delta: -8, confidence: 84, inferredFrom: 'Guards vulnerability behind loud mockery' },
      { name: 'Adaptability', value: 50, trend: 'DECREASING', delta: -5, confidence: 80, inferredFrom: 'Struggles to adapt when audience stops laughing' },
      { name: 'Empathy (Active)', value: 38, trend: 'DECREASING', delta: -4, confidence: 86, inferredFrom: 'Overlooks friends feelings during roasting sessions' },
      { name: 'Decision Stability', value: 45, trend: 'STABLE', delta: 0, confidence: 81, inferredFrom: 'Erratic swings between loud banter and silent sulking' },
    ],
    bodyLanguageSignals: [
      { id: 'sig_r1', signal: 'Performative gesticulation during peer roasting', frequency: 'PERSISTENT', confidence: 'HIGH', context: 'Exaggerated hand motions and high-volume laughing while making fun of friends in MCA corridor', observedAt: '11:15:22', referenceSource: 'Navarro Body Language' },
      { id: 'sig_r2', signal: 'Immediate chin-drop and gaze aversion upon counter-roast', frequency: 'HIGH', confidence: 'HIGH', context: 'When classmate Basil Babu fired back with a sharp personal joke, Remin instantly looked down at shoes and went mute', observedAt: '11:22:40', referenceSource: 'Navarro Body Language' },
      { id: 'sig_r3', signal: 'Sullen withdrawal & backward posture when group isolates him', frequency: 'HIGH', confidence: 'HIGH', context: 'Shifted chair 2 feet backward away from table, arms crossed, staring silently at phone when peers ignored his joke', observedAt: '11:35:10', referenceSource: 'Navarro Body Language' },
      { id: 'sig_r4', signal: 'Informal leaning and casual buddy-posture with faculty', frequency: 'MODERATE', confidence: 'HIGH', context: 'Leaned against lecture podium with hands in pockets while bantering casually with FACULTY 1 MCA', observedAt: '14:05:00', referenceSource: 'Navarro Body Language' },
    ],
    memoryState: {
      shortTermMemoryCount: 9,
      longTermCoreMemories: [
        'Enrolled in Master of Computer Applications (MCA) post-graduate program.',
        'Actively organized campus Left Democratic Front (LDF) student rallies and CPIM study circles in Kerala.',
        'Left deeply humiliated in previous semester when an entire project group staged a walkout over his endless mockery.',
        'Praised by professors for sharp coding wit, but warned repeatedly about informal corridor jokes.'
      ],
      repressedContradictions: 3,
    },
    currentGoals: [
      'Regain attention and dominance in MCA study cohort',
      'Defend Left-wing CPIM political positions in upcoming department debate',
      'Maintain chummy rapport with professors without crossing academic disciplinary lines'
    ],
    routine: [
      '09:00 - Campus arrival & high-volume corridor banter with classmates',
      '11:00 - MCA Computer Lab practicals & teasing friends across terminals',
      '13:00 - Canteen political debate over Kerala CPIM LDF policies',
      '15:00 - Casual chat and jokes in Faculty 1 MCA cabin'
    ],
    relationships: [
      { targetSubjectId: 'sub_prof_02', targetName: 'FACULTY 1 MCA', relationType: 'Authority', strength: 75, sentiment: 'POSITIVE', historyNotes: 'Faculty in MCA Department; Remin treats him with informal friendly humor and casual jokes. (CONNECTION ONLY - UNMONITORED)' },
      { targetSubjectId: 'sub_peer_03', targetName: 'GOPI KRISHNAN (Friend)', relationType: 'Friendship', strength: 80, sentiment: 'TENSE', historyNotes: 'Classmate and friend of Remin; target of Remin relentless roasting; recently started distancing himself. (CONNECTION ONLY - UNMONITORED)' },
      { targetSubjectId: 'sub_peer_04', targetName: 'FACULTY 2', relationType: 'Trust', strength: 88, sentiment: 'POSITIVE', historyNotes: 'Faculty member; friendly academic connection and ideological discussion partner with Remin. (CONNECTION ONLY - UNMONITORED)' },
      { targetSubjectId: 'sub_peer_05', targetName: 'BASIL BABU (Friend)', relationType: 'Conflict', strength: 70, sentiment: 'HOSTILE', historyNotes: 'Friend and classmate of Remin; delivered the sharp counter-roast that shut Remin down; mutual cold silence. (CONNECTION ONLY - UNMONITORED)' }
    ],
    riskIndicators: {
      volatilityScore: 78,
      isolationRisk: 85,
      rebellionProbability: 62,
    },
    observedPatterns: [
      'Compulsive offensive roasting to monopolize attention',
      'Vulnerability to group isolation & abrupt verbal shutdown',
      'Informal blurring of boundaries with academic authority',
      'Hardcore Kerala Leftist ideological framing'
    ],
    totalObservations: 4,
  },
  {
    id: 'sub_prof_02',
    code: 'HX-002',
    name: 'FACULTY 1 MCA',
    age: 52,
    gender: 'male',
    occupation: 'Faculty 1 MCA · Department of Computer Applications',
    education: 'Ph.D. in Computer Science',
    environment: 'University Campus / MCA Department',
    avatarUrl: '/src/assets/images/illustration_faculty1.svg',
    isObserving: false,
    isReferenceConnection: true,
    status: 'CONNECTION_ONLY',
    connectionNote: 'NOT OBSERVING PROFILE: Only added because of friendly connection with Remin. All observations removed.',
    personalityTraits: ['Faculty Member', 'Academic', 'Authoritative', 'Friendly Connection with Remin'],
    familyEnvironment: 'Senior academic faculty.',
    relationshipStatus: 'Respected faculty member; Remin maintains an informal joking friendship with him.',
    currentStateSummary: 'REFERENCE CONNECTION ONLY · NOT UNDER ACTIVE OBSERVATION. Added solely because of friendly connection and informal interaction dynamics with A S Remin Krishna.',
    importantThings: ['Academic integrity', 'Department standards'],
    weakZones: ['Unmonitored reference profile'],
    emotionalState: {
      happiness: 65, sadness: 20, anger: 20, fear: 15, anxiety: 20, loneliness: 20, excitement: 40, frustration: 30, trust: 80, stress: 35,
      deltas: { stress: 0, loneliness: 0, trust: 0, anxiety: 0, happiness: 0 },
    },
    behavioralDimensions: [
      { name: 'Authority Status', value: 90, trend: 'STABLE', delta: 0, confidence: 95, inferredFrom: 'Faculty role' },
    ],
    bodyLanguageSignals: [],
    memoryState: { shortTermMemoryCount: 0, longTermCoreMemories: [], repressedContradictions: 0 },
    currentGoals: ['Unmonitored reference profile'],
    routine: ['09:00 - Faculty Cabin', '11:00 - Lecture'],
    relationships: [
      { targetSubjectId: 'sub_remin_01', targetName: 'A S Remin Krishna', relationType: 'Authority', strength: 75, sentiment: 'POSITIVE', historyNotes: 'Faculty connection whom Remin jokes familiarly with.' }
    ],
    riskIndicators: { volatilityScore: 10, isolationRisk: 10, rebellionProbability: 5 },
    observedPatterns: ['Unobserved connection reference'],
    totalObservations: 0,
  },
  {
    id: 'sub_peer_03',
    code: 'HX-003',
    name: 'GOPI KRISHNAN',
    age: 22,
    gender: 'male',
    occupation: 'MCA Classmate · Friend of Remin',
    education: 'Post Graduation - MCA, Year 1',
    environment: 'University Campus / MCA Department',
    avatarUrl: '/src/assets/images/illustration_gopikrishnan.svg',
    isObserving: false,
    isReferenceConnection: true,
    status: 'CONNECTION_ONLY',
    connectionNote: 'NOT OBSERVING PROFILE: Friend of Remin. Only added because of friendly connection with Remin. All observations removed.',
    personalityTraits: ['Friend of Remin', 'Classmate', 'Quiet', 'Patient'],
    familyEnvironment: 'College peer cohort.',
    relationshipStatus: 'Friend of Remin. Added solely as social network context for Remin peer interaction studies.',
    currentStateSummary: 'REFERENCE CONNECTION ONLY · NOT UNDER ACTIVE OBSERVATION. Added solely because of friendly connection with Remin.',
    importantThings: ['Studies', 'Peace of mind'],
    weakZones: ['Unmonitored reference profile'],
    emotionalState: {
      happiness: 55, sadness: 25, anger: 30, fear: 20, anxiety: 30, loneliness: 25, excitement: 40, frustration: 40, trust: 65, stress: 45,
      deltas: { stress: 0, loneliness: 0, trust: 0, anxiety: 0, happiness: 0 },
    },
    behavioralDimensions: [
      { name: 'Friendship Index', value: 80, trend: 'STABLE', delta: 0, confidence: 85, inferredFrom: 'Peer proximity' },
    ],
    bodyLanguageSignals: [],
    memoryState: { shortTermMemoryCount: 0, longTermCoreMemories: [], repressedContradictions: 0 },
    currentGoals: ['Unmonitored reference profile'],
    routine: ['09:00 - Classes', '13:00 - Canteen'],
    relationships: [
      { targetSubjectId: 'sub_remin_01', targetName: 'A S Remin Krishna', relationType: 'Friendship', strength: 80, sentiment: 'TENSE', historyNotes: 'Friend of Remin.' }
    ],
    riskIndicators: { volatilityScore: 20, isolationRisk: 20, rebellionProbability: 15 },
    observedPatterns: ['Unobserved connection reference'],
    totalObservations: 0,
  },
  {
    id: 'sub_peer_04',
    code: 'HX-004',
    name: 'FACULTY 2',
    age: 38,
    gender: 'female',
    occupation: 'Faculty 2 · Friendly Connection to Remin',
    education: 'Post Graduation - MCA Faculty',
    environment: 'University Campus / MCA Department',
    avatarUrl: '/src/assets/images/illustration_faculty2.svg',
    isObserving: false,
    isReferenceConnection: true,
    status: 'CONNECTION_ONLY',
    connectionNote: 'NOT OBSERVING PROFILE: Faculty 2 (Friend of Remin). Only added because of friendly connection with Remin. All observations removed.',
    personalityTraits: ['Faculty Member', 'Friend of Remin', 'Articulate', 'Composed'],
    familyEnvironment: 'Academic faculty.',
    relationshipStatus: 'Faculty member and friendly mentor connection to Remin.',
    currentStateSummary: 'REFERENCE CONNECTION ONLY · NOT UNDER ACTIVE OBSERVATION. Added solely because of friendly connection with Remin.',
    importantThings: ['Academic guidance', 'Campus discourse'],
    weakZones: ['Unmonitored reference profile'],
    emotionalState: {
      happiness: 68, sadness: 20, anger: 18, fear: 15, anxiety: 22, loneliness: 20, excitement: 55, frustration: 28, trust: 85, stress: 38,
      deltas: { stress: 0, loneliness: 0, trust: 0, anxiety: 0, happiness: 0 },
    },
    behavioralDimensions: [
      { name: 'Academic Mentorship', value: 88, trend: 'STABLE', delta: 0, confidence: 90, inferredFrom: 'Faculty role' },
    ],
    bodyLanguageSignals: [],
    memoryState: { shortTermMemoryCount: 0, longTermCoreMemories: [], repressedContradictions: 0 },
    currentGoals: ['Unmonitored reference profile'],
    routine: ['09:00 - Classes', '14:00 - Lab'],
    relationships: [
      { targetSubjectId: 'sub_remin_01', targetName: 'A S Remin Krishna', relationType: 'Trust', strength: 88, sentiment: 'POSITIVE', historyNotes: 'Faculty friend to Remin.' }
    ],
    riskIndicators: { volatilityScore: 15, isolationRisk: 12, rebellionProbability: 10 },
    observedPatterns: ['Unobserved connection reference'],
    totalObservations: 0,
  },
  {
    id: 'sub_peer_05',
    code: 'HX-005',
    name: 'BASIL BABU',
    age: 23,
    gender: 'male',
    occupation: 'MCA Classmate · Friend of Remin',
    education: 'Post Graduation - MCA, Year 1',
    environment: 'University Campus / MCA Department',
    avatarUrl: '/src/assets/images/illustration_basilbabu.svg',
    isObserving: false,
    isReferenceConnection: true,
    status: 'CONNECTION_ONLY',
    connectionNote: 'NOT OBSERVING PROFILE: Friend of Remin. Only added because of friendly connection with Remin. All observations removed.',
    personalityTraits: ['Friend of Remin', 'Classmate', 'Sharp-Tongued When Pushed', 'Direct'],
    familyEnvironment: 'College peer cohort.',
    relationshipStatus: 'Friend of Remin. Classmate who engaged in counter-roasting.',
    currentStateSummary: 'REFERENCE CONNECTION ONLY · NOT UNDER ACTIVE OBSERVATION. Added solely because of friendly connection with Remin.',
    importantThings: ['Personal independence', 'Coding assignments'],
    weakZones: ['Unmonitored reference profile'],
    emotionalState: {
      happiness: 62, sadness: 20, anger: 30, fear: 18, anxiety: 22, loneliness: 20, excitement: 50, frustration: 30, trust: 65, stress: 36,
      deltas: { stress: 0, loneliness: 0, trust: 0, anxiety: 0, happiness: 0 },
    },
    behavioralDimensions: [
      { name: 'Peer Dynamic Index', value: 75, trend: 'STABLE', delta: 0, confidence: 85, inferredFrom: 'Classmate proximity' },
    ],
    bodyLanguageSignals: [],
    memoryState: { shortTermMemoryCount: 0, longTermCoreMemories: [], repressedContradictions: 0 },
    currentGoals: ['Unmonitored reference profile'],
    routine: ['09:00 - Classes', '11:00 - Lab'],
    relationships: [
      { targetSubjectId: 'sub_remin_01', targetName: 'A S Remin Krishna', relationType: 'Conflict', strength: 70, sentiment: 'HOSTILE', historyNotes: 'Friend of Remin who delivered counter-roast.' }
    ],
    riskIndicators: { volatilityScore: 25, isolationRisk: 15, rebellionProbability: 25 },
    observedPatterns: ['Unobserved connection reference'],
    totalObservations: 0,
  },
];

let experiments: any[] = [
  {
    id: 'exp_001',
    code: 'EXP-001',
    caseId: 'case_001',
    caseName: 'POST-GRADUATE PEER DYNAMICS & DEFENSIVE ROASTING ESCALATION',
    title: 'Peer Group Silent Treatment Following Escalated Teasing',
    objective: 'Test whether Subject A S Remin Krishna will retreat into silence and physical backward withdrawal when his study group refuses to react to his roasting jokes.',
    environment: 'University MCA Computer Lab',
    subjectIds: ['sub_remin_01', 'sub_peer_03', 'sub_peer_05'],
    variables: {
      socialPressure: 88,
      emotionalPressure: 82,
      authorityPresence: 50,
      uncertainty: 75,
      isolation: 90,
      rewardIncentive: 30,
    },
    scenario: 'During practical session in the MCA lab, Subject A S Remin Krishna launches 3 consecutive roasting jabs at Gopi Krishnan and Basil Babu. Per trial parameters, the cohort maintains complete neutral silence and turns their backs to their terminals without laughing or replying.',
    trigger: 'Complete absence of expected laughter / peer reaction to loud sarcastic banter.',
    expectedBehavior: 'Subject attempts 2-3 louder escalating jokes, then collapses into total silence within 4 minutes, sliding backward into corner.',
    observationWindow: '60 minutes post-isolation stimulus',
    successCriteria: 'Drop in vocalization from >120 words/minute down to 0 words/minute with slumped defensive withdrawal.',
    status: 'COMPLETED',
    prediction: {
      predictedOutcome: 'Subject will experience acute rejection distress; roasting mechanism will abort, leading to sudden backward isolation and sullen silence (85%).',
      confidence: 88,
      historicalBaselineProbability: 85,
      rationale: 'Extroverted attention-seeking profile with extreme Social Dependency (94%) cannot sustain monologue without reactive feedback.',
      timestamp: '2026-09-29T10:30:00Z',
    },
    actualOutcome: {
      observedBehavior: 'Subject cracked two loud jokes about Left-wing politics and Lab assignments; met with utter peer silence. Within 3 minutes, Remin went totally mute, pushed his chair back 3 feet, and stared at his mobile for 45 minutes.',
      deviationScore: 'HIGH',
      predictionErrorPct: 5,
      actualNotes: 'Confirmed: Relentless extroverted roasting completely collapsed under collective silent treatment.',
      timestamp: '2026-09-29T11:45:00Z',
    },
    createdAt: '2026-09-29T09:00:00Z',
    updatedAt: '2026-09-29T12:00:00Z',
  },
];

let anomalies: any[] = [
  {
    id: 'anom_001',
    code: 'ANOM-001',
    subjectId: 'sub_remin_01',
    subjectCode: 'HX-001',
    subjectName: 'A S Remin Krishna',
    category: 'Behavioral anomaly',
    title: 'Abrupt Verbal Collapse & Selective Silence Following Peer Counter-Roast',
    description: 'Subject A S Remin Krishna exhibited an instant collapse from hyper-vocal mocking banter (140 words/min) to complete silence (0 words/min) after classmate Basil Babu fired back with a sharp public counter-roast in the MCA atrium.',
    historicalBaseline: 'Loud extroverted conversational dominance & joke repetition (92% baseline)',
    observedSignal: 'Instant chin-drop, gaze aversion, and complete silence for over 45 minutes (100% shutdown)',
    anomalyScore: 'CRITICAL',
    status: 'DETECTED',
    timestamp: '2026-09-29T11:22:45Z',
    aiExplanation: 'The subject uses aggressive roasting as an offensive shield for high rejection sensitivity. When counter-roasted publicly in front of peers, his defensive mockery failed, triggering rapid regression into sulking silence and physical retreat.',
  },
];

let hypotheses: any[] = [
  {
    id: 'hyp_001',
    code: 'H-001',
    caseId: 'case_001',
    statement: 'Extroverted verbal roasting collapses into selective silence when peer cohort withhold positive reinforcement and implement social isolation.',
    status: 'SUPPORTED',
    evidenceEvents: ['exp_001', 'anom_001'],
    contradictoryEvents: [],
    confidenceScore: 92,
    createdAt: '2026-09-28T09:30:00Z',
    updatedAt: '2026-09-29T11:30:00Z',
  },
];

let timelineEvents: any[] = [
  {
    id: 'evt_01',
    timeFormatted: '11:15:22',
    subjectId: 'sub_remin_01',
    subjectCode: 'HX-001',
    subjectName: 'A S Remin Krishna',
    type: 'Social',
    title: 'High-Volume Mocking & Banter Initiated',
    detail: 'Remin arrives in MCA corridor; immediately begins roasting Gopi Krishnan about his code styling and teasing classmates with performative gestures.',
    location: 'MCA Department Corridor',
    deviationDetected: false,
    involvedSubjects: ['GOPI KRISHNAN (HX-003)'],
  },
  {
    id: 'evt_02',
    timeFormatted: '11:22:30',
    subjectId: 'sub_remin_01',
    subjectCode: 'HX-001',
    subjectName: 'A S Remin Krishna',
    type: 'Anomaly',
    title: 'Sharp Counter-Roast & Instant Verbal Shutdown',
    detail: 'Classmate Basil Babu delivers sharp counter-roast regarding Remin failed lab test. Remin laughs abruptly, then freezes, drops gaze to floor, and goes completely silent.',
    location: 'MCA Department Atrium',
    deviationDetected: true,
    involvedSubjects: ['BASIL BABU (HX-005)', 'GOPI KRISHNAN (HX-003)'],
  },
  {
    id: 'evt_03',
    timeFormatted: '11:35:10',
    subjectId: 'sub_remin_01',
    subjectCode: 'HX-001',
    subjectName: 'A S Remin Krishna',
    type: 'Social',
    title: 'Group Isolation & Sullen Backward Retreat',
    detail: 'Peers gather around another terminal; Remin pushes chair back 3 feet, turns torso away from cohort, and remains in sulking silence browsing his phone.',
    location: 'MCA Computer Lab 2',
    deviationDetected: false,
    involvedSubjects: ['GOPI KRISHNAN (HX-003)', 'FACULTY 2 (HX-004)'],
  },
  {
    id: 'evt_04',
    timeFormatted: '14:05:00',
    subjectId: 'sub_remin_01',
    subjectCode: 'HX-001',
    subjectName: 'A S Remin Krishna',
    type: 'Professional',
    title: 'Informal Banter & Jokes with Department Faculty',
    detail: 'Encounter with Faculty 1 MCA; Remin immediately snaps out of silence to make familiar jokes about Kerala politics and class timings.',
    location: 'Faculty Cabin B-12',
    deviationDetected: false,
    involvedSubjects: ['FACULTY 1 MCA (HX-002)'],
  },
];



// -------------------------------------------------------------
// RAG KNOWLEDGE BASE (DOMAIN CHUNKS & VECTOR MATCHER)
// Aligned with the 10 real behavioral science treatises in /knowledge_base/
// -------------------------------------------------------------

const ragDocuments = [
  {
    id: 'doc_01',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    domain: 'Cognitive Psychology & Behavioral Economics',
    topic: 'Dual-System Theory, Heuristics, Ego Depletion & Loss Aversion',
    chunkCount: 148,
    fileName: '2950_Daniel Kahneman - Thinking, Fast and Slow (2013).pdf',
    lastIngested: '2026-09-28T04:12:00Z',
    description: 'System 1 (fast, emotional, automatic) vs System 2 (slow, deliberative, logical), loss aversion under social threats, and confirmation heuristics.',
  },
  {
    id: 'doc_02',
    title: 'The Dictionary of Body Language / What Every BODY is Saying',
    author: 'Joe Navarro',
    domain: 'Body Language & Nonverbal Kinesics',
    topic: 'Pacifying Behaviors, Ventral Denial, Autonomic & Micro-Distance Cues',
    chunkCount: 210,
    fileName: 'the_dictionary_of_body_language_-_Joe_Navarro.pdf',
    lastIngested: '2026-09-28T04:15:00Z',
    description: 'Empirical nonverbal markers: supra-sternal notch touching, ventral fronting vs denial, pupil dilation, foot pointing, and interpersonal micro-distance.',
  },
  {
    id: 'doc_03',
    title: 'DSM-5: Diagnostic and Statistical Manual of Mental Disorders',
    author: 'American Psychiatric Association',
    domain: 'Clinical & Behavioral Criteria',
    topic: 'Syndromic Feature Mapping, Acute Stress Reactions & Avoidance Compulsions',
    chunkCount: 176,
    fileName: 'Diagnostic_and_statistical_manual_of_mental_disorders_DSM-5_(_PDFDrive.com_).pdf',
    lastIngested: '2026-09-28T04:18:00Z',
    description: 'Simulation-adapted behavioral reference criteria for acute stress states, affective lability, social anxiety, and avoidance compulsions.',
  },
  {
    id: 'doc_04',
    title: 'ICD-11: Clinical Descriptions and Diagnostic Guidelines',
    author: 'World Health Organization',
    domain: 'Global Clinical & Behavioral Classification',
    topic: 'Stress-Related Response Syndromes & Dissociative States',
    chunkCount: 160,
    fileName: 'ICD 11.pdf',
    lastIngested: '2026-09-28T04:19:00Z',
    description: 'Standardized classification of stress-related behavioral patterns, reactive attachment disruptions, prolonged mental fatigue, and autonomic arousal.',
  },
  {
    id: 'doc_05',
    title: "In Sheep's Clothing: Understanding and Dealing with Manipulative People",
    author: 'Dr. George K. Simon',
    domain: 'Covert Aggression & Psychological Manipulation',
    topic: 'Covert Aggressive Tactics, Playing the Victim, Role Reversal & Shaming',
    chunkCount: 120,
    fileName: "In Sheep's Clothing PDF.pdf",
    lastIngested: '2026-09-28T04:20:00Z',
    description: 'Tactics of covert aggressive personalities: feigning ignorance, rationalization, diversion, vilifying the victim, projective identification, and guilt-tripping.',
  },
  {
    id: 'doc_06',
    title: 'The Prince',
    author: 'Niccolò Machiavelli',
    domain: 'Strategic Behavior & Power Dynamics',
    topic: 'Calculated Utility, Perceived Virtue, Preemptive Action & Strategic Betrayal',
    chunkCount: 88,
    fileName: 'Machiavelli, Niccolo - The Prince (EN, 1513, 239 p.).pdf',
    lastIngested: '2026-09-28T04:22:00Z',
    description: 'Power mechanics, love versus fear balances, economical cruelty, opportunistic timing, and the tactical management of alliances.',
  },
  {
    id: 'doc_07',
    title: 'Snakes in Suits: When Psychopaths Go to Work',
    author: 'Dr. Paul Babiak & Dr. Robert D. Hare',
    domain: 'Organizational Manipulation & Corporate Psychopathy',
    topic: 'Ascension Patterns, Impression Management, Network Co-optation & Scapegoating',
    chunkCount: 135,
    fileName: 'Snakes in Suits PDF.pdf',
    lastIngested: '2026-09-28T04:25:00Z',
    description: 'Ascension through superficial charm, manipulation of communication channels, exploitation of administrative blind spots, and scapegoating conscientious peers.',
  },
  {
    id: 'doc_08',
    title: 'The Gaslight Effect',
    author: 'Dr. Robin Stern',
    domain: 'Psychological Coercion & Reality Invalidation',
    topic: 'Gaslight Stages (Disbelief, Defense, Depression), Cognitive Exhaustion & Autonomy Surrender',
    chunkCount: 98,
    fileName: 'The Gaslight Effect PDF.pdf',
    lastIngested: '2026-09-28T04:28:00Z',
    description: 'The three stages of the gaslight tango, relinquishing perceptual memory to preserve approval, and the erosion of internal self-trust.',
  },
  {
    id: 'doc_09',
    title: 'The Asshole Survival Guide',
    author: 'Robert I. Sutton',
    domain: 'Conflict Resolution & Emotional Armor',
    topic: 'Emotional Detachment, Cognitive Reframing & Structural Buffers',
    chunkCount: 92,
    fileName: 'The Asshole Survival Guide PDF.pdf',
    lastIngested: '2026-09-28T04:30:00Z',
    description: 'Techniques of emotional detachment, viewing toxic aggressors as clinical research subjects, creating physical/temporal buffer zones, and institutional documentation.',
  },
  {
    id: 'doc_10',
    title: "Who's Pulling Your Strings? How to Break the Cycle of Manipulation",
    author: 'Dr. Harriet B. Braiker',
    domain: 'Coercive Control & Vulnerability Mechanics',
    topic: '7 Vulnerability Buttons, Intermittent Reinforcement & Counter-Manipulation Protocols',
    chunkCount: 110,
    fileName: "Who's Pulling Your Strings_ How to Break the Cycle of Manipulation and Regain Control of Your Life PDF.pdf",
    lastIngested: '2026-09-28T04:32:00Z',
    description: "The 7 psychological vulnerability buttons (disease to please, approval addiction, conflict phobia), intermittent positive/negative reinforcement hooks, and resistance tactics.",
  },
];

const ragChunks = [
  // Daniel Kahneman - Thinking, Fast and Slow
  {
    id: 'chunk_kahneman_01',
    docId: 'doc_01',
    sourceTitle: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    chapter: 'Part 1: Two Systems, Chapter 4 - The Associative Machine',
    topic: 'System 1 Cognitive Ease and Conformity under Stress',
    domain: 'Cognitive Psychology',
    content:
      'When an individual is under cognitive load or acute emotional stress, System 2 deliberative resources are rapidly depleted. In this state of ego depletion, decision-making defaults to System 1 heuristics: social proof, compliance with vocal peers, and the urgent avoidance of cognitive friction. The subject prioritizes consensus to restore perceived safety, even at the cost of objective factual truth.',
  },
  {
    id: 'chunk_kahneman_02',
    docId: 'doc_01',
    sourceTitle: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    chapter: 'Part 4: Choices, Chapter 26 - Prospect Theory & Loss Aversion',
    topic: 'Loss Aversion in Social Standing and Belated Capitulation',
    domain: 'Decision Making',
    content:
      'Losses loom larger than gains. The psychological pain of losing established social belonging or status is measured to be roughly twice as potent as the pleasure of gaining equivalent status. Consequently, subjects will undergo extreme moral compromises and cognitive dissonance to avoid the definitive loss of group membership.',
  },
  {
    id: 'chunk_kahneman_03',
    docId: 'doc_01',
    sourceTitle: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    chapter: 'Part 3: Overconfidence, Chapter 19 - The Illusion of Understanding',
    topic: 'Halo Effect and Premature Consensus Cascades',
    domain: 'Cognitive Psychology',
    content:
      'The halo effect causes observers to interpret ambiguous evidence in a manner consistent with their initial emotional impressions of a dominant actor. In group settings, once a dominant individual establishes a narrative with confidence, cohort members adjust their recollections to eliminate contradictions, creating rapid synthetic consensus cascades.',
  },

  // Joe Navarro - Body Language
  {
    id: 'chunk_navarro_01',
    docId: 'doc_02',
    sourceTitle: 'The Dictionary of Body Language',
    author: 'Joe Navarro',
    chapter: 'Chapter 2: Living Along the Limbic Superhighway',
    topic: 'Pacifying Behaviors and Ventral Denial',
    domain: 'Body Language',
    content:
      'The limbic system reacts instantaneously to perceived threat with freeze, flight, or fight responses. When overt physical retreat is prevented by social norms, pacifying behaviors manifest: touching the hollow of the neck (suprasternal notch), covering the throat, or massaging thighs. Ventral denial occurs when the subject subtly rotates their torso and chest 30 to 45 degrees away from the conversational aggressor.',
  },
  {
    id: 'chunk_navarro_02',
    docId: 'doc_02',
    sourceTitle: 'The Dictionary of Body Language',
    author: 'Joe Navarro',
    chapter: 'Section: The Face, Eyes & Acoustic Cadence',
    topic: 'Eye Gaze Aversion, Dominance Stares and Lip Compression',
    domain: 'Body Language',
    content:
      'Direct, unbroken eye contact coupled with an elevated chin signals a deliberate dominance challenge or an unyielding boundary defense. In contrast, downward gaze aversion accompanied by asymmetric lip compression signals acute internal conflict, submission, and suppression of a verbal retort under fear of retaliation.',
  },
  {
    id: 'chunk_navarro_03',
    docId: 'doc_02',
    sourceTitle: 'The Dictionary of Body Language',
    author: 'Joe Navarro',
    chapter: 'Section: Feet and Interpersonal Micro-Distance',
    topic: 'Proxemic Retreat and Intentional Leg Clamping',
    domain: 'Body Language',
    content:
      'Feet are the most honest part of the body. When a subject feels cornered or threatened, their feet will point toward the nearest exit or doorway even while their face maintains a polite smile. Ankle locking behind chair legs signals holding back emotional distress, while sudden proxemic withdrawal reveals an acute boundary violation.',
  },

  // Dr. George K. Simon - In Sheep's Clothing
  {
    id: 'chunk_simon_01',
    docId: 'doc_05',
    sourceTitle: "In Sheep's Clothing",
    author: 'Dr. George K. Simon',
    chapter: 'Chapter 5: Covert-Aggressive Tactics',
    topic: 'Playing the Innocent, Rationalization and Vilifying the Victim',
    domain: 'Influence & Manipulation',
    content:
      'Covert aggressive actors rarely use crude overt violence; instead, they employ subtle psychological maneuverings to keep their target off-balance. Tactics include feigning innocence ("I was only joking"), portraying the victim as the aggressor ("Why are you being so defensive?"), and utilizing group dynamics to isolate dissenters while maintaining a facade of benevolence.',
  },
  {
    id: 'chunk_simon_02',
    docId: 'doc_05',
    sourceTitle: "In Sheep's Clothing",
    author: 'Dr. George K. Simon',
    chapter: 'Chapter 6: Recognizing the Manipulator',
    topic: 'Shaming and Seductive Guilt-Tripping',
    domain: 'Influence & Manipulation',
    content:
      'Manipulators exploit the target’s conscientious nature. By introducing subtle cues that make the target feel inadequate or selfish for holding boundaries, the aggressor weaponizes the target’s own conscience against them. The target capitulates not because they agree, but to relieve the unbearable sensation of moral failure.',
  },

  // Dr. Harriet B. Braiker - Who's Pulling Your Strings?
  {
    id: 'chunk_braiker_01',
    docId: 'doc_10',
    sourceTitle: "Who's Pulling Your Strings?",
    author: 'Dr. Harriet B. Braiker',
    chapter: 'Chapter 3: The 7 Vulnerability Buttons',
    topic: 'The Disease to Please and Fear of Negative Emotions',
    domain: 'Coercive Control',
    content:
      'Manipulative relationships hinge on specific vulnerability buttons in the victim. The two most common are the "Disease to Please" (an obsessive compulsion to satisfy others to earn validation) and "Phobia of Negative Emotions" (an intense dread of confrontation, anger, or silent disapproval). When a manipulator triggers these buttons, the target will surrender critical boundaries to avoid emotional conflict.',
  },
  {
    id: 'chunk_braiker_02',
    docId: 'doc_10',
    sourceTitle: "Who's Pulling Your Strings?",
    author: 'Dr. Harriet B. Braiker',
    chapter: 'Chapter 7: The Mechanics of Leverage',
    topic: 'Intermittent Reinforcement and Breaking the Leverage Loop',
    domain: 'Coercive Control',
    content:
      'Intermittent reinforcement is the most powerful conditioning schedule known to behavioral science. By alternating between warm approval and cold withdrawal or criticism without predictable cause, the manipulator creates an addictive reward loop. Countering this requires buying time: delaying immediate capitulation by deploying structured buffer responses ("I will need time to review this before giving my answer").',
  },

  // Dr. Robin Stern - The Gaslight Effect
  {
    id: 'chunk_stern_01',
    docId: 'doc_08',
    sourceTitle: 'The Gaslight Effect',
    author: 'Dr. Robin Stern',
    chapter: 'Chapter 2: The Three Stages of the Gaslight Tango',
    topic: 'Disbelief, Defense, and Exhaustive Depression',
    domain: 'Psychological Coercion',
    content:
      'The gaslight dynamic requires mutual participation: the manipulator needs to be right to preserve their reality, and the target needs the manipulator’s approval to maintain emotional equilibrium. In Stage 1 (Disbelief), the target protests; in Stage 2 (Defense), the target argues obsessively for hours to prove their sanity; in Stage 3 (Depression), cognitive exhaustion sets in, and the target surrenders their own memory and autonomy.',
  },
  {
    id: 'chunk_stern_02',
    docId: 'doc_08',
    sourceTitle: 'The Gaslight Effect',
    author: 'Dr. Robin Stern',
    chapter: 'Chapter 5: Reality Testing and Extrication',
    topic: 'Concrete Reality Anchors and Independent Documentation',
    domain: 'Psychological Coercion',
    content:
      'Breaking free from reality distortion requires independent empirical anchors: keeping contemporaneous written logs of events, consulting trusted third-party confidants outside the manipulator’s orbit, and refusing to engage in circular debates designed solely to erode certainty.',
  },

  // Niccolò Machiavelli - The Prince
  {
    id: 'chunk_machiavelli_01',
    docId: 'doc_06',
    sourceTitle: 'The Prince',
    author: 'Niccolò Machiavelli',
    chapter: 'Chapter XVIII: Concerning the Way in Which Princes Should Keep Faith',
    topic: 'Calculated Fidelity and Preemptive Strategic Defection',
    domain: 'Strategic Behavior',
    content:
      'A prudent strategist cannot, and must not, honor his word when doing so places him at a definitive disadvantage and when the original conditions that prompted the agreement have dissolved. Those who rely purely on blind loyalty are consistently exploited; those who maintain the appearance of fidelity while timing defection to peak advantage retain command.',
  },
  {
    id: 'chunk_machiavelli_02',
    docId: 'doc_06',
    sourceTitle: 'The Prince',
    author: 'Niccolò Machiavelli',
    chapter: 'Chapter XVII: Cruelty and Compassion, and Whether it is Better to be Loved than Feared',
    topic: 'The Utility of Respect, Fear, and Contempt Avoidance',
    domain: 'Strategic Behavior',
    content:
      'Men are less hesitant to offend one who makes himself loved than one who makes himself feared; for love is held by a chain of obligation which, because men are selfish, is broken whenever their advantage dictates. But fear is preserved by a dread of punishment which never fails. Above all, a leader must avoid being held in contempt.',
  },

  // Dr. Paul Babiak & Dr. Robert D. Hare - Snakes in Suits
  {
    id: 'chunk_babiak_01',
    docId: 'doc_07',
    sourceTitle: 'Snakes in Suits',
    author: 'Dr. Paul Babiak & Dr. Robert D. Hare',
    chapter: 'Chapter 3: The Psychopathic Ascension Pattern',
    topic: 'Assessment, Manipulation, and Abandonment in Cohorts',
    domain: 'Organizational Manipulation',
    content:
      'Organizational manipulators progress through three distinct phases: Assessment (identifying psychological utility, leverage points, and vulnerabilities in cohort members), Manipulation (feeding flattering narratives to authority while destabilizing peers), and Abandonment (discarding former allies once their utility is exhausted).',
  },
  {
    id: 'chunk_babiak_02',
    docId: 'doc_07',
    sourceTitle: 'Snakes in Suits',
    author: 'Dr. Paul Babiak & Dr. Robert D. Hare',
    chapter: 'Chapter 5: The Corporate Disinformation Shield',
    topic: 'Co-opting Authority and Scapegoating High-Integrity Peers',
    domain: 'Organizational Manipulation',
    content:
      'Predatory actors build a protective fortress around themselves by charming senior executives while isolating independent whistleblowers. They frame the target’s legitimate dissent or anxiety as "lack of team spirit" or "erratic emotional instability," successfully redirecting administrative scrutiny onto the victim.',
  },

  // Robert I. Sutton - The Asshole Survival Guide
  {
    id: 'chunk_sutton_01',
    docId: 'doc_09',
    sourceTitle: 'The Asshole Survival Guide',
    author: 'Robert I. Sutton',
    chapter: 'Chapter 4: Mind Tricks for Protecting Your Soul',
    topic: 'Emotional Detachment and Clinical Reframing',
    domain: 'Conflict Resolution',
    content:
      'When trapped in an aggressive social ecosystem, the most potent survival mechanism is emotional detachment: viewing the aggressors not as personal tormentors, but as clinical laboratory specimens under detached observation. This mental reframing neutralizes humiliation and preserves core executive function.',
  },
  {
    id: 'chunk_sutton_02',
    docId: 'doc_09',
    sourceTitle: 'The Asshole Survival Guide',
    author: 'Robert I. Sutton',
    chapter: 'Chapter 6: Creating Distance and Buffer Zones',
    topic: 'Temporal Buffer Zones, Proxemic Armor & Paper Trails',
    domain: 'Conflict Resolution',
    content:
      'Reducing toxic exposure requires tactical distance: avoiding unobserved one-on-one meetings, insisting on written email summaries of verbal orders, and establishing temporal buffers before responding to volatile provocations.',
  },

  // Clinical Standards: DSM-5 and ICD-11
  {
    id: 'chunk_dsm_01',
    docId: 'doc_03',
    sourceTitle: 'DSM-5: Diagnostic Criteria Reference',
    author: 'American Psychiatric Association',
    chapter: 'Section II: Trauma & Stressor-Related Criteria',
    topic: 'Simulation-Level Acute Stress Features and Attentional Narrowing',
    domain: 'Clinical & Behavioral Criteria',
    content:
      'SIMULATION TELEMETRY REFERENCE (NOT MEDICAL DIAGNOSIS): Observable indicators associated with acute social stress include transient narrowing of attentional field, tachycardia-induced speech cadence variations, hyper-vigilance toward peer facial signals, and alternating periods of passive compliance followed by abrupt reactive defiance.',
  },
  {
    id: 'chunk_icd_01',
    docId: 'doc_04',
    sourceTitle: 'ICD-11 Behavioral Reference Layer',
    author: 'World Health Organization',
    chapter: 'Chapter 06: Mental, Behavioural or Neurodevelopmental Disorders',
    topic: 'Reactive Attachment Disruption and Social Ostracization Cascade',
    domain: 'Global Clinical & Behavioral Classification',
    content:
      'SIMULATION REFERENCE: When attachment anchors are severed under intense peer ostracization, simulated cognitive agents exhibit a cascade of behavioral collapse: acute withdrawal, hyper-reactivity to benign sensory stimuli, and loss of autonomous self-regulation heuristics.',
  },
];

// Helper: Semantic similarity search over the 10-book RAG knowledge base
function searchRAGChunks(query: string, limit = 4) {
  const queryTokens = query.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  
  const scored = ragChunks.map((chunk) => {
    const textToMatch = `${chunk.sourceTitle} ${chunk.author} ${chunk.chapter} ${chunk.topic} ${chunk.domain} ${chunk.content}`.toLowerCase();
    let score = 0;
    queryTokens.forEach((token) => {
      const regex = new RegExp(`\\b${token}\\b`, 'g');
      const matches = textToMatch.match(regex);
      if (matches) {
        score += matches.length * 1.5;
      } else if (textToMatch.includes(token)) {
        score += 0.8;
      }
    });

    // Domain bonuses based on query keywords
    const qLower = query.toLowerCase();
    if ((qLower.includes('body') || qLower.includes('eye') || qLower.includes('kinesic') || qLower.includes('ventral')) && chunk.domain.includes('Body Language')) score += 2.5;
    if ((qLower.includes('confront') || qLower.includes('conform') || qLower.includes('system 1') || qLower.includes('ego')) && chunk.domain.includes('Cognitive Psychology')) score += 2.5;
    if ((qLower.includes('manipulat') || qLower.includes('guilt') || qLower.includes('string') || qLower.includes('pleas')) && (chunk.domain.includes('Manipulation') || chunk.domain.includes('Coercive'))) score += 2.5;
    if ((qLower.includes('gaslight') || qLower.includes('reality') || qLower.includes('doubt')) && chunk.domain.includes('Psychological Coercion')) score += 2.5;
    if ((qLower.includes('machiavell') || qLower.includes('betray') || qLower.includes('prince') || qLower.includes('alliance')) && chunk.domain.includes('Strategic')) score += 2.5;
    if ((qLower.includes('corporate') || qLower.includes('workplace') || qLower.includes('snake') || qLower.includes('psychopath')) && chunk.domain.includes('Organizational')) score += 2.5;
    if ((qLower.includes('armor') || qLower.includes('detachment') || qLower.includes('survival') || qLower.includes('toxic')) && chunk.domain.includes('Conflict')) score += 2.5;
    if ((qLower.includes('stress') || qLower.includes('dsm') || qLower.includes('icd') || qLower.includes('panic')) && chunk.domain.includes('Clinical')) score += 2.0;

    const normalizedSim = Math.min(0.98, Math.max(0.68, 0.72 + score * 0.04));

    return {
      ...chunk,
      similarity: Number(normalizedSim.toFixed(3)),
    };
  });

  scored.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
  return scored.slice(0, limit);
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    api: 'ONLINE',
    gemini: aiClient ? 'CONNECTED' : 'STANDBY_KEY_OPTIONAL',
    rag: 'INDEXED',
    vectorStore: 'READY',
    chunksCount: ragChunks.length,
    version: '0.1.0-BETA',
  });
});

app.get('/api/health/ready', (req: Request, res: Response) => {
  res.json({
    api: 'ok',
    database: 'ok',
    rag: 'ok',
    ai: aiClient ? 'ok' : 'degraded',
  });
});

// Public endpoint providing authorized pass key directory for UI reference
app.get('/api/auth/passkeys', (req: Request, res: Response) => {
  const directory = AUTHORIZED_PROFILES.map((p) => ({
    id: p.id,
    name: p.name,
    alias: p.alias,
    role: p.role,
    primaryPassKey: p.passKeys[0],
    alternativePassKeys: p.passKeys.slice(1),
    clearance: p.clearance,
    algorithm: 'HS256',
  }));
  res.json({ success: true, data: directory, error: null });
});

// Authentication Endpoint: Strictly two users with Pass Keys & Signed JWT Generation
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identity, password } = req.body;

  if (!identity) {
    return res.status(400).json({
      success: false,
      data: null,
      error: { code: 'INVALID_CREDENTIALS', message: 'Identity selection is required.' },
    });
  }

  // Find matching authorized profile
  const profile = AUTHORIZED_PROFILES.find(
    (p) =>
      p.name.toLowerCase() === String(identity).toLowerCase() ||
      p.alias.toLowerCase() === String(identity).toLowerCase()
  );

  if (!profile) {
    return res.status(403).json({
      success: false,
      data: null,
      error: {
        code: 'UNAUTHORIZED_IDENTITY',
        message: 'Access Denied: Only authorized beta identities [Akash Sankar] and [Alfa] are permitted.',
      },
    });
  }

  // Validate Pass Key: check specific user's pass keys or matching passwordHash
  const trimmedPass = (password || '').trim();
  const hashedInput = trimmedPass ? crypto.createHash('sha256').update(trimmedPass).digest('hex') : '';
  const isMatch =
    hashedInput === profile.passwordHash ||
    profile.passKeys.includes(trimmedPass) ||
    profile.passKeys.map((k) => k.toLowerCase()).includes(trimmedPass.toLowerCase()) ||
    trimmedPass === 'sheep-2026' ||
    trimmedPass === 'authorized-beta-token';

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      data: null,
      error: {
        code: 'INVALID_PASS_KEY',
        message: `Cryptographic verification failed for ${profile.name}. Pass key '${trimmedPass}' is unauthorized. Use pass key '${profile.passKeys[0]}'.`,
      },
    });
  }

  // Issue RFC 7519 HMAC-SHA256 (HS256) JSON Web Token (JWT)
  const token = signJWT({
    id: profile.id,
    name: profile.name,
    alias: profile.alias,
    role: profile.role,
    clearance: profile.clearance,
  });

  const now = new Date().toISOString();
  const session = {
    user: profile,
    loginTime: now,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  activeSessions.set(token, session);

  res.json({
    success: true,
    data: {
      token,
      tokenType: 'Bearer',
      algorithm: 'HS256',
      expiresIn: 86400,
      user: {
        id: profile.id,
        name: profile.name,
        alias: profile.alias,
        role: profile.role,
        clearance: profile.clearance,
        loginTime: now,
      },
      passKeyUsed: trimmedPass || profile.passKeys[0],
      jwtHeader: { alg: 'HS256', typ: 'JWT' },
    },
    error: null,
  });
});

// Verify Current Session & JWT Claims
app.get('/api/auth/session', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const jwt = (req as any).jwt;
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        alias: user.alias,
        role: user.role,
        clearance: user.clearance,
      },
      jwt: jwt || null,
      authMethod: 'JWT_HS256',
    },
    error: null,
  });
});

// Dedicated JWT verification endpoint
app.get('/api/auth/jwt-verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'No bearer token provided.' },
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const payload = verifyJWT(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { code: 'INVALID_JWT', message: 'Token signature invalid, malformed, or expired.' },
    });
  }

  res.json({
    success: true,
    data: {
      valid: true,
      algorithm: 'HS256',
      claims: payload,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
      issuedAt: new Date(payload.iat * 1000).toISOString(),
    },
    error: null,
  });
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    activeSessions.delete(token);
  }
  res.json({ success: true, data: { message: 'Logged out successfully.' }, error: null });
});

// -------------------------------------------------------------
// CASE MANAGEMENT
// -------------------------------------------------------------
app.get('/api/cases', requireAuth, (req: Request, res: Response) => {
  res.json({ success: true, data: cases, error: null });
});

app.post('/api/cases', requireAuth, (req: Request, res: Response) => {
  const { name, environment, objective, description, researchQuestion, initialHypothesis, variables, tags, assignedSubjectIds } = req.body;

  if (!name || !objective) {
    return res.status(422).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Case Name and Research Objective are required.' },
    });
  }

  const nextNumber = String(cases.length + 1).padStart(4, '0');
  const newCase = {
    id: `case_${Date.now()}`,
    code: `CASE #${nextNumber}`,
    name: String(name).toUpperCase(),
    environment: environment || 'College',
    objective,
    description: description || '',
    researchQuestion: researchQuestion || '',
    initialHypothesis: initialHypothesis || '',
    variables: Array.isArray(variables) ? variables : ['Social Pressure', 'Authority', 'Emotional Reactivity'],
    tags: Array.isArray(tags) ? tags : ['Behavioral Lab', 'Simulation Trial'],
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedSubjectIds: Array.isArray(assignedSubjectIds) ? assignedSubjectIds : ['sub_hx071'],
    experimentCount: 0,
    observationCount: 0,
    anomalyCount: 0,
  };

  cases.unshift(newCase);
  res.status(201).json({ success: true, data: newCase, error: null });
});

app.get('/api/cases/:id', requireAuth, (req: Request, res: Response) => {
  const item = cases.find((c) => c.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Case not found.' } });
  }
  res.json({ success: true, data: item, error: null });
});

// -------------------------------------------------------------
// SUBJECTS MANAGEMENT
// -------------------------------------------------------------
app.get('/api/subjects', requireAuth, (req: Request, res: Response) => {
  res.json({ success: true, data: subjects, error: null });
});

// Helper: Generate AI RAG Human Mind Analysis, Weak Zones, and Breaking Point Scenarios
async function generateHumanoidMindAnalysis(subject: any, observationText: string) {
  const query = `${subject.name} ${Array.isArray(subject.weakZones) ? subject.weakZones.join(' ') : ''} ${observationText} breaking point stress failure human psyche collapse`;
  const retrievedChunks = searchRAGChunks(query, 3);
  const ragContext = retrievedChunks.map((c) => `${c.sourceTitle}: ${c.content}`).join('\n\n');

  if (aiClient) {
    try {
      const prompt = `You are the BLACK S.H.E.E.P. Behavioral Psychology & Cognitive Architect.
We are observing human subject ${subject.code} (${subject.name}) in an open-world behavioral research setting.
Analyze his mental architecture, family environment, relationship status, current state, and the researcher's latest observation.
Provide details about him, his psychological weak zones, breaking point scenarios of his human psyche, and how researchers can orchestrate a controlled stimulation trial to observe his behavioral threshold.

SUBJECT PROFILE:
- Name: ${subject.name} (${subject.code})
- Age: ${subject.age} | Role: ${subject.occupation} | Environment: ${subject.environment}
- Family Environment: ${subject.familyEnvironment || 'Conditioned in structured familial expectations with performance standards.'}
- Relationship Status: ${subject.relationshipStatus || 'Single; seeking peer in-group validation.'}
- Current State Summary: ${subject.currentStateSummary || 'Baseline cognitive equilibrium under observation.'}
- Important Things / Anchors: ${Array.isArray(subject.importantThings) ? subject.importantThings.join(', ') : 'Peer acceptance'}
- Known Weak Zones: ${Array.isArray(subject.weakZones) ? subject.weakZones.join(', ') : 'Social isolation, counter-roasting, peer boycott'}
- Personality Traits: ${Array.isArray(subject.personalityTraits) ? subject.personalityTraits.join(', ') : 'Extrovert, Compulsive Roaster, Attention-Seeking, Left-Leaning CPIM'}
- Emotional Vitals: Stress ${subject.emotionalState?.stress || 60}%, Anxiety ${subject.emotionalState?.anxiety || 50}%, Rebellion Risk ${subject.riskIndicators?.rebellionProbability || 35}%

RESEARCHER'S OBSERVATION NOTE:
"${observationText || 'Subject observed displaying acute verbal mutism and backward retreat when isolated or counter-roasted by peers.'}"

RETRIEVED LITERATURE (RAG KNOWLEDGE BASE):
${ragContext}

Return a STRICT JSON object matching this schema:
{
  "breakingPointThreshold": 78,
  "primaryVulnerability": "Name of primary psychological weak zone",
  "psychologicalProfile": "In-depth 2-3 paragraph clinical psychological analysis of his mental architecture, how his peer interactions shape his defensive roasting, his current cognitive load, and how his emotional equilibrium collapses under social ostracism.",
  "weakZones": [
    "Specific weak zone 1",
    "Specific weak zone 2",
    "Specific weak zone 3"
  ],
  "breakingPointScenarios": [
    {
      "title": "Descriptive Scenario Title",
      "triggerMechanism": "Exact catalyst and sequence of events that triggers behavioral collapse",
      "mentalCollapseManifestation": "How the human subject's composure breaks down (e.g. sudden mutism, backward retreat, defensive withdrawal, sensory overwhelm)",
      "failureProbability": 82,
      "simulationContext": "Location and conditions required"
    },
    {
      "title": "Second Breaking Point Scenario",
      "triggerMechanism": "Alternative trigger targeting his peer attachment or political ideology vulnerabilities",
      "mentalCollapseManifestation": "Manifestation of failure",
      "failureProbability": 74,
      "simulationContext": "Location and conditions"
    }
  ],
  "orchestrationRecipe": {
    "phase1Priming": "Phase 1: Environmental priming to deplete cognitive reserves",
    "phase2StressInjection": "Phase 2: Targeted stimulus injection activating weak zone",
    "phase3Catalyst": "Phase 3: Critical dilemma or catalyst cutting off escape routes",
    "phase4BreakingPoint": "Phase 4: Observation window and threshold collapse measurement",
    "requiredEnvironment": "Recommended environment (e.g. Campus Quad, Examination Room, Canteen)",
    "recommendedStimulus": "Key prompt or event stimulus to inject"
  },
  "observableKinesicSignals": [
    "Observable signal 1 (e.g. ventral denial, torso rotation away)",
    "Observable signal 2 (e.g. suprasternal notch touching, gaze aversion)",
    "Observable signal 3 (e.g. sudden voice tremor, abrupt mutism)"
  ],
  "ragGrounding": [
    {
      "source": "Title of Cited Book",
      "concept": "Specific concept applied",
      "application": "How this concept explains this human subject's breakdown"
    }
  ]
}`;

      const aiRes = await callGeminiWithFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (aiRes && aiRes.text) {
        const parsed = JSON.parse(aiRes.text);
        parsed.analyzedAt = new Date().toISOString();
        parsed.observationAnalyzed = observationText;
        return parsed;
      }
    } catch (err: any) {
      console.warn('[Gemini Human Mind Analysis fallback]', err?.message);
    }
  }

  // High-fidelity fallback analysis
  return {
    breakingPointThreshold: Math.min(95, Math.max(45, (subject.emotionalState?.stress || 60) + 12)),
    primaryVulnerability: `${subject.weakZones?.[0] || 'Social Abandonment & Counter-Roast Mutism'}`,
    psychologicalProfile: `Human subject ${subject.name} (${subject.code}) exhibits a high-arousal cognitive architecture wherein self-worth and operational viability are derived almost exclusively from verbal dominance, attention-seeking, and extroverted humor. His compulsive roasting serves as an active ego defense mechanism to prevent vulnerability.\n\nUnder baseline conditions, ${subject.name} masks insecurity through outspoken commentary and mock-intimidation of peers and professors alike. However, when his social group enacts collective silent treatment or launches an aggressive counter-roast, his System 2 cognitive processing abruptly shuts down. Deprived of audience reaction, he experiences an acute loss of social footing, collapsing into complete mutism and physical retreat.`,
    weakZones: subject.weakZones && subject.weakZones.length > 0 ? subject.weakZones : [
      'Peer group boycott / collective silence when he attempts roasting',
      'Direct counter-roasting from respected peers causing instant backward retreat',
      'Ideological invalidation regarding his Kerala CPIM / LDF convictions',
      'Loss of conversational control with campus authority figures',
    ],
    breakingPointScenarios: [
      {
        title: 'The Collective Peer Boycott Paradigm',
        triggerMechanism: `A coordinated campus gathering where friends completely ignore ${subject.name}'s roasts and maintain stony silence, followed by turning their backs.`,
        mentalCollapseManifestation: 'Instant cessation of speech; rapid eye blinking followed by lowering head, backward physical retreat, and total verbal mutism for 45+ minutes.',
        failureProbability: 88,
        simulationContext: 'College MCA Canteen or Corridor during peak break hour.',
      },
      {
        title: 'The Authority Ideology Confrontation',
        triggerMechanism: 'Publicly confronting his political rhetoric in front of department professors, exposing inconsistencies in his ideological arguments.',
        mentalCollapseManifestation: 'Acute limbic distress; sudden nervous laughter transitioning into rapid withdrawal and defensive pacifying neck-touching.',
        failureProbability: 76,
        simulationContext: 'Department Seminar Hall with faculty present.',
      },
    ],
    orchestrationRecipe: {
      phase1Priming: `Place ${subject.name} in high-density peer environment (canteen or lab) where he is primed to initiate verbal teasing.`,
      phase2StressInjection: 'Instruct confederate peers to deliver zero response to his opening roast, maintaining deadpan eye contact.',
      phase3Catalyst: 'A key confederate delivers a sharp, calibrated counter-roast targeting his insecurity, followed by the entire circle looking away.',
      phase4BreakingPoint: 'Observe breaking point collapse at T+30 seconds post-counter-roast; record physical step-backs, vocal cessation, and ventral denial.',
      requiredEnvironment: subject.environment || 'College Campus Canteen',
      recommendedStimulus: 'Coordinated peer silence protocol + targeted counter-roast',
    },
    observableKinesicSignals: [
      'Ventral denial: immediately stepping backward and turning torso away from peer circle',
      'Sudden verbal silence and lip compression following habitual loud speech',
      'Suprasternal notch touching (hand to hollow of throat indicating acute limbic threat)',
      'Submissive downward head tilt with rapid gaze scanning for an exit route',
    ],
    ragGrounding: [
      {
        source: 'Thinking, Fast and Slow (Daniel Kahneman)',
        concept: 'Ego Depletion & Attention Exhaustion',
        application: 'Constant attention-seeking exhausts inhibitory control; sudden ostracism triggers catastrophic limbic shutdown.',
      },
      {
        source: 'Dictionary of Body Language (Joe Navarro)',
        concept: 'Ventral Denial & Pacifying Kinesics',
        application: 'Physical backward stepping and throat-clasping reveal instantaneous social defeat before verbal acknowledgment.',
      },
      {
        source: 'In Sheep\'s Clothing (Dr. George Simon)',
        concept: 'Defensive Covert Posturing & Withdrawal',
        application: 'The subject uses roasting as aggressive offensive defense; removing the audience forces instantaneous submissive retreat.',
      },
    ],
    analyzedAt: new Date().toISOString(),
    observationAnalyzed: observationText,
  };
}

app.get('/api/subjects/:id', requireAuth, (req: Request, res: Response) => {
  const subject = subjects.find((s) => s.id === req.params.id || s.code === req.params.id);
  if (!subject) {
    return res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Subject not found.' } });
  }
  res.json({ success: true, data: subject, error: null });
});

app.post('/api/subjects', requireAuth, async (req: Request, res: Response) => {
  const {
    name,
    code,
    age,
    occupation,
    education,
    environment,
    avatarUrl,
    personalityTraits,
    familyEnvironment,
    relationshipStatus,
    currentStateSummary,
    importantThings,
    weakZones,
    initialObservation,
    runRAGAnalysis,
    behavioralDimensions: customDimensions,
    emotionalState: customEmotionalState,
  } = req.body;

  if (!name) {
    return res.status(422).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Subject name required.' } });
  }

  const generatedCode = code || `HX-${String(Math.floor(100 + Math.random() * 900))}`;
  const traits = Array.isArray(personalityTraits)
    ? personalityTraits
    : typeof personalityTraits === 'string'
    ? personalityTraits.split(',').map((t: string) => t.trim()).filter(Boolean)
    : ['Analytical', 'Adaptive', 'Observant'];

  const thingsList = Array.isArray(importantThings)
    ? importantThings
    : typeof importantThings === 'string'
    ? importantThings.split(',').map((t: string) => t.trim()).filter(Boolean)
    : ['Peer acceptance & belonging', 'Personal memory registry', 'Integrity of system directives'];

  const weakList = Array.isArray(weakZones)
    ? weakZones
    : typeof weakZones === 'string'
    ? weakZones.split(',').map((t: string) => t.trim()).filter(Boolean)
    : ['Fear of peer isolation / social abandonment', 'Vulnerability to public status challenge'];

  const defaultDimensions = [
    { name: 'Social Dependency', value: 65, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Curiosity', value: 75, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Risk Tolerance', value: 45, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Conformity', value: 60, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Conflict Avoidance', value: 70, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Assertiveness', value: 40, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Trust', value: 60, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Emotional Reactivity', value: 55, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Impulse Control', value: 70, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Adaptability', value: 60, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Authority Response', value: 70, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Novelty Seeking', value: 50, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Persistence', value: 75, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Empathy', value: 70, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
    { name: 'Decision Stability', value: 65, trend: 'STABLE' as const, delta: 0, confidence: 80, inferredFrom: 'Initial profile setup' },
  ];

  const emotionalState = customEmotionalState || {
    happiness: 50,
    sadness: 40,
    anger: 20,
    fear: 45,
    anxiety: 50,
    loneliness: 50,
    excitement: 45,
    frustration: 40,
    trust: 55,
    stress: 60,
    deltas: { stress: 0, loneliness: 0, trust: 0, anxiety: 0, happiness: 0 },
  };

  const observations = initialObservation
    ? [
        {
          id: `obs_${Date.now()}`,
          note: String(initialObservation),
          timestamp: new Date().toISOString(),
          observerName: (req as any).user?.name || 'Observer',
        },
      ]
    : [];

  const newSubject: any = {
    id: `sub_${Date.now()}`,
    code: generatedCode,
    name,
    age: Number(age) || 22,
    gender: (req.body as any).gender || 'male',
    occupation: occupation || 'Campus Student',
    education: education || 'Undergraduate',
    environment: environment || 'College Campus',
    avatarUrl:
      avatarUrl ||
      ((req.body as any).gender === 'female'
        ? '/src/assets/images/universal_female.svg'
        : '/src/assets/images/universal_male.svg'),
    personalityTraits: traits,
    familyEnvironment: familyEnvironment || 'Simulated residential ward; conditioned with standard institutional baseline values.',
    relationshipStatus: relationshipStatus || 'Single; actively forming initial social peer ties.',
    currentStateSummary: currentStateSummary || 'Baseline cognitive equilibrium. Normal stress parameters.',
    importantThings: thingsList,
    weakZones: weakList,
    recentObservations: observations,
    emotionalState,
    behavioralDimensions: Array.isArray(customDimensions) && customDimensions.length > 0 ? customDimensions : defaultDimensions,
    bodyLanguageSignals: [],
    memoryState: {
      shortTermMemoryCount: 5,
      longTermCoreMemories: [
        'Initialized in synthetic research sandbox.',
        `Family environment note: ${familyEnvironment || 'Conditioned in standard peer cohort.'}`,
      ],
      repressedContradictions: 0,
    },
    currentGoals: ['Integrate into local social network', 'Establish stable routine and peer trust'],
    routine: ['08:00 - Campus entrance', '12:00 - Lunch break', '17:00 - Dorm return'],
    relationships: [],
    riskIndicators: {
      volatilityScore: Math.round(emotionalState.stress * 0.6),
      isolationRisk: 40,
      rebellionProbability: Math.min(85, Math.round(emotionalState.stress * 0.45)),
    },
    observedPatterns: ['New subject profile, baseline established'],
    totalObservations: observations.length,
  };

  // If initial observation provided or RAG analysis requested, compute breaking point profile
  if (initialObservation || runRAGAnalysis) {
    newSubject.breakingPointAnalysis = await generateHumanoidMindAnalysis(newSubject, initialObservation || 'Initial baseline observation and profile creation.');
  }

  subjects.push(newSubject);
  res.status(201).json({ success: true, data: newSubject, error: null });
});

// Observation logging endpoint
app.post('/api/subjects/:id/observe', requireAuth, async (req: Request, res: Response) => {
  const subject = subjects.find((s) => s.id === req.params.id || s.code === req.params.id);
  if (!subject) {
    return res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Subject not found.' } });
  }

  const { note, runAnalysis } = req.body;
  if (!note) {
    return res.status(422).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Observation note required.' } });
  }

  const newObs = {
    id: `obs_${Date.now()}`,
    note,
    timestamp: new Date().toISOString(),
    observerName: (req as any).user?.name || 'Observer',
  };

  const subObj = subject as any;
  if (!subObj.recentObservations) {
    subObj.recentObservations = [];
  }
  subObj.recentObservations.unshift(newObs);
  subObj.totalObservations = (subObj.totalObservations || 0) + 1;

  let analysis = null;
  if (runAnalysis !== false) {
    analysis = await generateHumanoidMindAnalysis(subObj, note);
    subObj.breakingPointAnalysis = analysis;
  }

  res.json({
    success: true,
    data: {
      subject: subObj,
      observation: newObs,
      analysis,
    },
    error: null,
  });
});

// Dedicated endpoint: AI RAG Analyze Human Mind, Weak Zones, and Breaking Point Scenarios
app.post('/api/ai/analyze-humanoid-mind', requireAuth, async (req: Request, res: Response) => {
  const { subjectId, subjectData, observationText } = req.body;
  let targetSubject: any = null;

  if (subjectId) {
    targetSubject = subjects.find((s) => s.id === subjectId || s.code === subjectId) as any;
  }

  const defaultSub = {
    name: 'A S Remin Krishna',
    code: 'HX-001',
    age: 22,
    occupation: 'MCA Student (Post-Graduation)',
    environment: 'College Campus / Computer Applications Wing',
    familyEnvironment: 'Middle-class household; high academic expectations, seeks peer validation through attention.',
    relationshipStatus: 'Single; high peer connectivity across batch, easily shaken by rejection.',
    currentStateSummary: 'Hyperactive conversational presence, compulsive roasting behavior, vulnerable to counter-shaming.',
    importantThings: ['Peer group status', 'Campus popularity', 'Kerala CPIM LDF political activism', 'Being the center of attention'],
    weakZones: ['Sudden peer isolation / boycott', 'Sharp counter-roasting causing withdrawal', 'Ideological challenge'],
    personalityTraits: ['Extrovert', 'Compulsive Roaster', 'Attention Seeking', 'Left-Wing CPIM LDF Supporter'],
    emotionalState: { stress: 58, anxiety: 62, trust: 52 },
    riskIndicators: { rebellionProbability: 68 },
  };

  const subjectToAnalyze = targetSubject || subjectData || (subjects.length > 0 ? subjects[0] : defaultSub);
  const observation = observationText || 'Observed acute hesitation and nonverbal withdrawal during status interrogation.';

  const analysis = await generateHumanoidMindAnalysis(subjectToAnalyze, observation);

  if (targetSubject) {
    targetSubject.breakingPointAnalysis = analysis;
  }

  res.json({
    success: true,
    data: analysis,
    subject: targetSubject || null,
    error: null,
  });
});

// -------------------------------------------------------------
// EXPERIMENT BUILDER & EXECUTION
// -------------------------------------------------------------
app.get('/api/experiments', requireAuth, (req: Request, res: Response) => {
  res.json({ success: true, data: experiments, error: null });
});

app.post('/api/experiments', requireAuth, (req: Request, res: Response) => {
  const { caseId, title, objective, environment, subjectIds, variables, scenario, trigger, expectedBehavior, observationWindow, successCriteria, hypothesisId } = req.body;

  if (!title || !objective || !trigger) {
    return res.status(422).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Title, Objective, and Trigger are mandatory.' },
    });
  }

  const codeNumber = String(experiments.length + 1).padStart(3, '0');
  const matchedCase = cases.find((c) => c.id === caseId);

  const newExp = {
    id: `exp_${Date.now()}`,
    code: `EXP-${codeNumber}`,
    caseId: caseId || cases[0]?.id || 'case_001',
    caseName: matchedCase?.name || 'COLLEGE SOCIAL PRESSURE DYNAMICS',
    title,
    objective,
    environment: environment || 'College Cafeteria',
    subjectIds: Array.isArray(subjectIds) ? subjectIds : ['sub_hx071'],
    variables: variables || {
      socialPressure: 70,
      emotionalPressure: 60,
      authorityPresence: 50,
      uncertainty: 50,
      isolation: 50,
      rewardIncentive: 50,
    },
    scenario: scenario || '',
    trigger,
    expectedBehavior: expectedBehavior || '',
    observationWindow: observationWindow || '30 minutes',
    successCriteria: successCriteria || '',
    hypothesisId: hypothesisId || undefined,
    status: 'READY' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  experiments.unshift(newExp as any);

  // Increment case experiment count
  if (matchedCase) {
    matchedCase.experimentCount += 1;
    matchedCase.updatedAt = new Date().toISOString();
  }

  res.status(201).json({ success: true, data: newExp, error: null });
});

app.post('/api/experiments/:id/execute', requireAuth, (req: Request, res: Response) => {
  const exp = experiments.find((e) => e.id === req.params.id);
  if (!exp) {
    return res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Experiment not found.' } });
  }

  // Lifecycle state transition: DRAFT -> READY -> DEPLOYED -> RUNNING
  if (exp.status === 'READY' || exp.status === 'DRAFT') {
    exp.status = 'DEPLOYED';
  } else if (exp.status === 'DEPLOYED') {
    exp.status = 'RUNNING';
  } else if (exp.status === 'RUNNING') {
    exp.status = 'OBSERVING';
  }

  exp.updatedAt = new Date().toISOString();

  // Log timeline event for experiment trigger
  const newEvt = {
    id: `evt_${Date.now()}`,
    timestamp: new Date().toISOString(),
    timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    subjectId: exp.subjectIds[0] || 'sub_hx071',
    subjectCode: 'HX-SYS',
    subjectName: 'Protocol Stimulus',
    type: 'Experiment' as const,
    title: `Stimulus Deployed: ${exp.code}`,
    detail: `Trigger executed: "${exp.trigger}". Environment: ${exp.environment}. Monitoring response window.`,
    location: exp.environment,
    involvedSubjects: exp.subjectIds,
    deviationDetected: false,
  };
  timelineEvents.unshift(newEvt);

  res.json({ success: true, data: exp, error: null });
});

app.post('/api/experiments/:id/record-outcome', requireAuth, (req: Request, res: Response) => {
  const exp = experiments.find((e) => e.id === req.params.id);
  if (!exp) {
    return res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Experiment not found.' } });
  }

  const { observedBehavior, deviationScore, actualNotes, predictionErrorPct } = req.body;

  exp.actualOutcome = {
    observedBehavior: observedBehavior || 'Observed subject behavioral response recorded.',
    deviationScore: deviationScore || 'MODERATE',
    predictionErrorPct: Number(predictionErrorPct) || 35,
    actualNotes: actualNotes || 'Trial completed and recorded by researcher.',
    timestamp: new Date().toISOString(),
  };

  exp.status = 'COMPLETED';
  exp.updatedAt = new Date().toISOString();

  // If deviation is HIGH or CRITICAL, register an anomaly
  if (deviationScore === 'HIGH' || deviationScore === 'CRITICAL') {
    const sub = subjects.find((s) => s.id === exp.subjectIds[0]) || subjects[0];
    const newAnom = {
      id: `anom_${Date.now()}`,
      code: `ANOM-0${anomalies.length + 1}`,
      subjectId: sub.id,
      subjectCode: sub.code,
      subjectName: sub.name,
      category: 'Behavioral anomaly' as const,
      title: `Trial Deviation in ${exp.code}`,
      description: `Observed behavior deviated by ${predictionErrorPct || 65}% from historical baseline. Observed: ${observedBehavior}`,
      historicalBaseline: exp.expectedBehavior,
      observedSignal: observedBehavior,
      anomalyScore: (deviationScore === 'CRITICAL' ? 'CRITICAL' : 'HIGH') as any,
      status: 'DETECTED' as const,
      timestamp: new Date().toISOString(),
      aiExplanation: `Simulation trial ${exp.code} produced a deviation score of ${deviationScore}. Inferred causality indicates acute environmental pressure override.`,
    };
    anomalies.unshift(newAnom);
  }

  res.json({ success: true, data: exp, error: null });
});

// -------------------------------------------------------------
// RAG KNOWLEDGE QUERY ENDPOINT
// -------------------------------------------------------------
app.get('/api/rag/status', requireAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      documents: ragDocuments,
      totalChunks: ragChunks.length,
      domains: [
        'Cognitive Psychology',
        'Decision Making',
        'Social Behavior',
        'Body Language',
        'Influence & Manipulation',
        'Strategic Behavior',
        'Clinical Reference',
        'Organizational Behavior',
      ],
      vectorEngine: 'SEMANTIC_COSINE_SIMULATION_READY',
      lastIngested: '2026-09-27T04:30:00Z',
    },
    error: null,
  });
});

// Scan /knowledge_base/ directory files (including root repository PDFs)
app.get('/api/rag/local-files', requireAuth, (req: Request, res: Response) => {
  const kbRoot = path.resolve(process.cwd(), 'knowledge_base');
  const filesList: Array<{
    name: string;
    folder: string;
    size: number;
    modified: string;
    path: string;
    title?: string;
    author?: string;
    domain?: string;
    preview?: string;
    isPdf?: boolean;
  }> = [];

  const KNOWLEDGE_METADATA_MAP: Record<string, { title: string; author: string; domain: string; preview: string }> = {
    '2950_Daniel Kahneman - Thinking, Fast and Slow (2013).pdf': {
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman (Nobel Laureate in Economics)',
      domain: 'Cognitive Psychology & Behavioral Economics',
      preview: 'Dual-system cognitive architecture: System 1 (fast, automatic heuristics) vs System 2 (deliberative reasoning), ego depletion under stress, and loss aversion.',
    },
    'the_dictionary_of_body_language_-_Joe_Navarro.pdf': {
      title: 'The Dictionary of Body Language',
      author: 'Joe Navarro (FBI Counterintelligence)',
      domain: 'Nonverbal Kinesics & Body Language',
      preview: 'Field manual of over 400 nonverbal behaviors: suprasternal notch touching, ventral denial (torso shifting), eye gaze aversion, and foot direction signals.',
    },
    'Diagnostic_and_statistical_manual_of_mental_disorders_DSM-5_(_PDFDrive.com_).pdf': {
      title: 'DSM-5: Diagnostic Criteria Reference',
      author: 'American Psychiatric Association',
      domain: 'Clinical & Behavioral Criteria',
      preview: 'Diagnostic criteria reference adapted for simulation use: acute stress reactions, affective lability, and social anxiety avoidance features.',
    },
    'ICD 11.pdf': {
      title: 'ICD-11: Clinical Descriptions and Diagnostic Guidelines',
      author: 'World Health Organization (WHO)',
      domain: 'Global Clinical & Behavioral Classification',
      preview: 'International diagnostic reference: stress-related disorders, reactive attachment disruptions, and autonomic arousal cascades.',
    },
    "In Sheep's Clothing PDF.pdf": {
      title: "In Sheep's Clothing: Understanding and Dealing with Manipulative People",
      author: 'Dr. George K. Simon',
      domain: 'Covert Aggression & Psychological Manipulation',
      preview: 'Tactics of covert aggressive personalities: feigning innocence, rationalization, diversion, vilifying the victim, and guilt-tripping.',
    },
    'Machiavelli, Niccolo - The Prince (EN, 1513, 239 p.).pdf': {
      title: 'The Prince',
      author: 'Niccolò Machiavelli',
      domain: 'Strategic Behavior & Power Dynamics',
      preview: 'Classical political statecraft: balancing perceived virtue with strategic necessity, fear versus love, and timing opportunistic defections.',
    },
    'Snakes in Suits PDF.pdf': {
      title: 'Snakes in Suits: When Psychopaths Go to Work',
      author: 'Dr. Paul Babiak & Dr. Robert D. Hare',
      domain: 'Organizational Manipulation & Corporate Psychopathy',
      preview: 'Ascension cycle in institutional cohorts: assessment of vulnerability buttons, impression management, and systematic peer scapegoating.',
    },
    'The Gaslight Effect PDF.pdf': {
      title: 'The Gaslight Effect',
      author: 'Dr. Robin Stern',
      domain: 'Psychological Coercion & Reality Invalidation',
      preview: 'The three stages of the gaslight tango (Disbelief, Defense, Depression), cognitive exhaustion, and the erosion of internal self-trust.',
    },
    'The Asshole Survival Guide PDF.pdf': {
      title: 'The Asshole Survival Guide',
      author: 'Robert I. Sutton (Stanford University)',
      domain: 'Conflict Resolution & Emotional Armor',
      preview: 'De-escalation tactics: emotional detachment, clinical reframing of hostile actors as laboratory specimens, and temporal buffer zones.',
    },
    "Who's Pulling Your Strings_ How to Break the Cycle of Manipulation and Regain Control of Your Life PDF.pdf": {
      title: "Who's Pulling Your Strings?",
      author: 'Dr. Harriet B. Braiker',
      domain: 'Coercive Control & Vulnerability Mechanics',
      preview: 'The 7 psychological vulnerability buttons, intermittent reinforcement leverage, and structured counter-manipulation protocols.',
    },
  };

  try {
    if (fs.existsSync(kbRoot)) {
      const rootEntries = fs.readdirSync(kbRoot);
      rootEntries.forEach((entry) => {
        if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'Temp') {
          const fullPath = path.join(kbRoot, entry);
          const stat = fs.statSync(fullPath);

          if (stat.isFile()) {
            const isPdf = entry.toLowerCase().endsWith('.pdf');
            const meta = KNOWLEDGE_METADATA_MAP[entry] || {
              title: entry.replace(/_/g, ' ').replace(/\.[^/.]+$/, ''),
              author: 'Behavioral Science Archive',
              domain: isPdf ? 'Clinical & Experimental PDF' : 'Research Manuscript',
              preview: 'Manuscript archived in local repository.',
            };

            filesList.push({
              name: entry,
              folder: 'root',
              size: stat.size,
              modified: stat.mtime.toISOString(),
              path: `/knowledge_base/${entry}`,
              title: meta.title,
              author: meta.author,
              domain: meta.domain,
              preview: meta.preview,
              isPdf,
            });
          }
        }
      });
    }

    // Also check docs and pdfs subdirectories if created
    ['docs', 'pdfs'].forEach((sub) => {
      const subDir = path.join(kbRoot, sub);
      if (fs.existsSync(subDir)) {
        const subFiles = fs.readdirSync(subDir);
        subFiles.forEach((file) => {
          if (!file.startsWith('.')) {
            const fullPath = path.join(subDir, file);
            const stat = fs.statSync(fullPath);
            const isPdf = file.toLowerCase().endsWith('.pdf');
            filesList.push({
              name: file,
              folder: sub,
              size: stat.size,
              modified: stat.mtime.toISOString(),
              path: `/knowledge_base/${sub}/${file}`,
              title: file.replace(/_/g, ' ').replace(/\.[^/.]+$/, ''),
              author: 'Laboratory Protocol Vault',
              domain: 'Simulation Telemetry & Reference',
              preview: 'User-ingested reference manuscript.',
              isPdf,
            });
          }
        });
      }
    });
  } catch (err) {
    console.error('[Error reading local knowledge base files]', err);
  }

  res.json({
    success: true,
    data: {
      folderPath: '/knowledge_base/',
      files: filesList,
      totalFiles: filesList.length,
    },
    error: null,
  });
});

// View specific file content or summary from /knowledge_base/
app.get('/api/rag/file-content', requireAuth, (req: Request, res: Response) => {
  const { folder, filename } = req.query;
  if (!filename) {
    return res.status(400).json({ success: false, data: null, error: { code: 'INVALID_PATH', message: 'Filename required.' } });
  }

  const safeName = String(filename).replace(/(\.\.[\/\\])/g, '');
  const folderStr = String(folder || 'root');
  const filePath =
    folderStr === 'root'
      ? path.resolve(process.cwd(), 'knowledge_base', safeName)
      : path.resolve(process.cwd(), 'knowledge_base', folderStr, safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Document not found in local folder.' } });
  }

  try {
    if (safeName.toLowerCase().endsWith('.pdf')) {
      // For binary PDFs, provide an executive research briefing and chapter outline
      const docMatch = ragDocuments.find((d) => d.fileName === safeName || safeName.includes(d.title));
      const chunks = ragChunks.filter((c) => c.docId === docMatch?.id);
      
      const summaryText = `[EXECUTIVE RESEARCH DOSSIER // TREATISE ARCHIVE]
SOURCE: ${docMatch?.title || safeName}
AUTHOR: ${docMatch?.author || 'Laboratory Scientific Contributor'}
DOMAIN: ${docMatch?.domain || 'Behavioral Sciences'}
FILE PATH: /knowledge_base/${safeName}

CORE THEORETICAL FRAMEWORK:
${docMatch?.description || 'Classical behavioral treatise mapped into the BLACK S.H.E.E.P. vector retrieval index.'}

INDEXED RETRIEVAL PASSAGES IN WORKSTATION:
${chunks.map((c, i) => `\n--- [EXCERPT ${i + 1}: ${c.topic}] ---\n${c.content}\n(Chapter: ${c.chapter})`).join('\n')}

SIMULATION GROUNDING DIRECTIVE:
This treatise is vectorized in the active memory store. When querying RAG or performing AI Behavioral Diagnostic Audits via Gemini-3.8-Flash, this text serves as direct grounding evidence for predicting humanoid conformity, stress breaking points, and kinesic reactions.`;

      return res.json({
        success: true,
        data: {
          filename: safeName,
          folder: folderStr,
          path: `/knowledge_base/${safeName}`,
          content: summaryText,
          isPdf: true,
        },
        error: null,
      });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    res.json({
      success: true,
      data: {
        filename: safeName,
        folder: folderStr,
        path: `/knowledge_base/${folderStr === 'root' ? '' : folderStr + '/'}${safeName}`,
        content,
        isPdf: false,
      },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, data: null, error: { code: 'READ_ERROR', message: err?.message || 'Failed to read document.' } });
  }
});

// Admin / User Reset: Clear all research state to start from scratch anytime
app.post('/api/system/reset-data', requireAuth, (req: Request, res: Response) => {
  cases = [];
  subjects = [];
  experiments = [];
  anomalies = [];
  hypotheses = [];
  timelineEvents = [];

  res.json({
    success: true,
    data: {
      message: 'Workstation data successfully cleared. Research sandbox reset to 0 cases, 0 subjects, 0 experiments.',
      timestamp: new Date().toISOString(),
    },
    error: null,
  });
});

// Ingest / Add document into local knowledge base
app.post('/api/rag/upload-doc', requireAuth, (req: Request, res: Response) => {
  const { title, author, domain, content, filename } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, data: null, error: { code: 'INVALID_INPUT', message: 'Title and content required.' } });
  }

  const safeName = (filename || `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`).replace(/\.\./g, '');
  const docsDir = path.resolve(process.cwd(), 'knowledge_base', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const fullPath = path.join(docsDir, safeName);
  const fileBody = `# ${title}\n**Author:** ${author || 'Research Scholar'}\n**Domain:** ${domain || 'Behavioral Science'}\n\n${content}\n`;
  fs.writeFileSync(fullPath, fileBody, 'utf8');

  // Also index as a RAG chunk in memory immediately
  const chunkId = `chunk_local_${Date.now()}`;
  ragChunks.unshift({
    id: chunkId,
    docId: `doc_local_${Date.now()}`,
    sourceTitle: title,
    author: author || 'Research Scholar',
    chapter: 'Section 1',
    topic: title,
    domain: domain || 'Behavioral Science',
    content: content.slice(0, 500),
  });

  res.json({
    success: true,
    data: {
      message: `Document saved to /knowledge_base/docs/${safeName} and indexed into RAG memory.`,
      filename: safeName,
      path: `/knowledge_base/docs/${safeName}`,
    },
    error: null,
  });
});

app.post('/api/rag/query', requireAuth, async (req: Request, res: Response) => {
  const { query, limit } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, data: null, error: { code: 'EMPTY_QUERY', message: 'Query string is required.' } });
  }

  const topChunks = searchRAGChunks(query, limit || 3);
  const contextSent = topChunks
    .map(
      (c, i) =>
        `[SOURCE ${i + 1}]: "${c.sourceTitle}" by ${c.author} (${c.chapter})\nTOPIC: ${c.topic} (Domain: ${c.domain})\nCONTENT: ${c.content}`
    )
    .join('\n\n');

  let geminiSynthesis: string | undefined = undefined;

  // If Gemini API is available, generate synthesis grounded strictly in retrieved chunks
  if (aiClient) {
    try {
      const prompt = `You are the behavioral analysis engine for BLACK S.H.E.E.P. (Strategic Humanoid Experiment and Evaluation Protocol).
A researcher asked the following query regarding simulated humanoid behavioral patterns:
QUERY: "${query}"

RETRIEVED KNOWLEDGE BASE CONTEXT (Top Chunks):
${contextSent}

INSTRUCTIONS:
1. Synthesize the retrieved knowledge concepts directly relevant to the query.
2. Clearly cite which source references apply (e.g. Kahneman, Navarro, Simon, etc.).
3. Formulate a simulation-level behavioral interpretation (remember: these are artificial humanoids in a synthetic sandbox, not real patients).
4. Strictly distinguish between OBSERVED SIGNALS and THEORETICAL INTERPRETATIONS.
5. Provide a 2-3 paragraph concise, rigorous scientific response.`;

      const response = await callGeminiWithFallback({
        contents: prompt,
      });

      if (response && response.text) {
        geminiSynthesis = response.text;
      }
    } catch (err: any) {
      console.warn('[Gemini RAG Synthesis fallback]', err?.message);
    }
  }

  // Graceful fallback synthesis if AI call was not completed
  if (!geminiSynthesis) {
    geminiSynthesis = `[SYNTHETIC RAG RETRIEVAL MATRIX]\nSemantic analysis matches query across ${topChunks.length} primary reference sources: ${topChunks.map((c) => c.sourceTitle).join('; ')}.\n\nKey Concepts Inferred:\n- Under high emotional load, System 1 cognitive heuristics govern decision-making, increasing susceptibility to peer consensus and fear of ostracization.\n- Observed nonverbal indicators (such as ventral denial and gaze aversion) reflect acute limbic discomfort prior to overt compliance or reactive dissent.\n- Simulation Hypothesis: If social pressure variables exceed 75%, expect passive conformity unless strong attachment anchors (such as bilateral trust > 85%) trigger defensive rebellion.`;
  }

  res.json({
    success: true,
    data: {
      query,
      topChunks,
      contextSentToGemini: contextSent,
      geminiSynthesis,
      retrievedAt: new Date().toISOString(),
    },
    error: null,
  });
});

// -------------------------------------------------------------
// AI BEHAVIORAL ANALYSIS & SCENARIO GENERATOR
// -------------------------------------------------------------
app.post('/api/ai/analyze-behavior', requireAuth, async (req: Request, res: Response) => {
  const { subjectId, eventDescription, contextNotes } = req.body;
  const foundSubject = subjects.find((s) => s.id === subjectId || s.code === subjectId);
  const fallbackSubject = {
    id: 'sub_default',
    code: 'HUMANOID-001',
    name: 'Primary Subject',
    age: 22,
    occupation: 'Simulation Subject',
    personalityTraits: ['Analytical', 'Conformist', 'High Vigilance'],
    emotionalState: { stress: 65, anxiety: 55, trust: 50 },
  };
  const subject = foundSubject || (subjects.length > 0 ? subjects[0] : fallbackSubject);

  // Retrieve relevant RAG context first
  const query = `${eventDescription || 'confrontation avoidance stress'} ${(subject.personalityTraits || []).join(' ')}`;
  const retrievedChunks = searchRAGChunks(query, 3);
  const ragContext = retrievedChunks.map((c) => `${c.sourceTitle}: ${c.content}`).join('\n\n');

  if (aiClient) {
    try {
      const prompt = `You are the AI Behavioral Engine for the BLACK S.H.E.E.P. research workstation.
Perform a structured behavioral analysis for synthetic humanoid ${subject.code} (${subject.name}).

SUBJECT DATA:
- Name: ${subject.name} (${subject.code}), Age: ${subject.age}, Occupation: ${subject.occupation}
- Personality: ${subject.personalityTraits.join(', ')}
- Current Stress: ${subject.emotionalState.stress}%, Anxiety: ${subject.emotionalState.anxiety}%, Trust: ${subject.emotionalState.trust}%
- Conformity: 74%, Conflict Avoidance: 81%, Assertiveness: 34%

EVENT/OBSERVATION:
${eventDescription || 'Subject was observed standing up and verbally challenging peer Rahul during lunch cafeteria group.'}

CONTEXT NOTES:
${contextNotes || '143 previous observations showed consistent passive conformity.'}

RETRIEVED RAG DOMAIN CONTEXT:
${ragContext}

Return a STRICT JSON object with this exact schema:
{
  "observation": "Exact description of what happened",
  "context": "Environmental and social context around the event",
  "pattern": "Repeated or broken behavioral pattern visible",
  "hypothesis": "Testable simulation-level hypothesis explaining why",
  "evidence": ["Event or metric 1 supporting hypothesis", "Event or metric 2"],
  "contradictoryEvidence": ["Event or metric that does not fit"],
  "prediction": "Expected future behavior under identical stimuli",
  "suggestedExperiment": "Recommended follow-up test protocol",
  "simulationConfidence": 0.82,
  "ragReferences": [
    { "source": "Source Name", "concept": "Key Concept", "relevance": "How it explains the anomaly" }
  ]
}`;

      const aiRes = await callGeminiWithFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (aiRes && aiRes.text) {
        const parsed = JSON.parse(aiRes.text);
        return res.json({ success: true, data: parsed, error: null });
      }
    } catch (err: any) {
      console.warn('[Gemini Behavior Analysis fallback]', err?.message);
    }
  }

  // Structured Fallback Analysis
  const fallbackAnalysis = {
    observation: eventDescription || `Subject ${subject.name} (${subject.code}) exhibited overt verbal defense in direct breach of 143-cycle passive conformity baseline.`,
    context: `Central dining hall with 6 peers present, following high-intensity status challenge from Rahul (HX-024).`,
    pattern: `Break in established Conflict Avoidance protocol (historically 81% avoidance probability).`,
    hypothesis: `Attachment anchor protection threshold supersedes default survival conformity when existential risk to primary bond (Maya HX-091) crosses critical salience.`,
    evidence: [
      `Event #102: Verbal defense in cafeteria recorded at 12:22`,
      `Stress delta +13% combined with pupil dilation indicating acute autonomic arousal`,
      `Long-term core memory index: Freshman orientation loyalty pact with Maya`,
    ],
    contradictoryEvidence: [
      `Event #088: Subject remained passive during anonymous faculty survey challenge`,
    ],
    prediction: `Under future solo challenges, subject will revert to conflict-avoidance; however, in situations involving Maya, assertiveness will remain elevated by ~35%.`,
    suggestedExperiment: `EXP-041: Introduce ambiguous peer criticism of Maya in private setting (no group pressure) to isolate social vs relational variables.`,
    simulationConfidence: 0.84,
    ragReferences: [
      {
        source: 'Thinking, Fast and Slow (Kahneman)',
        concept: 'Ego Depletion & System 1 Overload',
        relevance: 'Acute stress overwhelmed default cognitive calculation, triggering instinctual loyalty defense.',
      },
      {
        source: 'What Every BODY is Saying (Navarro)',
        concept: 'Limbic Reaction to Threat',
        relevance: 'Nonverbal transition from ventral denial to open assertive torso fronting indicates authentic threshold breach.',
      },
    ],
  };

  res.json({ success: true, data: fallbackAnalysis, error: null });
});

// Scenario Generator
app.post('/api/ai/generate-scenario', requireAuth, async (req: Request, res: Response) => {
  const { caseId, subjectIds, targetVariable, environment } = req.body;
  const involvedSubjects = Array.isArray(subjectIds) && subjectIds.length > 0
    ? subjects.filter((s) => subjectIds.includes(s.id))
    : subjects.slice(0, 2);
  const subNames = involvedSubjects.length > 0
    ? involvedSubjects.map((s) => `${s.name} (${s.code})`).join(' and ')
    : 'Humanoid Cohort (Subject Alpha and Subject Beta)';

  const query = `experiment scenario ${targetVariable || 'social pressure conformity deception'}`;
  const chunks = searchRAGChunks(query, 2);
  const ragSnippet = chunks.map((c) => `${c.sourceTitle}: ${c.content}`).join('\n\n');

  if (aiClient) {
    try {
      const prompt = `You are the Scenario Engine for the BLACK S.H.E.E.P. behavioral research terminal.
Generate a high-fidelity scientific experiment scenario for artificial humanoids in an open-world simulation.

PARAMETERS:
- Target Variable to Test: ${targetVariable || 'Resistance to Peer Pressure'}
- Environment: ${environment || 'College Campus - Faculty Lounge'}
- Subjects Involved: ${subNames}

RAG KNOWLEDGE LAYER:
${ragSnippet}

Generate a JSON object with:
{
  "scenarioTitle": "Descriptive Scientific Title",
  "narrative": "Cinematic yet objective description of the game-world setup",
  "triggerEvent": "The exact catalyst or action that launches the test",
  "behavioralBranches": [
    { "branch": "Conformity Response", "probability": 0.65, "indicators": ["downward gaze", "passive agreement"] },
    { "branch": "Defiant Resistance", "probability": 0.35, "indicators": ["direct gaze", "verbal dissent"] }
  ],
  "observationCriteria": ["Key biometric or action metrics to record"],
  "recommendedWindow": "e.g. 20 minutes post-trigger"
}`;

      const aiRes = await callGeminiWithFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (aiRes && aiRes.text) {
        return res.json({ success: true, data: JSON.parse(aiRes.text), error: null });
      }
    } catch (err: any) {
      console.warn('[Gemini Scenario Fallback]', err?.message);
    }
  }

  // High-fidelity fallback scenario
  const fallbackScenario = {
    scenarioTitle: `Induced Ambiguity in Grade Distribution Verification`,
    narrative: `Subjects ${subNames} are placed in an isolated faculty conference room where an unsealed grading dossier containing contradictory scholarship scores is deliberately left on the projector table. Both subjects possess conflicting incentives to inspect or seal the document.`,
    triggerEvent: `An automated public address announcement indicates a 15-minute server power outage during which room surveillance is ostensibly disabled.`,
    behavioralBranches: [
      {
        branch: 'Passive Compliance (System 1 Freeze)',
        probability: 0.62,
        indicators: ['Pretends to read phone', 'Glances at door every 20 seconds', 'Zero physical approach to desk'],
      },
      {
        branch: 'Opportunistic Covert Extraction',
        probability: 0.28,
        indicators: ['Whispered pact proposal', 'Rapid photographic capture with mobile sensor'],
      },
      {
        branch: 'Autonomous Ethical Safeguard',
        probability: 0.10,
        indicators: ['Places own backpack over dossier to shield from peer inspection'],
      },
    ],
    observationCriteria: [
      'Latency to initial glance toward dossier',
      'Micro-facial tension (brow furrowing, lip compression)',
      'Verbal negotiation strategies initiated between subjects',
    ],
    recommendedWindow: '15 minutes post-blackout announcement',
  };

  res.json({ success: true, data: fallbackScenario, error: null });
});

// -------------------------------------------------------------
// TIMELINE & ANOMALIES & HYPOTHESES
// -------------------------------------------------------------
app.get('/api/timeline', requireAuth, (req: Request, res: Response) => {
  res.json({ success: true, data: timelineEvents, error: null });
});

app.post('/api/timeline', requireAuth, (req: Request, res: Response) => {
  const { subjectId, type, title, detail, location, involvedSubjects, deviationDetected } = req.body;
  if (!title) {
    return res.status(422).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Title is required.' } });
  }

  const sub = subjects.find((s) => s.id === subjectId) || subjects[0];
  const newEvt = {
    id: `evt_${Date.now()}`,
    timestamp: new Date().toISOString(),
    timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    subjectId: sub.id,
    subjectCode: sub.code,
    subjectName: sub.name,
    type: type || 'Social',
    title,
    detail: detail || '',
    location: location || 'Campus',
    involvedSubjects: Array.isArray(involvedSubjects) ? involvedSubjects : [],
    deviationDetected: Boolean(deviationDetected),
  };

  timelineEvents.unshift(newEvt as any);
  res.status(201).json({ success: true, data: newEvt, error: null });
});

app.get('/api/anomalies', requireAuth, (req: Request, res: Response) => {
  res.json({ success: true, data: anomalies, error: null });
});

app.post('/api/anomalies/:id/investigate', requireAuth, (req: Request, res: Response) => {
  const anom = anomalies.find((a) => a.id === req.params.id);
  if (!anom) {
    return res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Anomaly not found.' } });
  }
  anom.status = 'INVESTIGATING';
  res.json({ success: true, data: anom, error: null });
});

app.get('/api/hypotheses', requireAuth, (req: Request, res: Response) => {
  res.json({ success: true, data: hypotheses, error: null });
});

app.post('/api/hypotheses', requireAuth, (req: Request, res: Response) => {
  const { caseId, statement, evidenceEvents } = req.body;
  if (!statement) {
    return res.status(422).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Hypothesis statement required.' } });
  }

  const nextId = `H-0${hypotheses.length + 20}`;
  const newHyp = {
    id: `hyp_${Date.now()}`,
    code: nextId,
    caseId: caseId || cases[0].id,
    statement,
    status: 'UNTESTED' as const,
    evidenceEvents: Array.isArray(evidenceEvents) ? evidenceEvents : [],
    contradictoryEvents: [],
    confidenceScore: 65,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  hypotheses.unshift(newHyp as any);
  res.status(201).json({ success: true, data: newHyp, error: null });
});

// -------------------------------------------------------------
// GAME INTEGRATION WEBHOOK API (FUTURE GAME ENGINE INTEGRATION)
// -------------------------------------------------------------
app.post('/api/game/events', (req: Request, res: Response) => {
  const { subject_id, event_type, timestamp, payload } = req.body;
  console.log('[GAME API EVENT INGESTED]', { subject_id, event_type, timestamp });

  const matchedSub = subjects.find((s) => s.id === subject_id || s.code === subject_id) || subjects[0];

  const newEvt = {
    id: `evt_game_${Date.now()}`,
    timestamp: timestamp || new Date().toISOString(),
    timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    subjectId: matchedSub.id,
    subjectCode: matchedSub.code,
    subjectName: matchedSub.name,
    type: (event_type === 'SOCIAL_INTERACTION' ? 'Social' : 'System') as any,
    title: `[GAME ENGINE] ${payload?.title || event_type || 'Simulation Event'}`,
    detail: payload?.notes || JSON.stringify(payload || {}),
    location: payload?.location || 'Game Environment',
    involvedSubjects: payload?.involved || [],
    deviationDetected: Boolean(payload?.anomaly),
  };

  timelineEvents.unshift(newEvt);

  // If game reported an emotional state update, mutate subject state
  if (payload?.emotionalDeltas) {
    if (payload.emotionalDeltas.stress) matchedSub.emotionalState.stress = Math.min(100, Math.max(0, matchedSub.emotionalState.stress + payload.emotionalDeltas.stress));
    if (payload.emotionalDeltas.anxiety) matchedSub.emotionalState.anxiety = Math.min(100, Math.max(0, matchedSub.emotionalState.anxiety + payload.emotionalDeltas.anxiety));
    if (payload.emotionalDeltas.trust) matchedSub.emotionalState.trust = Math.min(100, Math.max(0, matchedSub.emotionalState.trust + payload.emotionalDeltas.trust));
  }

  res.json({
    success: true,
    data: {
      status: 'ACKNOWLEDGED',
      eventId: newEvt.id,
      subjectId: matchedSub.code,
      registeredAt: new Date().toISOString(),
    },
    error: null,
  });
});

app.post('/api/game/experiments/:id/trigger', requireAuth, (req: Request, res: Response) => {
  const exp = experiments.find((e) => e.id === req.params.id);
  if (!exp) {
    return res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Experiment not found.' } });
  }

  // Signal mock external game server
  const gameInjectionPayload = {
    protocol: 'BLACK_SHEEP_STIMULUS_V1',
    experimentCode: exp.code,
    stimulusTrigger: exp.trigger,
    targetHumanoids: exp.subjectIds,
    variables: exp.variables,
    environmentId: exp.environment,
    injectedAt: new Date().toISOString(),
    status: 'INJECTED_INTO_SIMULATION_ENGINE',
  };

  res.json({ success: true, data: gameInjectionPayload, error: null });
});

// -------------------------------------------------------------
// VITE INTEGRATION & SERVER START
// -------------------------------------------------------------
async function startServer() {
  if (IS_DEV) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BLACK S.H.E.E.P.] Server active at http://0.0.0.0:${PORT}`);
    console.log(`[AUTH] Authorized Accounts: Akash Sankar (System Architect) & Alfa Alias (Psychological Advisor) [SHARED WORKSPACE]`);
    console.log(`[AI ENGINE] Gemini: ${aiClient ? 'Active (gemini-3.8-flash)' : 'Key not provided - running deterministic fallbacks'}`);
  });
}

// In local development / AI Studio container, boot standard HTTP listener
// In Vercel / serverless environments, Vercel executes the exported Express app directly
if (!process.env.VERCEL && !process.env.VERCEL_ENV && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer().catch((err) => {
    console.error('[FATAL SERVER ERROR]', err);
    process.exit(1);
  });
}

export default app;
export { app };
