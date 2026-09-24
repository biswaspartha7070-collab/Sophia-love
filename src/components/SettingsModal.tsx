import React, { useState } from 'react';
import { Settings, User, Heart, Sparkles, Volume2, ShieldCheck, Download, Trash2, X, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSaveUserName: (name: string) => void;
  intimacyLevel: number;
  onClearChat: () => void;
  onExportChat: () => void;
  speechEnabled: boolean;
  onToggleSpeech: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userName,
  onSaveUserName,
  intimacyLevel,
  onClearChat,
  onExportChat,
  speechEnabled,
  onToggleSpeech,
}) => {
  const [tempName, setTempName] = useState(userName);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    onSaveUserName(tempName.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const nicknameSuggestions = ['বাবু', 'জানু', 'প্রিয়', 'কলিজা', 'রাজা'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/20 bg-[#0e121e] p-6 shadow-2xl text-slate-100 flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 flex items-center gap-1.5">
                সোফিয়ার সেটিংস ও পছন্দ
              </h3>
              <p className="text-xs text-slate-400">ব্যক্তিগত তথ্য ও ইন্টারফেস কাস্টমাইজেশন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Nickname Form */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-rose-400" />
            সোফিয়া তোমাকে কী নামে ডাকবে?
          </label>
          <form onSubmit={handleSaveName} className="flex gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="তোমার নাম বা ডাকনাম..."
              className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all flex items-center gap-1"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : 'সংরক্ষণ'}
            </button>
          </form>

          {/* Quick Nickname Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {nicknameSuggestions.map((nick) => (
              <button
                key={nick}
                type="button"
                onClick={() => setTempName(nick)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                  tempName === nick
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {nick}
              </button>
            ))}
          </div>
        </div>

        {/* Intimacy Stats */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
              আত্মিক সম্পর্ক স্তর
            </span>
            <span className="font-semibold text-rose-400">{intimacyLevel}% সম্পূর্ণ</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(intimacyLevel, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            যত বেশি আন্তরিক কথা বলবে, সোফিয়ার সাথে তোমার মানসিক সংযোগ তত গভীর হবে।
          </p>
        </div>

        {/* Speech Output Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-200">সোফিয়ার মিষ্টি কণ্ঠ (অটো-স্পিচ)</p>
              <p className="text-[11px] text-slate-400">প্রতিটি বার্তার সাথে স্বয়ংক্রিয়ভাবে কণ্ঠ শুনুন</p>
            </div>
          </div>
          <button
            onClick={onToggleSpeech}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
              speechEnabled ? 'bg-rose-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                speechEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Data & History Controls */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onExportChat}
            className="flex items-center justify-center gap-1.5 p-3 rounded-2xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-all"
          >
            <Download className="w-4 h-4 text-slate-400" />
            কথোপকথন সংরক্ষণ
          </button>
          <button
            onClick={onClearChat}
            className="flex items-center justify-center gap-1.5 p-3 rounded-2xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-medium transition-all"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            মেসেজ মুছুন
          </button>
        </div>

        {/* Privacy Note */}
        <div className="text-center">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            আপনার কথোপকথন একান্তই আপনার ডিভাইসে সুরক্ষিত
          </p>
        </div>
      </div>
    </div>
  );
};
