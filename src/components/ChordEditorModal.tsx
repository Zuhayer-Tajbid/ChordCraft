import React, { useState } from 'react';
import { CHROMATIC_NOTES, CHORD_QUALITIES, formatChord } from '../utils/chordUtils';
import { X, Trash2, Check, Music2 } from 'lucide-react';

interface ChordEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string, quality: string) => void;
  onDelete?: () => void;
  initialNote?: string;
  initialQuality?: string;
  positionInfo?: { lineIndex: number; charIndex: number };
  isNew?: boolean;
}

export const ChordEditorModal: React.FC<ChordEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialNote = 'C',
  initialQuality = '',
  positionInfo,
  isNew = false,
}) => {
  const [selectedNote, setSelectedNote] = useState<string>(initialNote);
  const [selectedQuality, setSelectedQuality] = useState<string>(initialQuality);

  if (!isOpen) return null;

  const currentPreview = formatChord(selectedNote, selectedQuality);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedNote, selectedQuality);
    onClose();
  };

  const quickChords = ['C', 'G', 'Am', 'F', 'D', 'Em', 'Dm', 'E7', 'A#', 'F#m', 'B7', 'Cadd9'];

  const applyQuickChord = (chordStr: string) => {
    let note = '';
    let quality = '';
    if (chordStr.length >= 2 && (chordStr[1] === '#' || chordStr[1] === 'b')) {
      note = chordStr.slice(0, 2);
      quality = chordStr.slice(2);
    } else {
      note = chordStr.slice(0, 1);
      quality = chordStr.slice(1);
    }
    setSelectedNote(note);
    setSelectedQuality(quality);
  };

  return (
    <div
      id="chord-editor-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="chord-editor-dialog"
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="chord-editor-close-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Music2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              {isNew ? 'Insert Chord' : 'Edit Chord'}
            </h3>
            {positionInfo && (
              <p className="text-xs text-slate-400">
                Line {positionInfo.lineIndex + 1}, column {positionInfo.charIndex + 1}
              </p>
            )}
          </div>
        </div>

        {/* Live Preview Display */}
        <div className="mb-6 p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">Preview</span>
            <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
              {currentPreview || '—'}
            </span>
          </div>
          <div className="text-right text-xs text-slate-400">
            <div>Root: <strong className="text-slate-200">{selectedNote}</strong></div>
            <div>
              Type:{' '}
              <strong className="text-slate-200">
                {CHORD_QUALITIES.find((q) => q.suffix === selectedQuality)?.label || selectedQuality || 'Major'}
              </strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Note Root Dropdown */}
          <div>
            <label htmlFor="chord-note-select" className="block text-sm font-medium text-slate-300 mb-1.5">
              Root Note (A, A#, B ... G#)
            </label>
            <select
              id="chord-note-select"
              value={selectedNote}
              onChange={(e) => setSelectedNote(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            >
              {CHROMATIC_NOTES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Chord Quality Dropdown */}
          <div>
            <label htmlFor="chord-quality-select" className="block text-sm font-medium text-slate-300 mb-1.5">
              Chord Quality / Type (Major, Minor, Diminished, 7th, Add9...)
            </label>
            <select
              id="chord-quality-select"
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            >
              {CHORD_QUALITIES.map((q) => (
                <option key={q.suffix || 'major'} value={q.suffix}>
                  {q.label} {q.suffix ? `(${q.suffix})` : '(e.g. C)'}
                </option>
              ))}
            </select>
          </div>

          {/* Quick presets */}
          <div>
            <span className="block text-xs font-medium text-slate-400 mb-2">Quick Presets</span>
            <div className="flex flex-wrap gap-1.5">
              {quickChords.map((qc) => (
                <button
                  key={qc}
                  type="button"
                  onClick={() => applyQuickChord(qc)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded border transition-colors ${
                    currentPreview === qc
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-slate-100'
                  }`}
                >
                  {qc}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-6">
            <div>
              {!isNew && onDelete && (
                <button
                  id="chord-delete-btn"
                  type="button"
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Chord
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                id="chord-cancel-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                id="chord-save-btn"
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-md transition-all font-mono"
              >
                <Check className="w-4 h-4" />
                {isNew ? 'Place Chord' : 'Update Chord'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
