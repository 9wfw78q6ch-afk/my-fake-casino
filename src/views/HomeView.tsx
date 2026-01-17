
import React from 'react';
import { User, Game } from '../types';
import { INITIAL_GAMES } from '../constants';

interface HomeViewProps {
  user: User;
  fortune: string;
  isFortuneLoading: boolean;
  onGameSelect: (game: Game) => void;
  dealerMsg: string;
}

const HomeView: React.FC<HomeViewProps> = ({ user, fortune, isFortuneLoading, onGameSelect, dealerMsg }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Welcome Section */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="text-9xl">🎰</span>
          </div>
          <h2 className="text-4xl font-orbitron font-bold mb-4">Welcome back, <span className="text-cyan-400">{user.username}</span></h2>
          <div className="p-4 bg-slate-800/50 rounded-xl border-l-4 border-cyan-500 mb-6">
            <p className="text-slate-300 italic">" {dealerMsg} "</p>
            <p className="text-[10px] text-cyan-400 mt-2 uppercase font-bold">— NOVA DEALER AI</p>
          </div>
          <button 
            onClick={() => onGameSelect(INITIAL_GAMES[0])}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all transform hover:scale-105 neon-glow"
          >
            Fast Launch Nebula Spins
          </button>
        </div>

        {/* Daily Fortune Card */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔮</span>
              <h3 className="text-lg font-orbitron font-bold text-purple-400">Daily Oracle</h3>
            </div>
            <div className="bg-slate-950/50 rounded-xl p-4 min-h-[100px] flex items-center justify-center text-center">
              {isFortuneLoading ? (
                <div className="animate-pulse text-slate-600">Calculating cosmic variables...</div>
              ) : (
                <p className="text-slate-300 text-sm leading-relaxed">{fortune}</p>
              )}
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter text-slate-500 mb-2">
              <span>Luck Synchronicity</span>
              <span>88%</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '88%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Games */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-orbitron font-bold">Trending Sectors</h3>
          <button className="text-cyan-400 text-sm font-bold hover:underline">View All Games</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_GAMES.map(game => (
            <div 
              key={game.id}
              onClick={() => onGameSelect(game)}
              className="group cursor-pointer relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all transform hover:-translate-y-1"
            >
              <div className={`h-32 bg-gradient-to-br ${game.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
              <div className="p-6">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{game.icon}</div>
                <h4 className="text-lg font-bold mb-1">{game.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{game.description}</p>
              </div>
              <div className="absolute top-4 right-4 bg-slate-950/80 px-2 py-1 rounded text-[10px] font-bold text-slate-300 border border-slate-700">
                {game.category}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
