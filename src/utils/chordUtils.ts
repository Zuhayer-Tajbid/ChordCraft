// Chromatic scale with sharp representations
export const CHROMATIC_NOTES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

// Enharmonic mapping to normalize any flat notation
export const ENHARMONIC_MAP: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Fb: 'E',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  Cb: 'B',
  'B#': 'C',
  'E#': 'F',
};

export interface ChordQualityDef {
  label: string;
  suffix: string;
  category?: string;
}

export const CHORD_QUALITIES: ChordQualityDef[] = [
  { label: 'Major', suffix: '' },
  { label: 'Minor', suffix: 'm' },
  { label: 'Diminished', suffix: 'dim' },
  { label: '7th', suffix: '7' },
  { label: 'Add9', suffix: 'add9' },
  { label: 'Major 7th', suffix: 'maj7' },
  { label: 'Minor 7th', suffix: 'm7' },
  { label: 'Sus2', suffix: 'sus2' },
  { label: 'Sus4', suffix: 'sus4' },
  { label: 'Augmented', suffix: 'aug' },
  { label: '5 (Power)', suffix: '5' },
];

/**
 * Normalizes a note representation to standard sharp notation in CHROMATIC_NOTES
 */
export function normalizeNote(note: string): string {
  const trimmed = note.trim();
  if (ENHARMONIC_MAP[trimmed]) {
    return ENHARMONIC_MAP[trimmed];
  }
  const match = CHROMATIC_NOTES.find((n) => n.toUpperCase() === trimmed.toUpperCase());
  return match || trimmed;
}

/**
 * Transposes a single note by a given number of semitones (+ or -)
 */
export function transposeNote(note: string, semitones: number): string {
  const normalized = normalizeNote(note);
  const index = CHROMATIC_NOTES.indexOf(normalized as (typeof CHROMATIC_NOTES)[number]);
  if (index === -1) return note;

  const newIndex = ((index + semitones) % 12 + 12) % 12;
  return CHROMATIC_NOTES[newIndex];
}

/**
 * Formats a chord for display (e.g. note: "C", quality: "m" -> "Cm")
 */
export function formatChord(note: string, quality: string): string {
  return `${note}${quality}`;
}

/**
 * Parses a chord string like "A#dim" or "Cadd9" or "F#m7" into note and quality
 */
export function parseChord(chordStr: string): { note: string; quality: string } {
  const trimmed = chordStr.trim();
  if (!trimmed) return { note: 'C', quality: '' };

  let note = '';
  let quality = '';

  if (trimmed.length >= 2 && (trimmed[1] === '#' || trimmed[1] === 'b')) {
    note = trimmed.slice(0, 2);
    quality = trimmed.slice(2);
  } else {
    note = trimmed.slice(0, 1);
    quality = trimmed.slice(1);
  }

  const normalizedNote = normalizeNote(note);
  return {
    note: normalizedNote,
    quality,
  };
}

/**
 * Sticky note color palette options
 */
export interface NoteColorOption {
  id: string;
  name: string;
  bg: string;
  border: string;
  text: string;
  badge: string;
}

export const STICKY_COLORS: NoteColorOption[] = [
  {
    id: 'yellow',
    name: 'Canary Yellow',
    bg: '#fef9c3', // yellow-100
    border: '#facc15', // yellow-400
    text: '#713f12', // yellow-900
    badge: 'bg-yellow-400',
  },
  {
    id: 'cyan',
    name: 'Sky Blue',
    bg: '#e0f2fe', // sky-100
    border: '#38bdf8', // sky-400
    text: '#0c4a6e', // sky-900
    badge: 'bg-sky-400',
  },
  {
    id: 'green',
    name: 'Mint Green',
    bg: '#dcfce7', // green-100
    border: '#4ade80', // green-400
    text: '#14532d', // green-900
    badge: 'bg-green-400',
  },
  {
    id: 'pink',
    name: 'Rose Pink',
    bg: '#ffe4e6', // rose-100
    border: '#fb7185', // rose-400
    text: '#881337', // rose-900
    badge: 'bg-rose-400',
  },
  {
    id: 'orange',
    name: 'Peach Orange',
    bg: '#ffedd5', // orange-100
    border: '#fb923c', // orange-400
    text: '#7c2d12', // orange-900
    badge: 'bg-orange-400',
  },
  {
    id: 'purple',
    name: 'Lilac Lavender',
    bg: '#f3e8ff', // purple-100
    border: '#c084fc', // purple-400
    text: '#581c87', // purple-900
    badge: 'bg-purple-400',
  },
];
