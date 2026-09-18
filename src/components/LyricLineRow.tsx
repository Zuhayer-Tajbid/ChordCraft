import React, { useRef, useState } from 'react';
import { LyricLine, Chord } from '../types';
import { ChordBadge } from './ChordBadge';
import { Plus, Trash2, Edit2, Check } from 'lucide-react';

interface LyricLineRowProps {
  line: LyricLine;
  lineIndex: number;
  charWidthPx: number;
  selectedChordId: string | null;
  onSelectChord: (chordId: string | null) => void;
  onRequestInsertChord: (lineIndex: number, charIndex: number) => void;
  onEditChord: (lineIndex: number, chord: Chord) => void;
  onDeleteChord: (lineIndex: number, chordId: string) => void;
  onMoveChord: (lineIndex: number, chordId: string, newCharIndex: number) => void;
  onUpdateLineText: (lineIndex: number, newText: string) => void;
  onDeleteLine: (lineIndex: number) => void;
}

export const LyricLineRow: React.FC<LyricLineRowProps> = ({
  line,
  lineIndex,
  charWidthPx,
  selectedChordId,
  onSelectChord,
  onRequestInsertChord,
  onEditChord,
  onDeleteChord,
  onMoveChord,
  onUpdateLineText,
  onDeleteLine,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverCharIndex, setHoverCharIndex] = useState<number | null>(null);
  const [isEditingText, setIsEditingText] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(line.text);

  const isSectionHeader = line.isSectionHeader || /^\s*\[.*\]\s*$/.test(line.text);
  const isBlank = line.text.trim().length === 0;

  // Track hover along the chord bar to show column guide
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const charIndex = Math.max(0, Math.floor(clickX / charWidthPx));
    setHoverCharIndex(charIndex);
  };

  const handleMouseLeave = () => {
    setHoverCharIndex(null);
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const charIndex = Math.max(0, Math.floor(clickX / charWidthPx));
    onRequestInsertChord(lineIndex, charIndex);
  };

  const handleSaveText = () => {
    onUpdateLineText(lineIndex, editText);
    setIsEditingText(false);
  };

  if (isSectionHeader) {
    return (
      <div id={`line-section-${line.id}`} className="group relative my-4 pt-3 pb-1 border-b border-slate-800 flex items-center justify-between">
        {isEditingText ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveText()}
              autoFocus
              className="bg-slate-800 border border-amber-500/50 rounded px-2 py-1 font-mono text-amber-400 font-bold text-sm w-full max-w-sm"
            />
            <button
              onClick={handleSaveText}
              className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <h3 className="font-mono text-sm uppercase tracking-wider text-amber-500 font-bold flex items-center gap-2">
            <span>{line.text}</span>
            <button
              onClick={() => setIsEditingText(true)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition-opacity"
              title="Edit Section Name"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </h3>
        )}

        <button
          onClick={() => onDeleteLine(lineIndex)}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity text-xs flex items-center gap-1"
          title="Delete Section Header"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (isBlank) {
    return (
      <div id={`line-blank-${line.id}`} className="group relative h-8 hover:bg-slate-800/20 rounded flex items-center px-2">
        <span className="text-[11px] font-mono text-slate-600 select-none w-8">{lineIndex + 1}</span>
        <span className="text-xs text-slate-600 italic select-none opacity-0 group-hover:opacity-100">
          (Empty line — click row to edit)
        </span>
        <button
          onClick={() => onDeleteLine(lineIndex)}
          className="opacity-0 group-hover:opacity-100 ml-auto text-slate-500 hover:text-rose-400 p-1"
          title="Delete Line"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      id={`line-row-${line.id}`}
      className="group relative my-1.5 pt-1 pb-1 rounded-lg transition-colors hover:bg-slate-800/30 px-2"
    >
      {/* Line Controls & Indicator on Left */}
      <div className="absolute -left-10 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-mono text-slate-500 select-none w-5 text-right">
          {lineIndex + 1}
        </span>
      </div>

      {/* CHORD LANE: The extra space above the line for chords */}
      <div className="flex items-center gap-2">
        {/* Quick Add Chord Button */}
        <button
          type="button"
          onClick={() => onRequestInsertChord(lineIndex, 0)}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 rounded transition-all shrink-0"
          title="Add chord at start of this line"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Chord Track Space */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative flex-1 h-7 rounded border border-dashed border-transparent group-hover:border-slate-800/80 hover:bg-slate-800/40 cursor-cell transition-all select-none overflow-visible"
          title="Click anywhere to place a chord on this line"
        >
          {/* Subtle column guide indicator on hover */}
          {hoverCharIndex !== null && (
            <div
              style={{ left: `${hoverCharIndex * charWidthPx}px` }}
              className="absolute top-0 bottom-0 pointer-events-none border-l border-amber-400/40 flex items-center pl-1 z-0"
            >
              <span className="text-[9px] font-mono text-amber-300/80 bg-slate-900/80 px-1 rounded">
                + chord @ col {hoverCharIndex}
              </span>
            </div>
          )}

          {/* Render All Chords Placed On This Line */}
          {line.chords.map((chord) => (
            <ChordBadge
              key={chord.id}
              chord={chord}
              lineLength={line.text.length}
              charWidthPx={charWidthPx}
              isSelected={selectedChordId === chord.id}
              onSelect={() => onSelectChord(chord.id)}
              onEdit={() => onEditChord(lineIndex, chord)}
              onDelete={() => onDeleteChord(lineIndex, chord.id)}
              onMove={(newIndex) => onMoveChord(lineIndex, chord.id, newIndex)}
            />
          ))}
        </div>
      </div>

      {/* LYRIC TEXT: Printed as given in txt file */}
      <div className="flex items-center gap-2 pl-7">
        {isEditingText ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveText()}
              autoFocus
              className="bg-slate-800 border border-amber-500/50 rounded px-2 py-1 font-mono text-slate-100 text-base w-full"
            />
            <button
              onClick={handleSaveText}
              className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDoubleClick={() => setIsEditingText(true)}
            className="font-mono text-base text-slate-200 tracking-normal whitespace-pre leading-relaxed select-text cursor-text"
            title="Double click to edit lyrics text"
          >
            {line.text}
          </div>
        )}

        {/* Hover Line Actions */}
        <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
          <button
            type="button"
            onClick={() => setIsEditingText(!isEditingText)}
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
            title="Edit line lyrics"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteLine(lineIndex)}
            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
            title="Delete line"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
