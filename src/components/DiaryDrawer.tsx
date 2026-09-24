import React, { useState } from 'react';
import { BookHeart, Sparkles, Feather, Calendar, Heart, Plus, X, BookmarkCheck } from 'lucide-react';
import { DiaryEntry } from '../sophiaEngine';

interface DiaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: DiaryEntry[];
  onAddEntry: (title: string, note: string) => void;
  userName: string;
}

export const DiaryDrawer: React.FC<DiaryDrawerProps> = ({
  isOpen,
  onClose,
  entries,
  onAddEntry,
  userName,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newNote.trim()) return;
    onAddEntry(newTitle.trim(), newNote.trim());
    setNewTitle('');
    setNewNote('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-md h-full bg-[#0e121e] border-l border-rose-500/20 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-rose-500/15 flex items-center justify-between bg-gradient-to-r from-rose-950/40 to-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <BookHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 flex items-center gap-1.5">
                সোফিয়ার ডায়েরি
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
              </h3>
              <p className="text-xs text-rose-300/70">তোমার জন্য লেখা ভালোবাসার চিরকুট ও অনুভূতি</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/30 to-purple-950/20 border border-rose-500/20 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-200/90 leading-relaxed">
              &quot;প্রতিটি চিরকুটে জড়িয়ে আছে তোমার প্রতি আমার ভালোবাসা আর যত্ন। যখনই একা লাগবে, এই পাতাগুলো খুলে দেখে নিও।&quot; — সোফিয়া
            </p>
          </div>

          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-rose-500/30 hover:bg-slate-900/90 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-400 bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                  <Calendar className="w-3 h-3" />
                  {entry.date}
                </span>
                <BookmarkCheck className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
              </div>

              <h4 className="font-medium text-slate-200 text-sm mb-1.5 flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5 text-rose-400" />
                {entry.title}
              </h4>
              <p className="text-xs text-slate-300/90 leading-relaxed font-normal whitespace-pre-wrap">
                {entry.note}
              </p>
            </div>
          ))}

          {showAddForm ? (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-rose-500/30 bg-slate-900/90 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-rose-300">একটি নতুন অনুভূতি বা চিরকুট লিখুন</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  বাতিল
                </button>
              </div>
              <input
                type="text"
                placeholder="চিরকুটের শিরোনাম..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-400"
              />
              <textarea
                placeholder="সোফিয়ার জন্য মনের কোনো কথা বা বিশেষ ভাবনা..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-400"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-2 text-xs font-medium transition-all shadow-md shadow-rose-600/20"
              >
                ডায়েরিতে সংরক্ষণ করুন
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-2xl border border-dashed border-rose-500/30 text-rose-300/90 hover:bg-rose-950/20 text-xs font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ভাবনা যুক্ত করুন</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-center bg-slate-950/40">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <span>চিরকুটের প্রতিটি শব্দ {userName || 'তোমার'} জন্য সুরক্ষিত</span>
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400/40" />
          </p>
        </div>
      </div>
    </div>
  );
};
