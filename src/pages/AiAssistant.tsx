import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bot, Send, User, ChevronRight, RefreshCw, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '@/services/api';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  sources?: string[];
  provider?: string;
  timestamp?: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'ai',
    content: 'Hello Commander. I am NIRA, your North East Intelligence & Routing Assistant. I am connected to the live platform context including real-time Open-Meteo weather across 18 NER hubs, Random Forest ML disruption risk predictions, active road incident logs, and vehicle fleet GPS telemetry. How can I assist your logistics operations today?',
    sources: ['Live Platform Context', 'ML Risk Engine'],
    provider: 'NIRA_AI_CORE'
  }
];

const SUGGESTIONS = [
  "Which vehicles are delayed?",
  "What is the current weather risk?",
  "Which route is safest?",
  "Why is Guwahati to Aizawl risky?",
  "What are the current major logistics bottlenecks?",
  "Show me the current fleet status."
];

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<any>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Fetch AI backend service capabilities on mount
    api.getAiStatus().then(res => {
      if (res.data) setAiStatus(res.data);
    }).catch(() => {});
  }, []);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSendingRef.current || isTyping) return;

    setErrorMessage(null);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    isSendingRef.current = true;

    try {
      // Format conversation history for multi-turn context
      const conversationPayload = messages.slice(-6).map(m => ({
        role: m.role === 'user' ? ('user' as const) : ('model' as const),
        content: m.content
      }));

      const res = await api.chatWithAi({
        message: trimmed,
        conversation: conversationPayload
      });

      if (res.data) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: res.data.answer,
          sources: res.data.sources,
          provider: res.data.provider,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        setErrorMessage(res.error || 'Failed to receive AI intelligence response. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while communicating with the AI Assistant.');
    } finally {
      setIsTyping(false);
      isSendingRef.current = false;
    }
  };

  const handleRetryLast = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col max-w-4xl mx-auto pb-4">
      {/* Header */}
      <div className="mb-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">AI Logistics Assistant (NIRA)</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Grounded Intelligence
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Natural language querying for logistics, terrain risks, and corridor accessibility across 8 NER states
          </p>
        </div>
        {aiStatus && (
          <div className="flex items-center gap-2">
            <Badge variant={aiStatus.geminiConfigured ? 'success' : 'default'} className="text-[10px]">
              Engine: {aiStatus.primaryProvider}
            </Badge>
          </div>
        )}
      </div>

      <Card noPadding className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#0a0c14] border-gray-200 dark:border-white/10 shadow-xl overflow-hidden rounded-xl">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'ai' 
                  ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                  : 'bg-gray-800 text-white border border-gray-600'
              }`}>
                {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4 text-gray-200" />}
              </div>

              <div className={`p-4 rounded-2xl flex flex-col gap-2 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-cyan-600/90 text-white rounded-tr-sm border border-cyan-500/30' 
                  : 'bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-tl-sm'
              }`}>
                {/* Message Body */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Sources / Provider Tag for AI Messages */}
                {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-cyan-500" /> Grounded Context:
                    </span>
                    {msg.sources.map((src, sIdx) => (
                      <span key={sIdx} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-mono">
                        {src}
                      </span>
                    ))}
                    {msg.provider && (
                      <span className="ml-auto text-[9px] font-mono text-cyan-500/80">
                        {msg.provider}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
             <div className="flex gap-3 max-w-[85%]">
               <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                 <Bot className="w-4 h-4" />
               </div>
               <div className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-tl-sm flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                  <span className="text-xs font-medium">NIRA is evaluating live platform context...</span>
               </div>
             </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between gap-2 text-xs text-red-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button 
                onClick={handleRetryLast}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Action Panel & Input Box */}
        <div className="p-4 bg-gray-100 dark:bg-black/20 border-t border-gray-200 dark:border-white/10 shrink-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((sug, i) => (
              <button 
                key={i}
                type="button"
                disabled={isTyping}
                onClick={() => handleSend(sug)}
                className="text-xs text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-50 border border-cyan-500/20 rounded-full px-3 py-1.5 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {sug} <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="relative"
          >
            <input 
              type="text" 
              value={input}
              disabled={isTyping}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask NIRA about corridors, weather risks, delayed trucks, or disruptions..." 
              className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-lg transition-colors shadow-[0_0_15px_rgba(8,145,178,0.4)] cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
