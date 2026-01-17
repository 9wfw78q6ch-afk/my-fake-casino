
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  user: User;
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isVisible: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, user, onSendMessage, isOpen, onToggle, isVisible }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Toggle Button - Only shown when closed */}
      {!isOpen && (
        <button 
          onClick={onToggle}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 p-3 bg-slate-900 border-y border-l border-slate-700 rounded-l-2xl transition-all hover:bg-slate-800 shadow-2xl animate-in slide-in-from-right-4"
        >
          <span className="text-xl">💬</span>
        </button>
      )}

      {/* Panel */}
      <aside 
        className={`fixed right-0 top-0 h-screen w-80 bg-slate-900/90 backdrop-blur-xl border-l border-slate-800 z-40 transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full shadow-none'}`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <h2 className="font-orbitron font-bold text-cyan-400">Global Hub</h2>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <button 
            onClick={onToggle}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.type === 'system' ? 'items-center' : ''}`}>
              {msg.type === 'user' ? (
                <div className={`flex gap-3 ${msg.userId === user.id ? 'flex-row-reverse' : ''}`}>
                  <img src={msg.avatar} alt="" className="w-8 h-8 rounded-full border border-slate-700 mt-1" />
                  <div className={`max-w-[75%] space-y-1 ${msg.userId === user.id ? 'text-right' : ''}`}>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{msg.username}</span>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.userId === user.id 
                        ? 'bg-cyan-500/10 text-cyan-100 border border-cyan-500/20' 
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`w-full p-2 rounded-lg text-center ${msg.isBigWin ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-slate-800/50'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${msg.isBigWin ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {msg.text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Broadcast a signal..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-12 py-3 focus:border-cyan-500 outline-none text-sm text-slate-200"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              🚀
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};

export default ChatPanel;
