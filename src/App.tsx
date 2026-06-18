import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, PendingReviewTask, GoldenDatasetItem, CropMetadata } from './types';
import { LANGUAGES, TRANSLATIONS, SUGGESTIONS } from './data';
import { 
  Mic, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Search, 
  Award, 
  Check, 
  CheckCircle2, 
  FileText, 
  History, 
  Languages, 
  ShieldCheck, 
  HelpCircle, 
  Database,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  BookOpen,
  MessageSquare,
  Wheat,
  Activity,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Simple Markdown compiler specifically optimized for clean presentation of agricultural instructions and standard AI formatting
function SimpleMarkdown({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  
  let currentListItems: React.ReactNode[] = [];
  let currentListName: 'ul' | 'ol' | null = null;
  let listKeyCounter = 0;

  const flushList = () => {
    if (currentListItems.length > 0) {
      const ListTag = currentListName === 'ol' ? 'ol' : 'ul';
      const listClass = currentListName === 'ol' 
        ? 'list-decimal pl-5 my-2 space-y-1' 
        : 'list-disc pl-5 my-2 space-y-1';
      renderedElements.push(
        <ListTag key={`list-${renderedElements.length}`} className={listClass}>
          {...currentListItems}
        </ListTag>
      );
      currentListItems = [];
      currentListName = null;
    }
  };

  const parseInlineStyles = (partText: string): React.ReactNode[] => {
    const parts = partText.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-bold text-gray-950">{part}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    if (!trimmed) {
      flushList();
      return;
    }

    // 1. Headers Check
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      flushList();
      const level = headerMatch[1].length;
      const headingText = headerMatch[2];
      const parsedHeading = parseInlineStyles(headingText);
      
      let headerClass = "font-bold text-gray-900 mt-3 mb-1 block ";
      if (level === 1) headerClass += "text-base md:text-lg border-b border-gray-100 pb-1";
      else if (level === 2) headerClass += "text-sm md:text-base";
      else if (level === 3) headerClass += "text-xs md:text-sm uppercase tracking-wider text-emerald-800";
      else headerClass += "text-xs italic";

      renderedElements.push(
        <span key={`h-${index}`} className={headerClass}>
          {parsedHeading}
        </span>
      );
      return;
    }

    // 2. Unordered lists: starting with * or - followed by space
    const ulMatch = trimmed.match(/^[\*\-]\s+(.*)$/);
    if (ulMatch) {
      if (currentListName !== 'ul') {
        flushList();
        currentListName = 'ul';
      }
      listKeyCounter++;
      currentListItems.push(
        <li key={`li-${index}-${listKeyCounter}`} className="text-xs md:text-sm leading-relaxed text-gray-800 my-0.5">
          {parseInlineStyles(ulMatch[1])}
        </li>
      );
      return;
    }

    // 3. Ordered lists: starting with numbers like "1." or "2." followed by space
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (currentListName !== 'ol') {
        flushList();
        currentListName = 'ol';
      }
      listKeyCounter++;
      currentListItems.push(
        <li key={`li-${index}-${listKeyCounter}`} className="text-xs md:text-sm leading-relaxed text-gray-800 my-0.5">
          {parseInlineStyles(olMatch[2])}
        </li>
      );
      return;
    }

    // 4. Regular Paragraph line
    flushList();
    renderedElements.push(
      <p key={`p-${index}`} className="text-xs md:text-sm leading-relaxed text-gray-700 my-1">
        {parseInlineStyles(line)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-0.5">{renderedElements}</div>;
}

export default function App() {
  // Global States
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  
  // Stats & States fetched from API
  const [goldenCount, setGoldenCount] = useState<number>(3);
  const [popCount, setPopCount] = useState<number>(5);
  const [pendingReviews, setPendingReviews] = useState<PendingReviewTask[]>([]);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  
  // Search state & diagnostics pathway
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchStep, setSearchStep] = useState<number>(0); // 0: idle, 1: checking Golden, 2: checking PoP, 3: checking AI
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active workspace page
  // 'farmer' for farmer-friendly chat client, 'expert' for review board portal
  const [activePortal, setActivePortal] = useState<'farmer' | 'expert'>('farmer');

  // Multi-lingual translation strings helper
  const t = (key: string) => {
    return TRANSLATIONS[selectedLang]?.[key] || TRANSLATIONS['en'][key];
  };

  // Voice Speech Recognition States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showVoiceSimulation, setShowVoiceSimulation] = useState<boolean>(false);
  const [recognitionError, setRecognitionError] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  // Audio Text-to-Speech States
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  // Expert panel review workspace states
  const [activeReviewTask, setActiveReviewTask] = useState<PendingReviewTask | null>(null);
  const [modifiedAnswerText, setModifiedAnswerText] = useState<string>('');
  const [expertNameInput, setExpertNameInput] = useState<string>('Dr. Ramesh Patel');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState<boolean>(false);

  // Initial Welcome Messages & Stats load
  useEffect(() => {
    // Clear conversation and load greeting based on language selection
    setMessages([
      {
        id: 'welcome',
        sender: 'agriverify',
        text: t('welcomeSearchMsg'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tier: 1,
        sourceType: 'System Companion'
      }
    ]);
    fetchStats();
  }, [selectedLang]);

  // Fetch metrics and review queue from Node server
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setGoldenCount(stats.goldenDatasetCount);
        setPopCount(stats.popGuidesCount);
      }
      
      const queueRes = await fetch('/api/review/queue');
      if (queueRes.ok) {
        const queue = await queueRes.json();
        setPendingReviews(queue);
      }
    } catch (err) {
      console.warn('API fetch failed, falling back to local simulation metrics.');
    } finally {
      setStatsLoading(false);
    }
  };

  // Run 3-Tier Diagnostic Search
  const handleFarmerSearch = async (queryText: string) => {
    if (!queryText || queryText.trim() === '') return;
    setInputText('');
    setSearchQuery(queryText);
    
    // Add farmer message to chat list
    const newFarmerMsg: ChatMessage = {
      id: `farmer_${Date.now()}`,
      sender: 'farmer',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newFarmerMsg]);

    // Go through slow-motion visual diagnostics stepper so the user can understand how AgriVerify works under the hood
    setIsSearching(true);
    
    // Stage 1: Searching Golden Dataset (Verified expert Q&A pairs)
    setSearchStep(1);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Stage 2: Checking Standard Agricultural Packages of Practices
    setSearchStep(2);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Stage 3: Consulting AI Language Model (Gemini Fallback)
    setSearchStep(3);
    await new Promise(resolve => setTimeout(resolve, 700));

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: queryText, language: selectedLang })
      });

      if (res.ok) {
        const result = await res.json();
        const agriMsg: ChatMessage = {
          id: `agri_${Date.now()}`,
          sender: 'agriverify',
          text: result.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tier: result.tier,
          sourceType: result.source,
          reviewTaskId: result.reviewTaskId,
          metadata: result.metadata,
          verifiedBy: result.verifiedBy,
          sourcesList: result.sources
        };
        setMessages(prev => [...prev, agriMsg]);
      } else {
        throw new Error('API server returned error');
      }
    } catch (err) {
      // Fallback response for unconfigured environments
      const agriOfflineMsg: ChatMessage = {
        id: `agri_${Date.now()}`,
        sender: 'agriverify',
        text: `🌾 **Offline Diagnostics Alert**\n\nYour question about **"${queryText}"** was processed. To trigger live answers from Gemini, please configure standard secrets.\n\n**Agronomy Recommendations:**\n- Ensure proper field aerating.\n- Apply neem-oil concentrate if leaves display pests.\n- Check localized state watering calendars.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tier: 2,
        sourceType: 'AgriVerify Failover Engine',
        verifiedBy: 'Standard Soil Protection Manual'
      };
      setMessages(prev => [...prev, agriOfflineMsg]);
    } finally {
      setIsSearching(false);
      setSearchStep(0);
      setSearchQuery('');
      fetchStats();
    }
  };

  // Browser Speak (Text to Speech) with standard Web Speech synthesis
  const handleToggleSpeak = (text: string, msgId: string) => {
    if (activeSpeechId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop old speech
    
    // Clean markdown before speaking
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/`/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Match speaking language
    if (selectedLang === 'te') utterance.lang = 'te-IN';
    else if (selectedLang === 'hi') utterance.lang = 'hi-IN';
    else if (selectedLang === 'kn') utterance.lang = 'kn-IN';
    else utterance.lang = 'en-US';

    utterance.onend = () => {
      setActiveSpeechId(null);
    };

    utterance.onerror = () => {
      setActiveSpeechId(null);
    };

    window.speechSynthesis.speak(utterance);
    setActiveSpeechId(msgId);
  };

  // Speech Recognition (Speech to Text)
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Browser doesn't support speech recognition or inside a sandboxed frame
      setRecognitionError('Web speech recognition is partially constrained in this sandbox environment. Showing simulation control.');
      setShowVoiceSimulation(true);
      return;
    }

    try {
      const recObj = new SpeechRecognition();
      recObj.continuous = false;
      recObj.interimResults = false;

      // Set ISO codes
      if (selectedLang === 'te') recObj.lang = 'te-IN';
      else if (selectedLang === 'hi') recObj.lang = 'hi-IN';
      else if (selectedLang === 'kn') recObj.lang = 'kn-IN';
      else recObj.lang = 'en-US';

      recObj.onstart = () => {
        setIsRecording(true);
        setRecognitionError('');
      };

      recObj.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleFarmerSearch(transcript);
        }
      };

      recObj.onerror = (event: any) => {
        console.warn('Speech Engine error:', event.error);
        if (event.error === 'not-allowed') {
          setRecognitionError('Microphone permission blocked. Activating friendly visual helper.');
          setShowVoiceSimulation(true);
        } else {
          setRecognitionError(`Speech recognition status: ${event.error}. Loading speech guides.`);
          setShowVoiceSimulation(true);
        }
        setIsRecording(false);
      };

      recObj.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recObj;
      recObj.start();
    } catch (e) {
      setShowVoiceSimulation(true);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  // Expert action: Approve or modify pending AI answer
  const handleExpertAction = async (action: 'approve' | 'modify') => {
    if (!activeReviewTask) return;
    
    setReviewSubmitLoading(true);
    try {
      const body = {
        id: activeReviewTask.id,
        action,
        modifiedAnswer: action === 'modify' ? modifiedAnswerText : activeReviewTask.aiAnswer,
        expertName: expertNameInput
      };

      const res = await fetch('/api/review/act', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setActiveReviewTask(null);
        setModifiedAnswerText('');
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100/60 shadow-xs px-4 py-3 md:py-4 transition-all shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-600 to-green-700 text-white p-2 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-700/10 hover:scale-105 transition-transform" id="nav-brand-logo">
              <Wheat className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-emerald-900 font-display">
                  AgriVerify
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2 py-0.5 rounded-full font-mono">
                  Farmer Friend
                </span>
              </div>
              <p className="text-xs text-orange-850/80 font-medium">
                {t('subtitle')}
              </p>
            </div>
          </div>

          {/* Controls: Portal Swapping & Multilingual Language Selector */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            
            {/* Swapper tabs */}
            <div className="bg-orange-50/50 p-1 rounded-xl border border-orange-150/50 inline-flex text-xs font-semibold shrink-0">
              <button
                onClick={() => setActivePortal('farmer')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activePortal === 'farmer'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-gray-600 hover:text-emerald-900 hover:bg-orange-100/30'
                }`}
                id="portal-tab-farmer"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Speak to Advisor
              </button>
              
              <button
                onClick={() => {
                  setActivePortal('expert');
                  fetchStats();
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all relative cursor-pointer ${
                  activePortal === 'expert'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-gray-600 hover:text-emerald-900 hover:bg-orange-100/30'
                }`}
                id="portal-tab-expert"
              >
                <UserCheck className="h-3.5 w-3.5" /> {t('reviewTab')}
                {pendingReviews.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white font-mono text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {pendingReviews.length}
                  </span>
                )}
              </button>
            </div>

            {/* Language dropdown button */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-2xs hover:bg-gray-50 transition-colors">
              <Languages className="h-3.5 w-3.5 text-gray-500" />
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1 text-gray-800"
                id="lang-selector"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>
      </header>

      {/* METRICS & BANNER BOARD */}
      <section className="bg-emerald-900 text-emerald-50 border-b border-emerald-800 shrink-0 relative overflow-hidden py-5 md:py-6 px-4">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl pointer-events-none animate-glow-leaf" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <span className="text-[10px] tracking-wider uppercase font-extrabold bg-emerald-800/80 border border-emerald-700 text-emerald-300 px-2.5 py-0.5 rounded mr-2">
              Three-Tier Model Check
            </span>
            <h2 className="text-lg md:text-xl font-bold tracking-tight mt-1">
              {t('title')}
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              1. Golden Q&A Pairs ➔ 2. Standard Agricultural Guidelines (PoP) ➔ 3. AI fallbacks checked by human experts
            </p>
          </div>

          {/* Quick Real-Time Counter Badges */}
          <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            
            <div className="bg-emerald-950/80 border border-emerald-800/80 p-2.5 rounded-xl shrink-0 flex items-center gap-2.5 min-w-[110px]" id="counter-golden">
              <div className="text-amber-400 bg-amber-500/10 p-1.5 rounded-lg">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-350 uppercase tracking-wider">{t('datasetCount')}</p>
                <p className="text-base font-black text-white">{goldenCount}</p>
              </div>
            </div>

            <div className="bg-emerald-950/80 border border-emerald-800/80 p-2.5 rounded-xl shrink-0 flex items-center gap-2.5 min-w-[110px]" id="counter-pop">
              <div className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg">
                <Search className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-350 uppercase tracking-wider">{t('popCount')}</p>
                <p className="text-base font-black text-white">{popCount}</p>
              </div>
            </div>

            <div className="bg-emerald-950/80 border border-emerald-800/80 p-2.5 rounded-xl shrink-0 flex items-center gap-2.5 min-w-[110px]" id="counter-reviews">
              <div className="text-sky-400 bg-sky-500/10 p-1.5 rounded-lg">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-350 uppercase tracking-wider">Awaiting Evaluation</p>
                <p className="text-base font-black text-white">{pendingReviews.length}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRIMARY VIEWS LAYOUT CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:py-6 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* VIEW 1: FARMER SPEAK TO ADVISOR PORTAL */}
        {activePortal === 'farmer' && (
          <div className="flex-grow flex flex-col md:flex-row gap-6 w-full h-full">
            
            {/* LEFT COLUMN: Suggestions & Local Question History */}
            <div className="w-full md:w-80 flex flex-col gap-4 shrink-0">
              
              {/* Sugession Questions list */}
              <div className="bg-white border border-gray-150 p-4 rounded-3xl shadow-3xs flex flex-col">
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
                  <h3 className="text-sm font-bold text-gray-900 font-display">
                    {t('suggestionsTitle')}
                  </h3>
                </div>
                <div className="space-y-2 overflow-y-auto max-h-[280px] md:max-h-[380px] pr-1">
                  {SUGGESTIONS[selectedLang]?.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleFarmerSearch(sug.text)}
                      className="w-full text-left p-2.5 rounded-2xl bg-orange-50/50 hover:bg-orange-100/50 border border-transparent hover:border-orange-100 text-xs font-medium text-amber-950 transition-all flex gap-2 items-start"
                    >
                      <span className="text-emerald-700 font-bold shrink-0 mt-0.5">•</span>
                      <span>{sug.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Offline Guidelines Helper Panel */}
              <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-3xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-15">
                  <Wheat className="w-20 h-20 text-emerald-800" />
                </div>
                <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1 mb-1">
                  <HelpCircle className="h-3.5 w-3.5" /> How does searching work?
                </h4>
                <p className="text-[11px] text-emerald-950 leading-relaxed">
                  We look for <strong>golden verified pairs</strong> first. If none match word-for-word, we query the state agricultural crop practices guidelines databases. If that also misses, the AI engine builds a professional prompt securely to assist you.
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN: Farmer Chat Interface */}
            <div className="flex-1 bg-white border border-gray-150 rounded-3xl shadow-sm flex flex-col overflow-hidden h-[500px] md:h-[600px]">
              
              {/* Chat Title bar */}
              <div className="bg-orange-50/60 border-b border-orange-100 px-4 py-3 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    {t('title')} — Interactive Advisory Channel
                  </span>
                </div>
                <div className="text-[10px] uppercase font-mono font-bold bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-lg">
                  ISO-LANG: {selectedLang}
                </div>
              </div>

              {/* Chat Messages scroll area */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-orange-50/10">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${msg.sender === 'farmer' ? 'items-end' : 'items-start'}`}
                    >
                      {/* Message Bubble wrapper */}
                      <div className={`max-w-[85%] rounded-2xl p-3.5 ${
                        msg.sender === 'farmer' 
                          ? 'bg-emerald-800 text-white shadow-2xs' 
                          : 'bg-white border border-gray-150/80 shadow-2xs text-gray-850'
                      }`}>
                        
                        {/* If system message, show badge */}
                        {msg.sender === 'agriverify' && msg.tier && (
                          <div className="flex flex-wrap items-center gap-2 mb-2 font-mono text-[9px] font-bold select-none">
                            <span className={`px-2 py-0.5 rounded-full ${
                              msg.tier === 1 
                                ? 'bg-amber-100 text-amber-800 border border-amber-250/50' 
                                : msg.tier === 2 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-250/50' 
                                : 'bg-blue-50 text-blue-800 border border-blue-250/50'
                            }`}>
                              {msg.tier === 1 ? t('tier1') : msg.tier === 2 ? t('tier2') : t('tier3')}
                            </span>
                            
                            {msg.metadata && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                🌾 {msg.metadata.crop} ({msg.metadata.category})
                              </span>
                            )}
                          </div>
                        )}

                        {/* Message body text */}
                        <div className="break-words">
                          <SimpleMarkdown text={msg.text} />
                        </div>

                        {/* Helper badges and TTS buttons inside AgriVerify Bubble */}
                        {msg.sender === 'agriverify' && (
                          <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-500">
                            
                            <span className="italic flex items-center gap-1 shrink-0">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              <span>{msg.verifiedBy || 'Agricultural scholar verification'}</span>
                            </span>

                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleToggleSpeak(msg.text, msg.id)}
                                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-bold cursor-pointer transition-all ${
                                  activeSpeechId === msg.id
                                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                {activeSpeechId === msg.id ? (
                                  <>
                                    <VolumeX className="h-3 w-3" /> {t('speakBtnStop')}
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="h-3 w-3 text-emerald-700" /> {t('speakBtnPlay')}
                                  </>
                                )}
                              </button>
                            </div>

                          </div>
                        )}

                      </div>

                      {/* Display Alert bottom notice if generated via AI fallback */}
                      {msg.sender === 'agriverify' && msg.tier === 3 && (
                        <div className="mt-1 bg-amber-50 text-[10px] text-amber-800 px-3 py-1 rounded-lg border border-amber-150/40 flex items-center gap-1.5 max-w-[85%] flex-row shadow-2xs">
                          <span className="flex h-2 w-2 relative shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                          </span>
                          <span>{t('tier3Notice')}</span>
                        </div>
                      )}

                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* ACTIVE DIAGNOSTIC MULTI-TIER LOOKUP LOADER */}
                {isSearching && (
                  <motion.div
                     initial={{ opacity: 0, y: 15 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-white border border-orange-100 p-4 rounded-2xl max-w-[80%] shadow-2xs flex flex-col space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="animate-spin text-emerald-600">
                        <RotateCcw className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-extrabold text-amber-950 uppercase tracking-widest font-mono">
                        AgriVerify 3-Tier Multi-Check...
                      </span>
                    </div>

                    {/* Progressive diagnostic steps */}
                    <div className="space-y-2 text-xs">
                      
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] text-gray-700 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className={`h-3.5 w-3.5 ${searchStep >= 1 ? 'text-amber-500' : 'text-gray-300'}`} />
                          <span>1. Matches Golden dataset (Expert-reviewed Q&As)</span>
                        </span>
                        <span className={`font-mono text-[9px] font-bold uppercase ${searchStep === 1 ? 'text-amber-500 animate-pulse' : searchStep > 1 ? 'text-green-600' : 'text-gray-300'}`}>
                          {searchStep === 1 ? 'Active' : searchStep > 1 ? 'Checked' : 'Waiting'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] text-gray-700 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className={`h-3.5 w-3.5 ${searchStep >= 2 ? 'text-emerald-500' : 'text-gray-300'}`} />
                          <span>2. Standard Packages of Practices (Government DB)</span>
                        </span>
                        <span className={`font-mono text-[9px] font-bold uppercase ${searchStep === 2 ? 'text-emerald-500 animate-pulse' : searchStep > 2 ? 'text-green-600' : 'text-gray-300'}`}>
                          {searchStep === 2 ? 'Active' : searchStep > 2 ? 'Checked' : 'Waiting'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] text-gray-700 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className={`h-3.5 w-3.5 ${searchStep >= 3 ? 'text-blue-500' : 'text-gray-300'}`} />
                          <span>3. Fallback Generation via Gemini LLM model</span>
                        </span>
                        <span className={`font-mono text-[9px] font-bold uppercase ${searchStep === 3 ? 'text-blue-500 animate-pulse' : 'text-gray-300'}`}>
                          {searchStep === 3 ? 'Active' : 'Waiting'}
                        </span>
                      </div>

                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input form & Voice Recorders */}
              <div className="bg-orange-50/50 border-t border-orange-100 p-3 shrink-0 flex flex-col gap-2">
                
                {/* Embedded error notification */}
                {recognitionError && (
                  <div className="text-[10px] text-rose-600 font-medium px-2 py-0.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-between">
                    <span>{recognitionError}</span>
                    <button onClick={() => setRecognitionError('')} className="font-mono text-gray-400 hover:text-red-600 font-bold ml-1">×</button>
                  </div>
                )}

                {/* Form row */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputText.trim() !== '') {
                      handleFarmerSearch(inputText);
                    }
                  }}
                  className="flex items-center gap-2.5 w-full"
                >
                  
                  {/* Microphone speech trigger */}
                  <button
                    type="button"
                    onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
                    className={`h-11 w-11 rounded-full shrink-0 flex items-center justify-center transition-all cursor-pointer relative ${
                      isRecording 
                        ? 'bg-rose-600 text-white ring-4 ring-rose-600/30' 
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-250/60 hover:bg-emerald-100'
                    }`}
                    title="Speak question (STT)"
                  >
                    {isRecording ? (
                      <span className="absolute inline-flex h-full w-full rounded-full bg-rose-600/60 opacity-75 animate-ping" />
                    ) : null}
                    <Mic className="h-5 w-5" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isRecording ? t('recording') : t('textPlaceholder')}
                    disabled={isSearching}
                    className="flex-1 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 px-4 py-2.5 rounded-full text-xs md:text-sm font-medium transition-all"
                    id="farmer-chat-input"
                  />

                  <button
                    type="submit"
                    disabled={inputText.trim() === '' || isSearching}
                    className="h-11 w-11 rounded-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-gray-205 disabled:text-gray-400 text-white shrink-0 flex items-center justify-center transition-all cursor-pointer select-none"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>

              </div>

            </div>

            {/* FLOATING DIALOG OVERLAY FOR MIC CONSTRAINED / SIMULATION ENVIRONMENTS */}
            {showVoiceSimulation && (
              <div className="fixed inset-0 bg-[#352515]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-[#FAF8F5] border-2 border-emerald-950 max-w-md w-full rounded-3xl p-6 shadow-2xl flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-800 text-white p-2 rounded-2xl flex items-center justify-center">
                        <Mic className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900 font-display">Farmer Voice Input</h4>
                        <p className="text-xs text-emerald-850 font-bold uppercase tracking-wider">Bilingual Simulator</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setShowVoiceSimulation(false);
                        setRecognitionError('');
                      }} 
                      className="text-gray-400 hover:text-red-700 font-bold bg-white border border-gray-200 h-7 w-7 rounded-full flex items-center justify-center cursor-pointer shadow-3xs"
                    >
                      ×
                    </button>
                  </div>

                  <p className="text-xs text-gray-650 leading-relaxed bg-white p-3 border border-gray-150 rounded-2xl">
                    Farmers can directly click other speech suggestion cards to simulate voice recording in regional languages (e.g. Telugu, Kannada). Click to inject and proceed:
                  </p>

                  <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                    {SUGGESTIONS[selectedLang]?.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputText(sug.text);
                          setShowVoiceSimulation(false);
                          setRecognitionError('');
                          handleFarmerSearch(sug.text);
                        }}
                        className="w-full text-left p-3 rounded-2xl bg-orange-50 border border-orange-100 hover:bg-emerald-50 hover:border-emerald-250 text-xs font-semibold text-gray-800 transition-all flex gap-3 items-center"
                      >
                        <Volume2 className="h-4 w-4 text-emerald-800 shrink-0" />
                        <span>{sug.text}</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-emerald-950 p-3 rounded-2xl text-center text-emerald-200 text-xs font-mono">
                    <span className="font-bold flex items-center justify-center gap-2 animate-pulse">
                      <span>●</span> Simulated Audio Channel Online
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: EXPERT REVIEW PORTAL */}
        {activePortal === 'expert' && (
          <div className="flex-grow flex flex-col md:flex-row gap-6 w-full">
            
            {/* LEFT COLUMN: Queue of AI responses waiting for verification */}
            <div className="w-full md:w-96 flex flex-col gap-4 shrink-0">
              <div className="bg-white border border-gray-150 p-4 rounded-3xl shadow-3xs flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider font-display">
                      Review Queue
                    </h3>
                  </div>
                  <span className="bg-amber-50 text-amber-900 border border-amber-250 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {pendingReviews.length} Pending
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
                  {t('reviewDesc')}
                </p>

                {pendingReviews.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-2" />
                    <p className="text-xs font-bold text-gray-700">{t('queueEmpty')}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Queries are added here only when a farmer asks a question that triggers the Tier 3 AI model fallback.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
                    {pendingReviews.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => {
                          setActiveReviewTask(task);
                          setModifiedAnswerText(task.aiAnswer);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs flex flex-col gap-1.5 cursor-pointer ${
                          activeReviewTask?.id === task.id
                            ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/15'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                          <span>QID: {task.id.slice(4)}</span>
                          <span className="bg-orange-50 text-orange-900 border border-orange-150 px-2 py-0.5 rounded">
                            🌾 {task.cropMetadata.crop}
                          </span>
                        </div>
                        <p className="font-extrabold text-[#352515] leading-relaxed line-clamp-2">
                          "{task.question}"
                        </p>
                        <p className="text-[10px] text-gray-400 font-semibold">
                          Created at: {new Date(task.createdAt).toLocaleTimeString()}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Active Review/Modify Board Workspace */}
            <div className="flex-1 bg-white border border-gray-150 rounded-3xl shadow-sm flex flex-col overflow-hidden min-h-[450px]">
              
              {/* Workspace Header */}
              <div className="bg-orange-50/40 border-b border-orange-100 px-4 py-3 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wider">
                  <UserCheck className="h-4 w-4 text-emerald-800" />
                  <span>AgriVerify Expert Validation Workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold text-gray-600">Expert Name:</label>
                  <input
                    type="text"
                    value={expertNameInput}
                    onChange={(e) => setExpertNameInput(e.target.value)}
                    className="bg-white border border-gray-300 text-xs px-2 py-1 rounded focus:outline-emerald-800"
                  />
                </div>
              </div>

              {/* Active Task Workspace area */}
              {activeReviewTask ? (
                <>
                  <div className="flex-grow p-5 space-y-4 overflow-y-auto">
                  
                  {/* Farmer Question Section */}
                  <div className="bg-orange-50/30 p-3.5 border border-orange-100 rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
                      Farmer Question ({activeReviewTask.language.toUpperCase()}):
                    </span>
                    <p className="text-xs md:text-sm font-extrabold text-amber-950 leading-relaxed">
                      "{activeReviewTask.question}"
                    </p>
                    {activeReviewTask.cropMetadata && (
                      <div className="flex gap-2 mt-2 font-mono text-[9px] font-bold">
                        <span className="bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded">
                          Crop: {activeReviewTask.cropMetadata.crop}
                        </span>
                        <span className="bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded">
                          State: {activeReviewTask.cropMetadata.state}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* AI Fallback Answer Editor */}
                  <div className="flex flex-col space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex justify-between items-center">
                      <span>Scientific Advisory Recommendation (Modify or Approve standard text):</span>
                      <span className="font-mono bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded">Source: Gemini 3.5 AI Generated</span>
                    </span>
                    
                    <textarea
                      value={modifiedAnswerText}
                      onChange={(e) => setModifiedAnswerText(e.target.value)}
                      className="w-full text-xs md:text-sm font-medium border border-gray-300 rounded-2xl p-4 min-h-[160px] md:min-h-[220px] focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 leading-relaxed font-sans bg-white text-gray-900 shadow-xs"
                      placeholder="Type or modify scientific agricultural advice here..."
                    />

                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 mt-2 block">
                      Interactive Rendered Preview (As seen by the Farmer):
                    </span>
                    <div className="bg-emerald-50/20 border border-emerald-150 rounded-2xl p-4 min-h-[80px] max-h-[220px] overflow-y-auto text-gray-900">
                      {modifiedAnswerText.trim() ? (
                        <SimpleMarkdown text={modifiedAnswerText} />
                      ) : (
                        <span className="text-xs text-gray-400 italic">No text to preview. Type something in the advisory box above.</span>
                      )}
                    </div>
                  </div>
                </div>

                  {/* Review Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
                    <button
                      onClick={() => {
                        setActiveReviewTask(null);
                        setModifiedAnswerText('');
                      }}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                      disabled={reviewSubmitLoading}
                    >
                      Cancel Selection
                    </button>

                    <div className="flex gap-3">
                      
                      {/* Approve modified advice */}
                      <button
                        onClick={() => handleExpertAction('modify')}
                        disabled={reviewSubmitLoading || modifiedAnswerText === activeReviewTask.aiAnswer}
                        className="px-4 py-2.5 rounded-xl border border-emerald-600 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-40"
                      >
                        <Check className="h-4 w-4" /> Save Amended Advice
                      </button>

                      {/* Approve as-is */}
                      <button
                        onClick={() => handleExpertAction('approve')}
                        disabled={reviewSubmitLoading}
                        className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-950/15 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Confirm & Approve Guidelines
                      </button>

                    </div>
                  </div>

                </>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-orange-50/10">
                  <UserCheck className="h-12 w-12 text-emerald-700/40 mb-3" />
                  <h4 className="text-sm font-bold text-gray-800">No Advisory Task Selected</h4>
                  <p className="text-xs text-gray-500 max-w-sm mt-1 leading-relaxed">
                    Select any farmer question on the pending review queue to audit the AI fallback response. You can modify chemical dosages or approve standard best practices to update the Golden Dataset.
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-emerald-950 text-emerald-300/60 text-xs py-6 md:py-8 border-t border-emerald-900 mt-auto shrink-0 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="font-bold text-emerald-100 flex items-center gap-1.5 justify-center sm:justify-start">
              <Wheat className="h-4 w-4 text-emerald-400" /> Simple & Understandable AgriVerify Platform
            </p>
            <p className="text-[11px] text-emerald-305/70 mt-0.5">
              Powered by the official agricultural 3-Tier priority protocol (Golden Dataset ➔ Standard PoP ➔ Secure Gemini Fallbacks).
            </p>
          </div>
          <div className="flex gap-4 text-emerald-450 uppercase tracking-widest text-[10px] font-semibold font-mono">
            <span>Verified Knowledge Base</span>
            <span>•</span>
            <span>Bilingual Speech Guides</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
