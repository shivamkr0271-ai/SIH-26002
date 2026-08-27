import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Bot, Send, User, ChevronRight } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', role: 'ai', content: 'Hello Commander. I am NIRA, your North East Intelligence & Routing Assistant. How can I assist you with logistics operations today?' }
];

const SUGGESTIONS = [
  "Which routes are currently at highest risk?",
  "Find the safest route from Guwahati to Aizawl.",
  "Which districts may face supply shortages?",
  "Show critical emergency corridors."
];

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      let aiContent = "I am processing the latest GIS and logistics data for the North Eastern Region. Currently, NH-10 is facing critical disruption due to landslides. I recommend holding non-essential shipments to Gangtok.";
      
      if (text.toLowerCase().includes('guwahati to aizawl')) {
         aiContent = "Based on current road accessibility, rainfall intensity, and terrain risk, Route via Silchar and Kolasib is 23% safer than the alternative. It is recommended for essential medical supplies with an ETA of 11h 35m.";
      } else if (text.toLowerCase().includes('shortage')) {
         aiContent = "Sikkim is currently marked as CRITICAL for supply status. Arunachal Pradesh and Mizoram are AT RISK due to recent weather patterns disrupting primary supply corridors.";
      }

      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: aiContent };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col max-w-4xl mx-auto pb-4">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">AI Logistics Assistant (NIRA)</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Natural language querying for logistics and routing intelligence</p>
      </div>

      <Card noPadding className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#0a0c14] border-gray-300 dark:border-white/10">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-black border border-gray-300 dark:border-white/10'}`}>
                {msg.role === 'ai' ? <Bot className="w-5 h-5 text-black" /> : <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
              </div>
              <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-[#0f121d] border border-gray-200 dark:border-white/5 text-gray-800 dark:text-gray-200 rounded-tr-sm' : 'bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 rounded-tl-sm'}`}>
                <p className="leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-4 max-w-[85%]">
               <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                 <Bot className="w-5 h-5 text-black" />
               </div>
               <div className="p-4 rounded-2xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 rounded-tl-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
               </div>
             </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 bg-gray-100 dark:bg-black/20 border-t border-gray-300 dark:border-white/10 shrink-0">
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTIONS.map((sug, i) => (
              <button 
                key={i}
                onClick={() => handleSend(sug)}
                className="text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-full px-3 py-1.5 transition-colors flex items-center gap-1"
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
              onChange={e => setInput(e.target.value)}
              placeholder="Ask NIRA a question about logistics..." 
              className="w-full bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-gray-900 dark:text-white rounded-lg transition-colors shadow-[0_0_15px_rgba(8,145,178,0.4)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
