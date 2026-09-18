import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chord, LyricLine, StickyNote, SongData } from './types';
import { INITIAL_SONG_DATA, parseLyricsTextToLines } from './data/defaultSong';
import { transposeNote } from './utils/chordUtils';
import { TopToolbar } from './components/TopToolbar';
import { LyricLineRow } from './components/LyricLineRow';
import { ChordEditorModal } from './components/ChordEditorModal';
import { StickyNoteCard } from './components/StickyNoteCard';
import { StickyNoteModal } from './components/StickyNoteModal';
import { ImportLyricsModal } from './components/ImportLyricsModal';
import { EditableKeyBadge } from './components/EditableKeyBadge';
import {
  Plus,
  HelpCircle,
  FileDown,
  RotateCcw,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';

const STORAGE_KEY = 'lyrics_chord_editor_data_v1';

export default function App() {
  // Load saved song data from localStorage or fallback to default
  const [song, setSong] = useState<SongData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.lines)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved song data from localStorage:', err);
    }
    return INITIAL_SONG_DATA;
  });

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(15);
  const [selectedChordId, setSelectedChordId] = useState<string | null>(null);
  const [showHelper, setShowHelper] = useState<boolean>(true);

  // Modals state
  const [chordModalData, setChordModalData] = useState<{
    isOpen: boolean;
    lineIndex: number;
    charIndex: number;
    isNew: boolean;
    chordId?: string;
    note: string;
    quality: string;
  } | null>(null);

  const [stickyModal, setStickyModal] = useState<{
    isOpen: boolean;
    note: StickyNote | null;
  }>({ isOpen: false, note: null });

  const [importModalOpen, setImportModalOpen] = useState(false);

  // Measure exact monospace character width in pixels
  const [charWidthPx, setCharWidthPx] = useState<number>(9.6);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (measureRef.current) {
      const width = measureRef.current.getBoundingClientRect().width;
      if (width > 0) {
        setCharWidthPx(width);
      }
    }
  }, [fontSize]);

  // Mark unsaved on modifications
  const updateSong = useCallback((updater: (prev: SongData) => SongData) => {
    setSong((prev) => {
      const next = updater(prev);
      setSaveStatus('unsaved');
      return next;
    });
  }, []);

  // Save to localStorage
  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(song));
      setSaveStatus('saved');
      setSaveToast('Song, chords, and sticky notes saved successfully!');
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err) {
      console.error('Failed to save to localStorage', err);
      setSaveStatus('unsaved');
      setSaveToast('Error saving data to local storage.');
      setTimeout(() => setSaveToast(null), 3000);
    }
  }, [song]);

  // Auto-save debounced backup every 30 seconds if unsaved
  useEffect(() => {
    if (saveStatus === 'unsaved') {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(song));
          setSaveStatus('saved');
        } catch {
          // ignore background autosave failures
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [song, saveStatus]);

  // ---------------------------------------------------------------------------
  // Transpose Logic: Most important requirement
  // "transpose button,one plus and one minus,that will transform all chords accordingly,
  // just changing the note like +1 will be Adim to A#dim but leaving the type same.
  // The transpose will also show how many semitones,like -3,+4."
  // ---------------------------------------------------------------------------
  const handleTranspose = (delta: number) => {
    updateSong((prev) => {
      const newLines = prev.lines.map((line) => {
        if (!line.chords || line.chords.length === 0) return line;
        const transposedChords = line.chords.map((chord) => ({
          ...chord,
          note: transposeNote(chord.note, delta),
          // quality remains intact! (e.g. Adim -> A#dim)
        }));
        return {
          ...line,
          chords: transposedChords,
        };
      });

      // Also transpose the musical key if it's defined
      let newKey = prev.key;
      if (prev.key) {
        const isMinor = prev.key.endsWith('m') && !prev.key.endsWith('dim');
        const root = isMinor ? prev.key.slice(0, -1) : prev.key;
        try {
          const transposedRoot = transposeNote(root, delta);
          newKey = isMinor ? `${transposedRoot}m` : transposedRoot;
        } catch {
          // Keep key if non-standard
        }
      }

      return {
        ...prev,
        key: newKey,
        transposeSemitones: prev.transposeSemitones + delta,
        lines: newLines,
      };
    });
  };

  const handleResetTranspose = () => {
    if (song.transposeSemitones === 0) return;
    // Transpose backwards by the cumulative semitones
    const reverseDelta = -song.transposeSemitones;
    handleTranspose(reverseDelta);
  };

  // ---------------------------------------------------------------------------
  // Chord Operations: Insert, Edit, Delete, Move
  // ---------------------------------------------------------------------------
  const handleRequestInsertChord = (lineIndex: number, charIndex: number) => {
    // Default chord to suggest based on key or context
    setSelectedChordId(null);
    setChordModalData({
      isOpen: true,
      lineIndex,
      charIndex,
      isNew: true,
      note: 'C',
      quality: '',
    });
  };

  const handleEditChord = (lineIndex: number, chord: Chord) => {
    setSelectedChordId(chord.id);
    setChordModalData({
      isOpen: true,
      lineIndex,
      charIndex: chord.characterIndex,
      isNew: false,
      chordId: chord.id,
      note: chord.note,
      quality: chord.quality,
    });
  };

  const handleSaveChordFromModal = (note: string, quality: string) => {
    if (!chordModalData) return;
    const { lineIndex, charIndex, isNew, chordId } = chordModalData;

    updateSong((prev) => {
      const nextLines = [...prev.lines];
      const targetLine = { ...nextLines[lineIndex] };

      if (isNew) {
        const newChord: Chord = {
          id: `chord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          note,
          quality,
          characterIndex: charIndex,
        };
        targetLine.chords = [...targetLine.chords, newChord].sort(
          (a, b) => a.characterIndex - b.characterIndex,
        );
      } else if (chordId) {
        targetLine.chords = targetLine.chords.map((c) =>
          c.id === chordId ? { ...c, note, quality } : c,
        );
      }

      nextLines[lineIndex] = targetLine;
      return { ...prev, lines: nextLines };
    });
  };

  const handleDeleteChord = (lineIndex: number, chordId: string) => {
    updateSong((prev) => {
      const nextLines = [...prev.lines];
      const targetLine = { ...nextLines[lineIndex] };
      targetLine.chords = targetLine.chords.filter((c) => c.id !== chordId);
      nextLines[lineIndex] = targetLine;
      return { ...prev, lines: nextLines };
    });
    if (selectedChordId === chordId) {
      setSelectedChordId(null);
    }
  };

  const handleMoveChord = (lineIndex: number, chordId: string, newCharIndex: number) => {
    updateSong((prev) => {
      const nextLines = [...prev.lines];
      const targetLine = { ...nextLines[lineIndex] };
      targetLine.chords = targetLine.chords.map((c) =>
        c.id === chordId ? { ...c, characterIndex: Math.max(0, newCharIndex) } : c,
      );
      nextLines[lineIndex] = targetLine;
      return { ...prev, lines: nextLines };
    });
  };

  // Line text operations
  const handleUpdateLineText = (lineIndex: number, newText: string) => {
    updateSong((prev) => {
      const nextLines = [...prev.lines];
      nextLines[lineIndex] = {
        ...nextLines[lineIndex],
        text: newText,
        isSectionHeader: /^\s*\[.*\]\s*$/.test(newText),
      };
      return { ...prev, lines: nextLines };
    });
  };

  const handleDeleteLine = (lineIndex: number) => {
    updateSong((prev) => {
      const nextLines = prev.lines.filter((_, i) => i !== lineIndex);
      return { ...prev, lines: nextLines };
    });
  };

  const handleAddLine = (atIndex?: number) => {
    updateSong((prev) => {
      const newLine: LyricLine = {
        id: `line-${Date.now().toString(36)}`,
        text: '',
        chords: [],
      };
      const nextLines = [...prev.lines];
      if (typeof atIndex === 'number') {
        nextLines.splice(atIndex + 1, 0, newLine);
      } else {
        nextLines.push(newLine);
      }
      return { ...prev, lines: nextLines };
    });
  };

  // ---------------------------------------------------------------------------
  // Sticky Notes Management: Placed anywhere outside the lyrics
  // "form to insert sticky note,,that will have a text field and colour option...
  // place anywhere on screen outside lyrics... icon on top left corner to drag,
  // edit and delete note icons"
  // ---------------------------------------------------------------------------
  const handleOpenStickyModal = (note?: StickyNote | null) => {
    setStickyModal({ isOpen: true, note: note || null });
  };

  const handleSaveStickyNote = (text: string, color: string) => {
    if (stickyModal.note) {
      // Edit existing note
      const existingId = stickyModal.note.id;
      updateSong((prev) => ({
        ...prev,
        stickyNotes: prev.stickyNotes.map((n) =>
          n.id === existingId ? { ...n, text, color } : n,
        ),
      }));
    } else {
      // Create new sticky note: place intelligently on right side or offset relative to current scroll
      const currentScrollY = typeof window !== 'undefined' ? (window.scrollY || window.pageYOffset || 0) : 0;
      const newNote: StickyNote = {
        id: `sticky-${Date.now()}`,
        text,
        color,
        x: Math.min(window.innerWidth - 270, Math.max(20, window.innerWidth - 300)),
        y: currentScrollY + 120 + ((song.stickyNotes.length * 60) % 350),
        width: 250,
        createdAt: Date.now(),
      };
      updateSong((prev) => ({
        ...prev,
        stickyNotes: [...prev.stickyNotes, newNote],
      }));
    }
  };

  const handleUpdateStickyPosition = (id: string, x: number, y: number) => {
    updateSong((prev) => ({
      ...prev,
      stickyNotes: prev.stickyNotes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    }));
  };

  const handleDeleteStickyNote = (id: string) => {
    updateSong((prev) => ({
      ...prev,
      stickyNotes: prev.stickyNotes.filter((n) => n.id !== id),
    }));
  };

  // Import raw text lyrics
  const handleImportLyrics = (rawText: string, newTitle?: string, newArtist?: string) => {
    const parsedLines = parseLyricsTextToLines(rawText);
    updateSong((prev) => ({
      ...prev,
      title: newTitle || prev.title,
      artist: newArtist || prev.artist,
      transposeSemitones: 0,
      lines: parsedLines,
    }));
  };

  // Reset to original default song
  const handleResetToDefault = () => {
    if (window.confirm('Reset song to default lyrics and chords?')) {
      setSong(INITIAL_SONG_DATA);
      setSaveStatus('unsaved');
    }
  };

  // Export chord sheet text
  const handleExportText = () => {
    let output = `${song.title} - ${song.artist}\nKey: ${song.key} | Transpose: ${song.transposeSemitones >= 0 ? '+' : ''}${song.transposeSemitones}\n\n`;

    song.lines.forEach((line) => {
      if (line.isSectionHeader) {
        output += `\n${line.text}\n`;
        return;
      }
      if (line.chords.length > 0) {
        // Construct chord line
        const maxLen = Math.max(
          line.text.length,
          ...line.chords.map((c) => c.characterIndex + 5),
        );
        const chordChars = new Array(maxLen).fill(' ');
        line.chords.forEach((c) => {
          const chordStr = `${c.note}${c.quality}`;
          for (let i = 0; i < chordStr.length; i++) {
            chordChars[c.characterIndex + i] = chordStr[i];
          }
        });
        output += chordChars.join('').trimEnd() + '\n';
      }
      output += line.text + '\n';
    });

    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title.toLowerCase().replace(/\s+/g, '_')}_chords.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden">
      {/* Hidden character width measurement element for monospace font */}
      <span
        ref={measureRef}
        style={{ fontSize: `${fontSize}px` }}
        className="fixed -top-96 left-0 font-mono invisible whitespace-pre select-none pointer-events-none"
        aria-hidden="true"
      >
        M
      </span>

      {/* Top Navigation & Transpose Toolbar */}
      <TopToolbar
        title={song.title}
        artist={song.artist}
        onUpdateMeta={(title, artist) => updateSong((p) => ({ ...p, title, artist }))}
        transposeSemitones={song.transposeSemitones}
        onTranspose={handleTranspose}
        onResetTranspose={handleResetTranspose}
        onOpenStickyNoteModal={() => handleOpenStickyModal(null)}
        onOpenImportModal={() => setImportModalOpen(true)}
        onSave={handleSave}
        saveStatus={saveStatus}
        fontSize={fontSize}
        onChangeFontSize={(delta) => setFontSize((prev) => Math.max(12, Math.min(24, prev + delta)))}
      />

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 border border-emerald-400 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Render Draggable Sticky Notes Outside/Around Lyrics */}
      {song.stickyNotes.map((note) => (
        <StickyNoteCard
          key={note.id}
          note={note}
          onUpdatePosition={handleUpdateStickyPosition}
          onEdit={(n) => handleOpenStickyModal(n)}
          onDelete={handleDeleteStickyNote}
        />
      ))}

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Helper Banner */}
        {showHelper && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4 text-xs text-slate-300 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-100 text-sm">
                  Ultimate Guitar Style Interactive Lyrics Sheet
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-slate-400">
                  <div>
                    <strong className="text-amber-400 font-mono">Click space</strong> above any line to place chords
                  </div>
                  <div>
                    <strong className="text-amber-400 font-mono">Drag chords</strong> horizontally to position over lyrics
                  </div>
                  <div>
                    <strong className="text-amber-400 font-mono">Space / Arrows</strong> to nudge selected chord left/right
                  </div>
                  <div>
                    <strong className="text-amber-400 font-mono">Transpose +/-</strong> shifts all chords (e.g. Adim → A#dim)
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowHelper(false)}
              className="text-slate-500 hover:text-slate-300 p-1 shrink-0"
              title="Dismiss helper"
            >
              ×
            </button>
          </div>
        )}

        {/* Lyrics Sheet Card */}
        <div
          id="lyrics-sheet-container"
          style={{ fontSize: `${fontSize}px` }}
          className="bg-slate-900 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl relative min-h-[600px]"
        >
          {/* Sheet Header */}
          <div className="border-b border-slate-800 pb-5 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-100 tracking-tight font-sans">
                  {song.title}
                </h2>
                {song.artist && (
                  <span className="text-sm font-medium text-slate-400">
                    by <strong className="text-slate-200">{song.artist}</strong>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs font-mono text-slate-400">
                <EditableKeyBadge
                  currentKey={song.key || 'C'}
                  onKeyChange={(newKey) => updateSong((prev) => ({ ...prev, key: newKey }))}
                />
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                  Transpose: <strong className="text-amber-400">{song.transposeSemitones >= 0 ? `+${song.transposeSemitones}` : song.transposeSemitones}</strong> semitones
                </span>
                <span className="text-slate-500 hidden sm:inline ml-1">
                  {song.lines.reduce((acc, l) => acc + l.chords.length, 0)} chords placed
                </span>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                title="Download lyrics and chords as formatted .txt"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export .txt</span>
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800 transition-colors"
                title="Reset to default Lewis Capaldi song"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Song</span>
              </button>
            </div>
          </div>

          {/* Lyrics and Chords Line Rows */}
          <div className="space-y-1">
            {song.lines.map((line, index) => (
              <LyricLineRow
                key={line.id}
                line={line}
                lineIndex={index}
                charWidthPx={charWidthPx}
                selectedChordId={selectedChordId}
                onSelectChord={(id) => setSelectedChordId(id)}
                onRequestInsertChord={handleRequestInsertChord}
                onEditChord={handleEditChord}
                onDeleteChord={handleDeleteChord}
                onMoveChord={handleMoveChord}
                onUpdateLineText={handleUpdateLineText}
                onDeleteLine={handleDeleteLine}
              />
            ))}
          </div>

          {/* Add Line at bottom */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleAddLine()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              Add Lyric Line
            </button>

            <span className="text-xs text-slate-500 font-mono">
              Total {song.lines.length} lines
            </span>
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-8 pb-10 text-center text-xs text-slate-500 space-y-1">
          <p>Lyrics Chord Editor • Ultimate Guitar style chords above every lyric line</p>
          <p className="text-[11px] text-slate-600">
            Changes are saved to browser local storage so your work is preserved on reload.
          </p>
        </footer>
      </main>

      {/* Chord Editor & Dropdown Modal */}
      {chordModalData && (
        <ChordEditorModal
          isOpen={chordModalData.isOpen}
          onClose={() => setChordModalData(null)}
          onSave={handleSaveChordFromModal}
          onDelete={
            chordModalData.chordId
              ? () => handleDeleteChord(chordModalData.lineIndex, chordModalData.chordId!)
              : undefined
          }
          initialNote={chordModalData.note}
          initialQuality={chordModalData.quality}
          positionInfo={{
            lineIndex: chordModalData.lineIndex,
            charIndex: chordModalData.charIndex,
          }}
          isNew={chordModalData.isNew}
        />
      )}

      {/* Sticky Note Form Modal */}
      <StickyNoteModal
        isOpen={stickyModal.isOpen}
        onClose={() => setStickyModal({ isOpen: false, note: null })}
        onSave={handleSaveStickyNote}
        initialNote={stickyModal.note}
      />

      {/* Import / Paste Lyrics Modal */}
      <ImportLyricsModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportLyrics}
        currentLyricsText={song.lines.map((l) => l.text).join('\n')}
      />
    </div>
  );
}
