import React, { useState, useEffect } from 'react';
import { StickyNote } from '../types';
import { STICKY_COLORS } from '../utils/chordUtils';
import { StickyNote as StickyIcon, X, Check } from 'lucide-react';

interface StickyNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string, color: string) => void;
  initialNote?: StickyNote | null;
}

export const StickyNoteModal: React.FC<StickyNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote,
}) => {
  const [text, setText] = useState('');
  const [selectedColor, setSelectedColor] = useState(STICKY_COLORS[0].bg);

  useEffect(() => {
    if (initialNote) {
      setText(initialNote.text);
      setSelectedColor(initialNote.color);
    } else {
      setText('');
      setSelectedColor(STICKY_COLORS[0].bg);
    }
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave(text.trim(), selectedColor);
    onClose();
  };

  const currentColorObj = STICKY_COLORS.find((c) => c.bg === selectedColor) || STICKY_COLORS[0];

  return (
    <div
      id="sticky-note-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="sticky-note-modal-dialog"
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="sticky-modal-close-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <StickyIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              {initialNote ? 'Edit Sticky Note' : 'Insert Sticky Note'}
            </h3>
            <p className="text-xs text-slate-400">
              Add performance cues, tempo, capo, or tuning reminders
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text Field */}
          <div>
            <label htmlFor="sticky-text-input" className="block text-sm font-medium text-slate-300 mb-1.5">
              Note Text
            </label>
            <textarea
              id="sticky-text-input"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Capo 1st fret, strumming pattern D-DU-UDU, bridge crescendo..."
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
            />
          </div>

          {/* Color Option Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Color Option
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {STICKY_COLORS.map((col) => {
                const isSelected = selectedColor === col.bg;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedColor(col.bg)}
                    style={{ backgroundColor: col.bg, borderColor: col.border, color: col.text }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'ring-2 ring-amber-400 scale-[1.03] shadow-md'
                        : 'opacity-85 hover:opacity-100 hover:scale-[1.01]'
                    }`}
                  >
                    <span>{col.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div
            style={{
              backgroundColor: currentColorObj.bg,
              borderColor: currentColorObj.border,
              color: currentColorObj.text,
            }}
            className="p-3 rounded-lg border text-xs leading-relaxed min-h-[44px] shadow-xs"
          >
            <span className="text-[10px] uppercase tracking-wider font-bold opacity-75 block mb-1">
              Preview
            </span>
            {text || <span className="italic opacity-60">Type your note above...</span>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              id="sticky-modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="sticky-modal-save-btn"
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-md transition-all"
            >
              <Check className="w-4 h-4" />
              {initialNote ? 'Save Changes' : 'Insert Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
