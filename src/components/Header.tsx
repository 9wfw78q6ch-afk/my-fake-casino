
import React from 'react';
import { User } from '../types';
import { XP_PER_LEVEL } from '../constants';

interface HeaderProps {
  user: User;
  onProfileClick: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onProfileClick, onSignOut }) => {
  const xpPercentage = (user.xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;

  return (
    <header className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 z-10 sticky top-0">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Balance</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-orbitron font-bold text-yellow-400 neon-text">
              {user.balance.toLocaleString()}
            </span>
            <span className="text-xs text-yellow-500/80 font-bold">GC</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase font-bold">Level {user.level}</span>
            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 neon-glow transition-all duration-500" 
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            {user.xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP to next level
          </span>
        </div>

        <div 
          className="flex items-center gap-3 pl-6 border-l border-slate-800 cursor-pointer hover:bg-slate-900/40 p-2 rounded-xl transition-colors"
          onClick={onProfileClick}
        >
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold">{user.username}</span>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-tighter">Identity Node</span>
          </div>
          <div className="relative">
            <img 
              src={user.avatar} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-slate-800 hover:border-cyan-500 transition-colors"
            />
            <span className="absolute -bottom-1 -right-1 text-xs bg-slate-900 rounded-full w-5 h-5 flex items-center justify-center border border-slate-700 shadow-lg">
              {user.emoji}
            </span>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="ml-4 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-600/40 rounded-lg text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
          title="Sign Out"
        >
          🚪 Exit
        </button>
      </div>
    </header>
  );
};

export default Header;
