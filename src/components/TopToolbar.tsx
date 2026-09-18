import React from 'react';
import {
  Minus,
  Plus,
  StickyNote,
  Save,
  RotateCcw,
  FileText,
  Music,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
} from 'lucide-react';

interface TopToolbarProps {
  title: string;
  artist: string;
  onUpdateMeta: (title: string, artist: string) => void;
  transposeSemitones: number;
  onTranspose: (delta: number) => void;
  onResetTranspose: () => void;
  onOpenStickyNoteModal: () => void;
  onOpenImportModal: () => void;
  onSave: () => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  fontSize: number;
  onChangeFontSize: (delta: number) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  title,
  artist,
  transposeSemitones,
  onTranspose,
  onResetTranspose,
  onOpenStickyNoteModal,
  onOpenImportModal,
  onSave,
  saveStatus,
  fontSize,
  onChangeFontSize,
}) => {
  const formattedTranspose =
    transposeSemitones > 0
      ? `+${transposeSemitones}`
      : `${transposeSemitones}`;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Song Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-xs">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 font-sans tracking-tight">
                {title || 'Lyrics Chord Editor'}
              </h1>
              {artist && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                  {artist}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Ultimate Guitar style chord alignment • Click space above line to place chord
            </p>
          </div>
        </div>

        {/* Center: THE TRANSPOSE CONTROLS (Most important requirement) */}
        <div
          id="transpose-controls-container"
          className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1.5 shadow-inner"
        >
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider px-2 select-none">
            Transpose
          </span>

          {/* Transpose Minus Button */}
          <button
            id="transpose-minus-btn"
            type="button"
            onClick={() => onTranspose(-1)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 flex items-center justify-center transition-all border border-slate-700 hover:border-amber-500/40 shadow-xs active:scale-95"
            title="Transpose down 1 semitone (-1)"
          >
            <Minus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Transpose Semitones Counter Display */}
          <div
            id="transpose-display-badge"
            className={`min-w-[48px] px-2.5 py-1 rounded-lg text-center font-mono text-sm font-black select-none border transition-all ${
              transposeSemitones !== 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
            title={`Current transposition: ${formattedTranspose} semitones`}
          >
            {formattedTranspose}
          </div>

          {/* Transpose Plus Button */}
          <button
            id="transpose-plus-btn"
            type="button"
            onClick={() => onTranspose(1)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 flex items-center justify-center transition-all border border-slate-700 hover:border-amber-500/40 shadow-xs active:scale-95"
            title="Transpose up 1 semitone (+1)"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Reset button if transposed */}
          {transposeSemitones !== 0 && (
            <button
              id="transpose-reset-btn"
              type="button"
              onClick={onResetTranspose}
              className="p-1.5 text-xs text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Reset transpose to 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Action Controls: Sticky Note, Save, Import */}
        <div className="flex items-center gap-2">
          {/* Font Size Zoom */}
          <div className="hidden md:flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onChangeFontSize(-1)}
              disabled={fontSize <= 12}
              className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded hover:bg-slate-700"
              title="Decrease lyrics font size"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-1 select-none">
              {fontSize}px
            </span>
            <button
              type="button"
              onClick={() => onChangeFontSize(1)}
              disabled={fontSize >= 24}
              className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded hover:bg-slate-700"
              title="Increase lyrics font size"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Insert Sticky Note Button */}
          <button
            id="insert-sticky-note-btn"
            type="button"
            onClick={onOpenStickyNoteModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-semibold shadow-xs transition-all active:scale-95"
            title="Add draggable sticky note"
          >
            <StickyNote className="w-4 h-4" />
            <span>Sticky Note</span>
          </button>

          {/* Import / Paste Lyrics (.txt) */}
          <button
            id="import-lyrics-btn"
            type="button"
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            title="Upload or paste .txt lyrics"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Load .txt</span>
          </button>

          {/* Save Button (Persist to Local Storage) */}
          <button
            id="save-song-btn"
            type="button"
            onClick={onSave}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 ${
              saveStatus === 'saved'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400'
            }`}
            title="Save song and chords to resume next time"
          >
            {saveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
