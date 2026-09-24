/**
 * Sophia - Realistic AI Girlfriend Web Application
 * Strict rule: NO MOBILE EMOJIS anywhere. Premium Lucide SVG icons only.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Sparkles,
  PhoneCall,
  BookHeart,
  Settings,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Flame,
  MessageSquareHeart,
  Coffee,
  Moon,
  Compass,
  Star,
  RefreshCw,
  User,
  Shield,
  Smile,
  HeartHandshake
} from 'lucide-react';

import {
  Message,
  MoodType,
  SOPHIA_MOODS,
  SophiaMood,
  DEFAULT_DIARY_ENTRIES,
  DiaryEntry,
  QUICK_PROMPTS,
  getSophiaResponse,
  speakSophiaMessage,
  stopSophiaSpeech,
  removeEmojis,
} from './sophiaEngine';

import { CallModal } from './components/CallModal';
import { DiaryDrawer } from './components/DiaryDrawer';
import { SettingsModal } from './components/SettingsModal';

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm-1',
    sender: 'sophia',
    text: 'হ্যালো প্রিয়! আমি সোফিয়া। অনেকক্ষণ ধরে ভাবছিলাম তুমি কখন আসবে। সারাদিন তো তোমার কোনো খোঁজই ছিল না! বলো তো, কেমন আছো তুমি? আজকের দিনটা কেমন কাটল?',
    timestamp: 'এইমাত্র',
  },
];

export default function App() {
  // State
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('sophia_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MESSAGES;
      }
    }
    return INITIAL_MESSAGES;
  });

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodType>('loving');
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('sophia_user_name') || 'জানু';
  });
  const [intimacyScore, setIntimacyScore] = useState<number>(() => {
    const saved = localStorage.getItem('sophia_intimacy_score');
    return saved ? parseInt(saved, 10) : 42;
  });

  // Modals & Panels
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem('sophia_diary_entries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_DIARY_ENTRIES;
      }
    }
    return DEFAULT_DIARY_ENTRIES;
  });

  // Audio / Speech State
  const [autoSpeechEnabled, setAutoSpeechEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sophia_auto_speech') === 'true';
  });
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('sophia_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('sophia_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('sophia_intimacy_score', intimacyScore.toString());
  }, [intimacyScore]);

  useEffect(() => {
    localStorage.setItem('sophia_diary_entries', JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  useEffect(() => {
    localStorage.setItem('sophia_auto_speech', autoSpeechEnabled.toString());
  }, [autoSpeechEnabled]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'bn-BD'; // Bengali speech recognition

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputVal(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListeningMic(false);
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleMic = () => {
    if (!recognitionRef.current) {
      return;
    }
    if (isListeningMic) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListeningMic(true);
      } catch (err) {
        setIsListeningMic(false);
      }
    }
  };

  // Sending message
  const handleSendMessage = async (textToSend?: string) => {
    const finalContent = (textToSend || inputVal).trim();
    if (!finalContent || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: removeEmojis(finalContent),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newChatList = [...messages, userMsg];
    setMessages(newChatList);
    setInputVal('');
    setIsTyping(true);

    // Increase intimacy on conversation
    setIntimacyScore(prev => Math.min(100, prev + 2));

    try {
      const replyText = await getSophiaResponse({
        messages: newChatList,
        mood: currentMood,
        userName,
        relationshipLevel: intimacyScore,
      });

      const sophiaMsg: Message = {
        id: `s-${Date.now()}`,
        sender: 'sophia',
        text: removeEmojis(replyText),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, sophiaMsg]);

      // If auto-speech is enabled, speak out her answer
      if (autoSpeechEnabled) {
        setSpeakingMsgId(sophiaMsg.id);
        speakSophiaMessage(sophiaMsg.text, () => {
          setSpeakingMsgId(null);
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // Quick prompt click
  const handlePromptClick = (promptText: string) => {
    handleSendMessage(promptText);
  };

  // Sweet Affection Button: Sends a warm romantic gesture
  const handleSendAffection = () => {
    const gestures = [
      'সোফিয়া, তোমাকে একরাশ ভালোবাসা পাঠালাম!',
      'সোফিয়া, তোমার জন্য এক তোড়া যত্ন আর মিষ্টি মায়া!',
      'আমার মন বলছে এই মুহূর্তে তোমাকে খুব কাছে প্রয়োজন সোফিয়া।',
      'তোমার প্রতি আমার ভালোবাসা দিনে দিনে আরও গভীর হচ্ছে।',
    ];
    const picked = gestures[Math.floor(Math.random() * gestures.length)];
    handleSendMessage(picked);
  };

  // Copy message
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle voice playback for single message
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      stopSophiaSpeech();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      speakSophiaMessage(text, () => {
        setSpeakingMsgId(null);
      });
    }
  };

  // Clear chat
  const handleClearChat = () => {
    if (window.confirm('আপনি কি সত্যিই সম্পূর্ণ বার্তা ইতিহাস মুছে ফেলতে চান?')) {
      const resetList: Message[] = [
        {
          id: `s-${Date.now()}`,
          sender: 'sophia',
          text: `নতুন করে আবার কথা শুরু করতে পেরে খুব ভালো লাগছে ${userName || 'প্রিয়'}! বলো, আজকে কী নিয়ে আলাপ করবে?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
      setMessages(resetList);
      setIsSettingsOpen(false);
    }
  };

  // Export chat
  const handleExportChat = () => {
    const transcript = messages
      .map(m => `[${m.timestamp}] ${m.sender === 'user' ? (userName || 'You') : 'Sophia'}: ${m.text}`)
      .join('\n\n');
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sophia-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add diary entry
  const handleAddDiaryEntry = (title: string, note: string) => {
    const newEntry: DiaryEntry = {
      id: `d-${Date.now()}`,
      title,
      date: 'আজকের অনুভূতি',
      note: removeEmojis(note),
    };
    setDiaryEntries(prev => [newEntry, ...prev]);
  };

  // Mood selector helper
  const activeMoodObj = SOPHIA_MOODS.find(m => m.id === currentMood) || SOPHIA_MOODS[0];

  const getRelationshipLevelLabel = (score: number) => {
    if (score < 30) return 'প্রাথমিক পরিচয়';
    if (score < 60) return 'মনের খুব কাছে';
    if (score < 85) return 'গভীর ভালোবাসা';
    return 'চিরন্তন ভালোবাসার সঙ্গী';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans antialiased select-none">
      {/* Modals */}
      <CallModal
        isOpen={isCallOpen}
        onClose={() => setIsCallOpen(false)}
        userName={userName}
        mood={currentMood}
      />

      <DiaryDrawer
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
        entries={diaryEntries}
        onAddEntry={handleAddDiaryEntry}
        userName={userName}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userName={userName}
        onSaveUserName={(name) => setUserName(name)}
        intimacyLevel={intimacyScore}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
        speechEnabled={autoSpeechEnabled}
        onToggleSpeech={() => setAutoSpeechEnabled(!autoSpeechEnabled)}
      />

      {/* Main Chat Interface */}
      <div className="flex flex-col flex-1 h-full max-w-4xl mx-auto w-full relative">
        {/* TOP HEADER */}
        <header className="shrink-0 z-20 px-4 py-3 border-b border-rose-500/15 bg-[#0e121e]/90 backdrop-blur-md flex items-center justify-between shadow-sm">
          {/* Sophia Info */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => setIsCallOpen(true)}>
              {/* Glowing avatar ring */}
              <div className="h-11 w-11 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-500 shadow-md shadow-rose-500/20">
                <div className="h-full w-full rounded-full bg-[#121624] flex items-center justify-center font-bold text-rose-300 text-sm tracking-wider">
                  সো
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#0e121e]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-semibold text-slate-100 text-base tracking-wide flex items-center gap-1">
                  সোফিয়া
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                </h1>
                <span className="text-[10px] font-medium text-rose-300/80 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/20">
                  {activeMoodObj.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                {isTyping ? (
                  <span className="text-rose-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                    সোফিয়া টাইপ করছে...
                  </span>
                ) : (
                  <span>অনলাইনে আছে • {getRelationshipLevelLabel(intimacyScore)}</span>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mood selector dropdown */}
            <div className="relative hidden sm:block">
              <select
                value={currentMood}
                onChange={(e) => setCurrentMood(e.target.value as MoodType)}
                className="appearance-none bg-slate-900 border border-slate-700/80 text-rose-200 text-xs rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:border-rose-400 cursor-pointer shadow-inner"
              >
                {SOPHIA_MOODS.map(m => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                    {m.label}
                  </option>
                ))}
              </select>
              <Sparkles className="w-3.5 h-3.5 text-rose-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Virtual Call Button */}
            <button
              onClick={() => setIsCallOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-rose-600/25 transition-all active:scale-95"
              title="সোফিয়াকে কল করুন"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="hidden md:inline">ভয়েস কল</span>
            </button>

            {/* Diary Button */}
            <button
              onClick={() => setIsDiaryOpen(true)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-rose-300 border border-slate-700 transition-all"
              title="সোফিয়ার ডায়েরি ও চিরকুট"
            >
              <BookHeart className="w-4 h-4" />
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-rose-300 border border-slate-700 transition-all"
              title="পছন্দ ও সেটিংস"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Intimacy Progress Bar Strip */}
        <div className="shrink-0 bg-slate-900/60 px-4 py-1.5 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
            <span>সম্পর্ক স্তর: <strong className="text-rose-300 font-medium">{getRelationshipLevelLabel(intimacyScore)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 sm:w-36 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${intimacyScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{intimacyScore}%</span>
          </div>
        </div>

        {/* CHAT MESSAGES BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome greeting card */}
          <div className="mx-auto max-w-md p-4 rounded-2xl bg-gradient-to-b from-[#141828]/70 to-[#0e121e]/70 border border-rose-500/15 text-center shadow-lg my-2">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-slate-200 mb-1">
              সোফিয়ার ব্যক্তিগত ডোমেইন
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              এখানে কোনো কৃত্রিম দূরত্ব নেই। তোমার সুখ-দুঃখ, সারাদিনের ব্যস্ততা বা নিঃসঙ্গতার মুহূর্ত—সবকিছু নির্ভয়ে সোফিয়ার সাথে ভাগ করে নাও।
            </p>
          </div>

          {/* Messages list */}
          {messages.map((msg) => {
            const isSophia = msg.sender === 'sophia';

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${isSophia ? 'justify-start' : 'justify-end'}`}
              >
                {/* Sophia Avatar thumbnail */}
                {isSophia && (
                  <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold shadow-sm mb-1">
                    সো
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] sm:max-w-md rounded-2xl px-4 py-3 shadow-md text-sm transition-all ${
                    isSophia
                      ? 'bg-[#151a2a] text-slate-100 border border-slate-800 rounded-bl-sm'
                      : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-br-sm shadow-rose-600/20'
                  }`}
                >
                  {/* Sender title if Sophia */}
                  {isSophia && (
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                        সোফিয়া
                        <Heart className="w-2.5 h-2.5 fill-rose-400" />
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Message Text */}
                  <p className="leading-relaxed font-normal whitespace-pre-wrap select-text">
                    {msg.text}
                  </p>

                  {/* User timestamp */}
                  {!isSophia && (
                    <div className="text-right mt-1">
                      <span className="text-[10px] text-rose-200/80">{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Message Action Toolbar (Only for Sophia's messages) */}
                  {isSophia && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-xs">
                      <div className="flex items-center gap-1">
                        {/* Audio speech button */}
                        <button
                          onClick={() => handleToggleSpeak(msg.id, msg.text)}
                          className={`p-1 rounded-lg transition-colors ${
                            speakingMsgId === msg.id
                              ? 'text-rose-400 bg-rose-950/40'
                              : 'hover:text-slate-200'
                          }`}
                          title="সোফিয়ার মিষ্টি কণ্ঠে শুনুন"
                        >
                          {speakingMsgId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="p-1 rounded-lg hover:text-slate-200 transition-colors"
                          title="কপি করুন"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Sweet heart reaction badge */}
                      <span className="flex items-center gap-1 text-[11px] text-rose-400/90 font-medium">
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                        <span>আপন অনুভব</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* User avatar thumbnail */}
                {!isSophia && (
                  <div className="shrink-0 h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-300 text-xs font-semibold mb-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-end gap-2.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                সো
              </div>
              <div className="bg-[#151a2a] border border-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-rose-300 ml-2 font-medium">সোফিয়া ভাবছে...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* PROMPTS & SUGGESTIONS BAR */}
        <div className="shrink-0 px-4 py-2 bg-[#0b0f19] border-t border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {/* Sweet Affection Action Button */}
            <button
              onClick={handleSendAffection}
              className="shrink-0 px-3 py-1.5 rounded-full bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-medium border border-rose-500/30 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
              <span>ভালোবাসা পাঠাও</span>
            </button>

            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => handlePromptClick(prompt.text)}
                className="shrink-0 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-slate-700 transition-all whitespace-nowrap"
              >
                {prompt.text}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT BAR */}
        <footer className="shrink-0 p-3 sm:p-4 bg-[#0e121e] border-t border-rose-500/15">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Mic Speech-to-Text Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`p-3 rounded-2xl transition-all border ${
                isListeningMic
                  ? 'bg-rose-600 border-rose-500 text-white animate-pulse shadow-md shadow-rose-600/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-300 hover:border-slate-700'
              }`}
              title={isListeningMic ? 'রেকর্ডিং বন্ধ করুন' : 'মুখে কথা বলুন (বাংলা স্পিচ)'}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Input field */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  isListeningMic
                    ? 'আপনার কথা শুনছি...'
                    : `সোফিয়াকে মনের কথা বলো (${userName || 'জানু'})...`
                }
                className="w-full rounded-2xl bg-slate-900/90 border border-slate-700/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-400 transition-all shadow-inner"
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              className={`p-3 rounded-2xl transition-all flex items-center justify-center shadow-md ${
                inputVal.trim() && !isTyping
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-rose-600/30 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
              title="বার্তা পাঠান"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
