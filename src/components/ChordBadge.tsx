import React, { useRef, useState, useEffect } from 'react';
import { Chord } from '../types';
import { formatChord } from '../utils/chordUtils';
import { ChevronLeft, ChevronRight, X, GripVertical } from 'lucide-react';

interface ChordBadgeProps {
  chord: Chord;
  lineLength: number;
  charWidthPx: number;
  isSelected?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (newCharIndex: number) => void;
}

export const ChordBadge: React.FC<ChordBadgeProps> = ({
  chord,
  lineLength,
  charWidthPx,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onMove,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const dragStartXRef = useRef<number>(0);
  const startCharIndexRef = useRef<number>(chord.characterIndex);
  const badgeRef = useRef<HTMLDivElement>(null);

  const displayString = formatChord(chord.note, chord.quality);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    e.stopPropagation();
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    startCharIndexRef.current = chord.characterIndex;
    setDragOffsetPx(0);
    onSelect();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartXRef.current;
      setDragOffsetPx(deltaX);

      const deltaChars = Math.round(deltaX / Math.max(charWidthPx, 8));
      const targetIndex = Math.max(0, Math.min(Math.max(lineLength + 15, 80), startCharIndexRef.current + deltaChars));

      if (targetIndex !== chord.characterIndex) {
        onMove(targetIndex);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragOffsetPx(0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, charWidthPx, lineLength, chord.characterIndex, onMove]);

  // Handle keyboard nudge when focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || (e.key === ' ' && e.shiftKey)) {
      e.preventDefault();
      e.stopPropagation();
      onMove(Math.max(0, chord.characterIndex - 1));
    } else if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onMove(chord.characterIndex + 1);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      e.stopPropagation();
      onDelete();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onEdit();
    }
  };

  // Position based on monospace character width
  const leftPositionPx = chord.characterIndex * charWidthPx;

  return (
    <div
      ref={badgeRef}
      id={`chord-badge-${chord.id}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        left: `${leftPositionPx}px`,
        transform: isDragging ? `translateX(${dragOffsetPx}px)` : 'none',
      }}
      className={`group absolute top-0.5 select-none z-10 transition-shadow ${
        isDragging ? 'cursor-grabbing opacity-90 scale-105 z-30' : 'cursor-grab hover:z-20'
      }`}
      title={`Chord: ${displayString} (drag to move, click to edit, Space/Arrows to nudge)`}
    >
      <div
        className={`flex items-center gap-0.5 px-2 py-0.5 rounded-md font-mono text-sm font-black border transition-all ${
          isSelected
            ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-500/50 shadow-md'
            : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/40 hover:border-amber-400 shadow-xs'
        }`}
      >
        {/* Drag handle */}
        <span
          onMouseDown={handleMouseDown}
          className="opacity-50 group-hover:opacity-100 hover:text-amber-200 cursor-grab active:cursor-grabbing mr-0.5"
        >
          <GripVertical className="w-3 h-3" />
        </span>

        {/* Chord text */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="hover:underline cursor-pointer"
        >
          {displayString}
        </span>

        {/* Nudge Left Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMove(Math.max(0, chord.characterIndex - 1));
          }}
          className="hidden group-hover:flex items-center justify-center w-3.5 h-3.5 rounded hover:bg-black/20 text-current transition-colors ml-0.5"
          title="Nudge left (-1 space)"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>

        {/* Nudge Right Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMove(chord.characterIndex + 1);
          }}
          className="hidden group-hover:flex items-center justify-center w-3.5 h-3.5 rounded hover:bg-black/20 text-current transition-colors"
          title="Nudge right (+1 space)"
        >
          <ChevronRight className="w-3 h-3" />
        </button>

        {/* Quick Delete */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-900/40 transition-opacity ml-1"
          title="Delete chord"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Helper tooltip when selected */}
      {isSelected && (
        <div className="absolute -bottom-5 left-0 whitespace-nowrap text-[10px] text-amber-300 font-mono bg-slate-900/90 px-1 rounded pointer-events-none border border-amber-500/30">
          col {chord.characterIndex} | [Space] nudge
        </div>
      )}
    </div>
  );
};
