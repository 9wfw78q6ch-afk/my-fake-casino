
import React, { useState, useMemo } from 'react';
import { Game } from '../types';
import { INITIAL_GAMES } from '../constants';

interface GamesViewProps {
  onGameSelect: (game: Game) => void;
}

const GamesView: React.FC<GamesViewProps> = ({ onGameSelect }) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filteredGames = useMemo(() => {
    if (activeFilter === 'All') return INITIAL_GAMES;
    return INITIAL_GAMES.filter(game => game.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-orbitron font-bold">Game Lobby</h2>
          <p className="text-slate-500">Choose your destination in the gaming cosmos.</p>
        </div>
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 backdrop-blur">
          {['All', 'Slots', 'Mini Games'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                activeFilter === cat 
                ? 'bg-cyan-500 text-slate-950 neon-glow shadow-lg' 
                : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGames.map(game => (
          <button 
            key={game.id}
            onClick={() => onGameSelect(game)}
            className="text-left group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500 transition-all flex flex-col h-full"
          >
            <div className={`h-48 bg-gradient-to-br ${game.color} flex items-center justify-center relative flex-shrink-0`}>
              <span className="text-7xl group-hover:scale-125 transition-transform duration-500">{game.icon}</span>
              <div className="absolute inset-0 bg-slate-950/20" />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-2xl font-orbitron font-bold text-white group-hover:text-cyan-400 transition-colors">{game.name}</h4>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded border border-slate-800">{game.category}</span>
              </div>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-grow">
                {game.description}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 bg-cyan-500 rounded-full" />)}
                </div>
                <span className="text-xs font-bold text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">Launch Game &rarr;</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="py-20 text-center bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-800">
          <span className="text-5xl block mb-4 grayscale opacity-50">🛰️</span>
          <p className="text-slate-500 font-orbitron">No game signals detected in this sector.</p>
        </div>
      )}
    </div>
  );
};

export default GamesView;
