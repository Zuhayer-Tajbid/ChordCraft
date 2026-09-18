import React, { useState, useRef, useEffect } from 'react';
import { Key as KeyIcon, Check, ChevronDown, Edit2 } from 'lucide-react';
import { CHROMATIC_NOTES } from '../utils/chordUtils';

interface EditableKeyBadgeProps {
  currentKey: string;
  onKeyChange: (newKey: string) => void;
}

const COMMON_KEYS = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F',
  'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm',
];

export const EditableKeyBadge: React.FC<EditableKeyBadgeProps> = ({
  currentKey,
  onKeyChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customKey, setCustomKey] = useState(currentKey || 'C');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCustomKey(currentKey || 'C');
  }, [currentKey]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectKey = (key: string) => {
    onKeyChange(key);
    setCustomKey(key);
    setIsOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customKey.trim()) {
      onKeyChange(customKey.trim());
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        id="editable-key-badge-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 hover:border-amber-500/50 text-xs font-mono transition-all shadow-xs cursor-pointer"
        title="Click to edit musical key"
      >
        <KeyIcon className="w-3 h-3 text-amber-400 group-hover:rotate-12 transition-transform" />
        <span>Key:</span>
        <strong className="text-amber-400 font-bold text-sm ml-0.5">
          {currentKey || 'C'}
        </strong>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : 'group-hover:text-slate-200'}`} />
        <Edit2 className="w-2.5 h-2.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
      </button>

      {isOpen && (
        <div
          id="key-selector-popover"
          className="absolute left-0 top-full mt-1.5 z-50 w-72 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-100 text-slate-100"
        >
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Select Song Key
            </span>
            <span className="text-[10px] text-amber-400 font-mono font-medium">
              Current: {currentKey}
            </span>
          </div>

          {/* Quick Major Keys */}
          <div className="mb-2.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Major Keys
            </span>
            <div className="grid grid-cols-6 gap-1">
              {COMMON_KEYS.slice(0, 12).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleSelectKey(k)}
                  className={`py-1 rounded text-xs font-mono font-bold border transition-colors ${
                    currentKey === k
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                      : 'bg-slate-800 text-slate-200 border-slate-700/80 hover:bg-slate-700 hover:text-amber-300'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Minor Keys */}
          <div className="mb-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Minor Keys
            </span>
            <div className="grid grid-cols-6 gap-1">
              {COMMON_KEYS.slice(12).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleSelectKey(k)}
                  className={`py-1 rounded text-xs font-mono font-bold border transition-colors ${
                    currentKey === k
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                      : 'bg-slate-800 text-slate-200 border-slate-700/80 hover:bg-slate-700 hover:text-amber-300'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-slate-800 flex items-center gap-1.5">
            <input
              type="text"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="e.g. F#m or Bb"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono flex items-center gap-1 transition-colors"
            >
              <Check className="w-3 h-3" />
              Set
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
