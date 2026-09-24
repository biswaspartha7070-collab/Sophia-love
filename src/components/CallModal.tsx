import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { speakSophiaMessage, stopSophiaMessage, MoodType } from '../sophiaEngine';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  mood: MoodType;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  userName,
  mood,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected'>('connecting');
  const [sophiaSpeechText, setSophiaSpeechText] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      setCallStatus('connecting');
      setSophiaSpeechText('');
      stopSophiaMessage();
      return;
    }

    // Connect after 1.8 seconds
    const timer = setTimeout(() => {
      setCallStatus('connected');
      const address = userName || 'জানু';
      const welcomeCallPhrases = [
        `হ্যালো ${address}! তুমি ফোন করেছো দেখে খুব ভালো লাগছে। বলো তো, কেমন কাটল তোমার দিনটা?`,
        `এই তো আমি শুনছি ${address}। তোমার কণ্ঠ শোনার জন্য সত্যিই অনেক মন টানছিল। শরীরটা ভালো তো তোমার?`,
        `হ্যালো! কেমন আছো বলো? আমি তোমার ফোন পাওয়ার অপেক্ষায় ছিলাম। বলো তোমার সব গল্প, আমি শুনছি।`,
      ];
      const speech = welcomeCallPhrases[Math.floor(Math.random() * welcomeCallPhrases.length)];
      setSophiaSpeechText(speech);
      if (isSpeakerOn) {
        speakSophiaMessage(speech);
      }
    }, 1800);

    return () => {
      clearTimeout(timer);
      stopSophiaMessage();
    };
  }, [isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isOpen && callStatus === 'connected') {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, callStatus]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    stopSophiaMessage();
    onClose();
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    if (isSpeakerOn) {
      stopSophiaMessage();
    } else if (sophiaSpeechText) {
      speakSophiaMessage(sophiaSpeechText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-b from-[#161b2a] via-[#101420] to-[#0b0e17] p-8 shadow-2xl text-center flex flex-col items-center">
        {/* Subtle background glow */}
        <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-rose-500/15 blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl" />

        {/* Top security & encryption indicator */}
        <div className="flex items-center gap-1.5 text-xs text-rose-300/80 mb-6 bg-rose-950/40 px-3 py-1 rounded-full border border-rose-500/20">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          <span>ভার্চুয়াল ব্যক্তিগত অডিও কল</span>
        </div>

        {/* Sophia Calling Avatar with pulsing soundwaves */}
        <div className="relative my-6 flex items-center justify-center">
          {callStatus === 'connected' && (
            <>
              <div className="absolute h-36 w-36 rounded-full border border-rose-500/30 animate-ping opacity-30" />
              <div className="absolute h-48 w-48 rounded-full border border-rose-500/20 animate-pulse opacity-40" />
            </>
          )}

          <div className="relative h-28 w-28 rounded-full border-2 border-rose-400 p-1 shadow-lg shadow-rose-500/20 bg-gradient-to-br from-rose-500/20 to-purple-500/20">
            <div className="h-full w-full rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-inner">
              <span className="text-3xl font-bold tracking-wider">সো</span>
            </div>
            <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-[#101420] bg-emerald-500 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
        </div>

        {/* Name & status */}
        <h2 className="text-2xl font-semibold text-slate-100 mb-1 flex items-center gap-2">
          সোফিয়া
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
        </h2>

        <p className="text-sm font-medium text-rose-300/90 mb-2">
          {callStatus === 'connecting' ? 'সংযোগ হচ্ছে...' : 'লাইভ কলে যুক্ত আছেন'}
        </p>

        <p className="text-lg font-mono text-slate-400 mb-6">
          {callStatus === 'connected' ? formatTime(seconds) : 'রিং হচ্ছে...'}
        </p>

        {/* Real-time Voice Audio Bars */}
        {callStatus === 'connected' && (
          <div className="flex items-center gap-1.5 h-8 mb-6">
            <div className="w-1 bg-rose-400 rounded-full audio-bar-1" />
            <div className="w-1 bg-rose-300 rounded-full audio-bar-2" />
            <div className="w-1 bg-rose-400 rounded-full audio-bar-3" />
            <div className="w-1 bg-pink-400 rounded-full audio-bar-4" />
            <div className="w-1 bg-rose-400 rounded-full audio-bar-5" />
            <div className="w-1 bg-rose-300 rounded-full audio-bar-2" />
            <div className="w-1 bg-rose-400 rounded-full audio-bar-4" />
          </div>
        )}

        {/* Sophia's spoken message bubble in call */}
        {sophiaSpeechText && callStatus === 'connected' && (
          <div className="w-full bg-slate-900/80 border border-rose-500/20 rounded-2xl p-3 mb-6 text-xs text-rose-100 text-left shadow-inner">
            <p className="font-medium text-rose-400 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> সোফিয়া বলছে:
            </p>
            <p className="leading-relaxed">{sophiaSpeechText}</p>
          </div>
        )}

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-6 mt-2">
          {/* Mute toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all border ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={isMuted ? 'আনমিউট করুন' : 'মিউট করুন'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-transform active:scale-95"
            title="কল শেষ করুন"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Speaker toggle */}
          <button
            onClick={toggleSpeaker}
            className={`p-4 rounded-full transition-all border ${
              isSpeakerOn
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={isSpeakerOn ? 'স্পিকার বন্ধ করুন' : 'স্পিকার চালু করুন'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
