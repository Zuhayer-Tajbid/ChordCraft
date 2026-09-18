export interface Chord {
  id: string;
  note: string; // e.g. "C", "A#", "G"
  quality: string; // e.g. "", "m", "dim", "7", "add9", "maj7", "m7", "sus2", "sus4", "aug", "5"
  characterIndex: number; // 0-based character column along the lyric line
}

export interface LyricLine {
  id: string;
  text: string;
  isSectionHeader?: boolean;
  chords: Chord[];
}

export interface StickyNote {
  id: string;
  text: string;
  color: string; // hex or tailwind color class
  x: number;
  y: number;
  width?: number;
  createdAt: number;
}

export interface SongData {
  title: string;
  artist: string;
  key: string;
  transposeSemitones: number;
  lines: LyricLine[];
  stickyNotes: StickyNote[];
}
