import React, { useState, useRef, useEffect } from 'react';
import { StickyNote } from '../types';
import { STICKY_COLORS } from '../utils/chordUtils';
import { GripVertical, Trash2, Edit3 } from 'lucide-react';

interface StickyNoteCardProps {
  note: StickyNote;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onEdit: (note: StickyNote) => void;
  onDelete: (id: string) => void;
}

export const StickyNoteCard: React.FC<StickyNoteCardProps> = ({
  note,
  onUpdatePosition,
  onEdit,
  onDelete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: note.x,
    startY: note.y,
  });

  const colorConfig = STICKY_COLORS.find((c) => c.bg === note.color) || {
    bg: note.color || '#fef9c3',
    border: '#facc15',
    text: '#713f12',
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.pageX,
      mouseY: e.pageY,
      startX: note.x,
      startY: note.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.pageX - dragStartRef.current.mouseX;
      const deltaY = e.pageY - dragStartRef.current.mouseY;

      // Keep within page document boundaries
      const maxDocWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
      const newX = Math.max(10, Math.min(maxDocWidth - (note.width || 240) - 16, dragStartRef.current.startX + deltaX));
      const newY = Math.max(60, dragStartRef.current.startY + deltaY);

      onUpdatePosition(note.id, newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, note.id, note.width, onUpdatePosition]);

  return (
    <div
      id={`sticky-note-${note.id}`}
      style={{
        left: `${note.x}px`,
        top: `${note.y}px`,
        backgroundColor: colorConfig.bg,
        borderColor: colorConfig.border,
        color: colorConfig.text,
        width: note.width ? `${note.width}px` : '240px',
      }}
      className={`absolute z-30 rounded-xl shadow-lg border p-3.5 select-none transition-shadow duration-150 ${
        isDragging ? 'shadow-2xl scale-[1.02] cursor-grabbing ring-2 ring-amber-500/40' : 'hover:shadow-xl'
      }`}
    >
      {/* Header bar: Icon on top left corner for dragging using mouse, icons for edit and delete on right */}
      <div className="flex items-center justify-between pb-2 border-b border-black/10 mb-2.5">
        {/* Top left corner icon to drag using mouse */}
        <div
          id={`sticky-drag-handle-${note.id}`}
          onMouseDown={handleMouseDown}
          className="flex items-center gap-1 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-black/10 transition-colors text-black/60 hover:text-black"
          title="Drag to place anywhere on the screen"
        >
          <GripVertical className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Move</span>
        </div>

        {/* Right side: Edit & Delete buttons */}
        <div className="flex items-center gap-1">
          <button
            id={`sticky-edit-btn-${note.id}`}
            type="button"
            onClick={() => onEdit(note)}
            className="p-1 text-black/60 hover:text-black hover:bg-black/10 rounded transition-colors"
            title="Edit sticky note"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            id={`sticky-delete-btn-${note.id}`}
            type="button"
            onClick={() => onDelete(note.id)}
            className="p-1 text-black/60 hover:text-rose-700 hover:bg-black/10 rounded transition-colors"
            title="Delete sticky note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Note Content */}
      <div className="text-sm font-sans whitespace-pre-wrap break-words leading-relaxed select-text cursor-text min-h-[48px]">
        {note.text || <span className="italic opacity-50">Empty note...</span>}
      </div>
    </div>
  );
};
