import { LyricLine, SongData, StickyNote } from '../types';

export const DEFAULT_LYRICS_TEXT = `[Verse 1]
I'm going under and this time I fear there's no one to save me
This all or nothing really got a way of driving me crazy
I need somebody to heal, somebody to know
Somebody to have, somebody to hold
It's easy to say, but it's never the same
I guess I kinda liked the way you numbed all the pain

[Chorus]
Now the day bleeds into nightfall
And you're not here to get me through it all
I let my guard down and then you pulled the rug
I was getting kinda used to being someone you loved

[Verse 2]
I'm going under and this time I fear there's no one to turn to
This all or nothing way of loving got me sleeping without you
Now, I need somebody to know, somebody to heal
Somebody to have, just to know how it feels
It's easy to say, but it's never the same
I guess I kinda liked the way you helped me escape

[Bridge]
And I tend to close my eyes when it hurts sometimes
I fall into your arms
I'll be safe in your sound 'til I come back around

[Outro]
I was getting kinda used to being someone you loved`;

export function parseLyricsTextToLines(rawText: string): LyricLine[] {
  const rawLines = rawText.split(/\r?\n/);
  const result: LyricLine[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const lineText = rawLines[i];
    const isSection = /^\s*\[.*\]\s*$/.test(lineText);

    result.push({
      id: `line-${i}-${Date.now().toString(36)}`,
      text: lineText,
      isSectionHeader: isSection,
      chords: [],
    });
  }

  return result;
}

export const INITIAL_STICKY_NOTES: StickyNote[] = [
  {
    id: 'note-1',
    text: '💡 Tip: Click anywhere above a lyric line to place a chord. Drag chords horizontally to align with syllables!',
    color: '#fef9c3', // yellow
    x: 32,
    y: 140,
    width: 250,
    createdAt: Date.now(),
  },
  {
    id: 'note-2',
    text: '🎵 Capo on 1st fret (optional for standard Lewis Capaldi acoustic voicing)',
    color: '#e0f2fe', // sky blue
    x: 32,
    y: 290,
    width: 230,
    createdAt: Date.now() + 1,
  },
];

export const INITIAL_SONG_DATA: SongData = {
  title: 'Someone You Loved',
  artist: 'Lewis Capaldi',
  key: 'C',
  transposeSemitones: 0,
  stickyNotes: INITIAL_STICKY_NOTES,
  lines: [
    {
      id: 'l-0',
      text: '[Verse 1]',
      isSectionHeader: true,
      chords: [],
    },
    {
      id: 'l-1',
      //  C                          G                              Am     F
      // I'm going under and this time I fear there's no one to save me
      text: "I'm going under and this time I fear there's no one to save me",
      chords: [
        { id: 'c-1', note: 'C', quality: '', characterIndex: 1 },
        { id: 'c-2', note: 'G', quality: '', characterIndex: 28 },
        { id: 'c-3', note: 'A', quality: 'm', characterIndex: 59 },
        { id: 'c-4', note: 'F', quality: '', characterIndex: 66 },
      ],
    },
    {
      id: 'l-2',
      text: 'This all or nothing really got a way of driving me crazy',
      chords: [
        { id: 'c-5', note: 'C', quality: '', characterIndex: 1 },
        { id: 'c-6', note: 'G', quality: '', characterIndex: 27 },
        { id: 'c-7', note: 'A', quality: 'm', characterIndex: 51 },
        { id: 'c-8', note: 'F', quality: '', characterIndex: 57 },
      ],
    },
    {
      id: 'l-3',
      text: 'I need somebody to heal, somebody to know',
      chords: [
        { id: 'c-9', note: 'C', quality: '', characterIndex: 2 },
        { id: 'c-10', note: 'G', quality: '', characterIndex: 25 },
      ],
    },
    {
      id: 'l-4',
      text: 'Somebody to have, somebody to hold',
      chords: [
        { id: 'c-11', note: 'A', quality: 'm', characterIndex: 0 },
        { id: 'c-12', note: 'F', quality: '', characterIndex: 26 },
      ],
    },
    {
      id: 'l-5',
      text: "It's easy to say, but it's never the same",
      chords: [
        { id: 'c-13', note: 'C', quality: '', characterIndex: 0 },
        { id: 'c-14', note: 'G', quality: '', characterIndex: 27 },
      ],
    },
    {
      id: 'l-6',
      text: 'I guess I kinda liked the way you numbed all the pain',
      chords: [
        { id: 'c-15', note: 'A', quality: 'm', characterIndex: 0 },
        { id: 'c-16', note: 'F', quality: '', characterIndex: 44 },
      ],
    },
    {
      id: 'l-7',
      text: '',
      chords: [],
    },
    {
      id: 'l-8',
      text: '[Chorus]',
      isSectionHeader: true,
      chords: [],
    },
    {
      id: 'l-9',
      text: 'Now the day bleeds into nightfall',
      chords: [
        { id: 'c-17', note: 'C', quality: '', characterIndex: 0 },
        { id: 'c-18', note: 'G', quality: '', characterIndex: 23 },
      ],
    },
    {
      id: 'l-10',
      text: "And you're not here to get me through it all",
      chords: [
        { id: 'c-19', note: 'A', quality: 'm', characterIndex: 4 },
        { id: 'c-20', note: 'F', quality: '', characterIndex: 37 },
      ],
    },
    {
      id: 'l-11',
      text: 'I let my guard down and then you pulled the rug',
      chords: [
        { id: 'c-21', note: 'C', quality: '', characterIndex: 2 },
        { id: 'c-22', note: 'G', quality: '', characterIndex: 33 },
      ],
    },
    {
      id: 'l-12',
      text: 'I was getting kinda used to being someone you loved',
      chords: [
        { id: 'c-23', note: 'A', quality: 'm', characterIndex: 2 },
        { id: 'c-24', note: 'F', quality: '', characterIndex: 42 },
      ],
    },
    {
      id: 'l-13',
      text: '',
      chords: [],
    },
    {
      id: 'l-14',
      text: '[Verse 2]',
      isSectionHeader: true,
      chords: [],
    },
    {
      id: 'l-15',
      text: "I'm going under and this time I fear there's no one to turn to",
      chords: [
        { id: 'c-25', note: 'C', quality: '', characterIndex: 1 },
        { id: 'c-26', note: 'G', quality: '', characterIndex: 28 },
        { id: 'c-27', note: 'A', quality: 'm', characterIndex: 59 },
      ],
    },
    {
      id: 'l-16',
      text: 'This all or nothing way of loving got me sleeping without you',
      chords: [
        { id: 'c-28', note: 'F', quality: '', characterIndex: 1 },
        { id: 'c-29', note: 'C', quality: '', characterIndex: 34 },
        { id: 'c-30', note: 'G', quality: '', characterIndex: 57 },
      ],
    },
  ],
};
