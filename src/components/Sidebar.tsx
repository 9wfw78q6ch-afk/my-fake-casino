
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  showSocialUI: boolean;
  onToggleSocialUI: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, showSocialUI, onToggleSocialUI }) => {
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: '🏠' },
    { id: 'profile', label: 'Identity Node', icon: '👤' },
    { id: 'games', label: 'Play Games', icon: '🎮' },
    { id: 'wallet', label: 'Wallet', icon: '💳' },
    { id: 'friends', label: 'Friends', icon: '👥' },
    { id: 'leaderboard', label: 'Hall of Fame', icon: '🏆' },
    { id: 'achievements', label: 'Milestones', icon: '✨' },
  ];

  return (
    <aside className="w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center neon-glow">
          <span className="text-xl">🌌</span>
        </div>
        <h1 className="hidden md:block font-orbitron text-xl font-bold text-cyan-400 neon-text">NOVA</h1>
      </div>

      <nav className="flex-1 mt-6 px-3 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              activeView === item.id 
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="hidden md:block">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Social Interface</span>
              <button 
                onClick={onToggleSocialUI}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${showSocialUI ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showSocialUI ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
           </div>
        </div>

        <div className="hidden md:block p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Support AI</p>
          <p className="text-sm text-slate-300">"The Nebula rewards the bold."</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
