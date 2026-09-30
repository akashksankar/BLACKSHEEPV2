/**
 * BLACK S.H.E.E.P. - Subject Profile Illustration Asset References
 * Clean, technical vector illustrations for human subjects and network connections
 */

export const ILLUSTRATION_REMIN = '/src/assets/images/illustration_remin.svg';
export const ILLUSTRATION_FACULTY1 = '/src/assets/images/illustration_faculty1.svg';
export const ILLUSTRATION_GOPIKRISHNAN = '/src/assets/images/illustration_gopikrishnan.svg';
export const ILLUSTRATION_FACULTY2 = '/src/assets/images/illustration_faculty2.svg';
export const ILLUSTRATION_BASILBABU = '/src/assets/images/illustration_basilbabu.svg';

export const UNIVERSAL_MALE_AVATAR = '/src/assets/images/universal_male.svg';
export const UNIVERSAL_FEMALE_AVATAR = '/src/assets/images/universal_female.svg';

export interface AvatarOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'custom';
  url: string;
  description: string;
}

export const SUBJECT_AVATAR_MAP: Record<string, string> = {
  sub_remin_01: ILLUSTRATION_REMIN,
  'HX-001': ILLUSTRATION_REMIN,
  sub_prof_02: ILLUSTRATION_FACULTY1,
  'HX-002': ILLUSTRATION_FACULTY1,
  sub_peer_03: ILLUSTRATION_GOPIKRISHNAN,
  'HX-003': ILLUSTRATION_GOPIKRISHNAN,
  sub_peer_04: ILLUSTRATION_FACULTY2,
  'HX-004': ILLUSTRATION_FACULTY2,
  sub_peer_05: ILLUSTRATION_BASILBABU,
  'HX-005': ILLUSTRATION_BASILBABU,
};

export const UNIVERSAL_AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'remin_illustration',
    name: 'A S Remin Krishna',
    gender: 'male',
    url: ILLUSTRATION_REMIN,
    description: 'Stylized technical illustration · A S Remin Krishna (22, MCA)',
  },
  {
    id: 'faculty1_illustration',
    name: 'Faculty 1 MCA',
    gender: 'male',
    url: ILLUSTRATION_FACULTY1,
    description: 'Stylized academic illustration · Faculty 1 MCA',
  },
  {
    id: 'gopikrishnan_illustration',
    name: 'Gopi Krishnan',
    gender: 'male',
    url: ILLUSTRATION_GOPIKRISHNAN,
    description: 'Stylized student illustration · Gopi Krishnan (Friend)',
  },
  {
    id: 'faculty2_illustration',
    name: 'Faculty 2',
    gender: 'female',
    url: ILLUSTRATION_FACULTY2,
    description: 'Stylized academic illustration · Faculty 2',
  },
  {
    id: 'basilbabu_illustration',
    name: 'Basil Babu',
    gender: 'male',
    url: ILLUSTRATION_BASILBABU,
    description: 'Stylized student illustration · Basil Babu (Friend)',
  },
  {
    id: 'universal_male',
    name: 'Universal Male Profile',
    gender: 'male',
    url: UNIVERSAL_MALE_AVATAR,
    description: 'Clean minimalist vector silhouette · Technical research spec (Male)',
  },
  {
    id: 'universal_female',
    name: 'Universal Female Profile',
    gender: 'female',
    url: UNIVERSAL_FEMALE_AVATAR,
    description: 'Clean minimalist vector silhouette · Technical research spec (Female)',
  },
];

export function getSubjectIllustration(idOrCode?: string, defaultUrl?: string): string {
  if (idOrCode && SUBJECT_AVATAR_MAP[idOrCode]) {
    return SUBJECT_AVATAR_MAP[idOrCode];
  }
  return defaultUrl || ILLUSTRATION_REMIN;
}

export function getUniversalAvatar(gender?: 'male' | 'female' | string): string {
  if (gender === 'female' || gender === 'f') {
    return UNIVERSAL_FEMALE_AVATAR;
  }
  return UNIVERSAL_MALE_AVATAR;
}
