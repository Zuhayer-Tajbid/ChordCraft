import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, X, RefreshCw } from 'lucide-react';
import { DEFAULT_LYRICS_TEXT } from '../data/defaultSong';

interface ImportLyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string, title?: string, artist?: string) => void;
  currentLyricsText: string;
}

export const ImportLyricsModal: React.FC<ImportLyricsModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [lyricsText, setLyricsText] = useState(DEFAULT_LYRICS_TEXT);
  const [title, setTitle] = useState('Someone You Loved');
  const [artist, setArtist] = useState('Lewis Capaldi');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use filename without extension as default title
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    if (fileNameWithoutExt) {
      setTitle(fileNameWithoutExt);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setLyricsText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lyricsText.trim()) return;
    onImport(lyricsText, title.trim() || 'Untitled Song', artist.trim() || 'Unknown Artist');
    onClose();
  };

  const loadDefaultPreset = () => {
    setLyricsText(DEFAULT_LYRICS_TEXT);
    setTitle('Someone You Loved');
    setArtist('Lewis Capaldi');
  };

  return (
    <div
      id="import-lyrics-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="import-lyrics-dialog"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 text-slate-100 relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="import-lyrics-close-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Load or Paste Lyrics (.txt)</h3>
            <p className="text-xs text-slate-400">
              Upload any lyrics .txt file or paste raw text. Every lyric line will get an interactive chord space above it.
            </p>
          </div>
        </div>

        <form onSubmit={handleApply} className="flex flex-col flex-1 min-h-0 space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="import-song-title" className="block text-xs font-medium text-slate-300 mb-1">
                Song Title
              </label>
              <input
                id="import-song-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song Title"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="import-song-artist" className="block text-xs font-medium text-slate-300 mb-1">
                Artist / Band
              </label>
              <input
                id="import-song-artist"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              id="upload-txt-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              Upload .txt File
            </button>
            <button
              type="button"
              onClick={loadDefaultPreset}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-lg transition-colors ml-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset to Someone You Loved
            </button>
          </div>

          {/* Lyrics text area */}
          <div className="flex-1 flex flex-col min-h-[220px]">
            <label htmlFor="import-lyrics-textarea" className="block text-xs font-medium text-slate-300 mb-1">
              Lyrics Content (Line by Line)
            </label>
            <textarea
              id="import-lyrics-textarea"
              value={lyricsText}
              onChange={(e) => setLyricsText(e.target.value)}
              placeholder="Paste lyrics here..."
              rows={10}
              className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              {lyricsText.split(/\r?\n/).filter(Boolean).length} lyric lines detected
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                id="apply-import-btn"
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-md transition-all font-mono"
              >
                <Check className="w-4 h-4" />
                Load Lyrics
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
