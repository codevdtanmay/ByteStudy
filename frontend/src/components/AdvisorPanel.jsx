import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Trash2 } from 'lucide-react';
import MarkdownContent from './MarkdownContent';

export default function AdvisorPanel({ 
  advisorChat, 
  addUserChat, 
  clearChatLogs
}) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [advisorChat, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    addUserChat(inputText);
    setInputText('');
    setIsTyping(true);

    // Typing effect mimic
    setTimeout(() => {
      setIsTyping(false);
    }, 550);
  };

  const handlePresetClick = (presetText) => {
    addUserChat(presetText);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
    }, 550);
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="glass-card border border-slate-200 dark:border-indigo-950/20 flex flex-col h-[calc(100vh-8.5rem)] min-h-[520px] overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-slate-150 dark:border-indigo-950/20 flex justify-between items-center bg-slate-50/50 dark:bg-surface-800/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-650 flex items-center justify-center text-white">
              <Brain size={16} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">ByteAI Academic Co-Pilot</h4>
              <p className="text-[10px] text-emerald-650 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online AI Advisor
              </p>
            </div>
          </div>
          
          <button
            onClick={clearChatLogs}
            className="p-1.5 rounded-lg text-slate-450 hover:bg-slate-100 dark:hover:bg-surface-700 hover:text-rose-500 transition-all cursor-pointer"
            title="Clear Chat Logs"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 dark:bg-[#07070e]/20">
          {advisorChat.map(msg => {
            const isAi = msg.sender === 'ai';
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {isAi && (
                  <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-550 dark:text-indigo-400">
                    <Brain size={12} />
                  </div>
                )}
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 shadow-sm
                  ${isAi 
                    ? 'bg-white dark:bg-surface-800 border border-slate-150 dark:border-indigo-950/15 text-slate-800 dark:text-slate-100 rounded-tl-none'
                    : 'bg-indigo-600 text-white rounded-tr-none'
                  }
                `}>
                  {/* Handle markdown bold formatting locally */}
                  <MarkdownContent text={msg.text} />
                  <span className={`block text-[9px] text-right mt-1.5 opacity-60 font-mono`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-550 dark:text-indigo-455">
                <Brain size={12} className="animate-spin" />
              </div>
              <div className="bg-white dark:bg-surface-800 border border-slate-150 dark:border-indigo-950/15 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Preset Prompt Shortcuts */}
        <div className="px-5 py-3 border-t border-slate-150 dark:border-indigo-950/10 bg-slate-50/30 dark:bg-surface-800/5">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preset Quick Actions:</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {[
              { label: '📅 Study Plan', query: 'Generate a study plan for my subjects' },
              { label: '🚦 Attendance check', query: 'Check my attendance status' },
              { label: '🎯 Target check', query: 'Can I reach my target CGPA?' },
              { label: '🚀 Placement guide', query: 'Give me placement strategy' }
            ].map(p => (
              <button
                key={p.label}
                onClick={() => handlePresetClick(p.query)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-surface-650 bg-white dark:bg-surface-700 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-surface-600 text-[10px] font-bold text-slate-600 dark:text-slate-300 transition-all whitespace-nowrap cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-150 dark:border-indigo-950/20 flex gap-2 bg-slate-50/50 dark:bg-surface-800/10 shrink-0">
          <input 
            type="text"
            placeholder="Ask ByteAI Study Advisor (e.g. 'Generate study plan' or 'target check')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="app-input shadow-sm text-sm"
          />
          <button 
            type="submit"
            className="btn-primary py-2.5 px-4 flex items-center justify-center shrink-0 cursor-pointer shadow-md"
          >
            <Send size={14} />
          </button>
        </form>

      </div>

    </div>
  );
}
