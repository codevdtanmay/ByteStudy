import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Trash2 } from 'lucide-react';
import MarkdownContent from './MarkdownContent';

export default function AdvisorPanel({ 
  advisorChat, 
  addUserChat, 
  clearChatLogs,
  compact = false
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
    <div className="byteai-panel w-full animate-fade-in">
      <div className={`byteai-surface glass-card flex flex-col overflow-hidden ${compact ? 'h-full min-h-0' : 'h-[calc(100vh-8.5rem)] min-h-[520px]'}`}>
        
        {/* Chat Header */}
        <div className="byteai-header px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="byteai-avatar w-8 h-8 rounded-lg flex items-center justify-center text-white">
              <Brain size={16} />
            </div>
            <div>
              <h4 className="font-bold text-sm">ByteAI Academic Co-Pilot</h4>
              <p className="byteai-status text-[10px] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online AI Advisor
              </p>
            </div>
          </div>
          
          <button
            onClick={clearChatLogs}
            className="byteai-clear p-1.5 rounded-lg transition-all cursor-pointer"
            title="Clear Chat Logs"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Messages List Area */}
        <div className="byteai-messages flex-1 p-5 overflow-y-auto space-y-4">
          {advisorChat.map(msg => {
            const isAi = msg.sender === 'ai';
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {isAi && (
                  <div className="byteai-message-avatar w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                    <Brain size={12} />
                  </div>
                )}
                <div className={`byteai-bubble p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 shadow-sm
                  ${isAi 
                    ? 'byteai-bubble-ai rounded-tl-none'
                    : 'byteai-bubble-user text-white rounded-tr-none'
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
              <div className="byteai-message-avatar w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                <Brain size={12} className="animate-spin" />
              </div>
              <div className="byteai-typing p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Preset Prompt Shortcuts */}
        <div className="byteai-actions px-5 py-3">
          <p className="byteai-actions-label text-[9px] font-bold uppercase tracking-wider mb-2">Preset Quick Actions:</p>
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
                className="byteai-quick-action px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="byteai-input-bar p-3 flex gap-2 shrink-0">
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
