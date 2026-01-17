
import React, { useMemo } from 'react';
import { User } from '../types';
import { INITIAL_GAMES } from '../constants';

interface ProfileViewProps {
  user: User;
  onUpdateEmoji: (emoji: string) => void;
}

const AVAILABLE_EMOJIS = ['🛸', '🤖', '👾', '🚀', '⭐', '☄️', '🌑', '🔋', '⚙️', '🌌', '🧬', '🔭', '📡', '💎', '🔥'];

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateEmoji }) => {
  const favoriteGame = useMemo(() => {
    const counts = user.stats.gamePlayCounts;
    let maxCount = -1;
    let favId = '';
    
    Object.entries(counts).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favId = id;
      }
    });
    
    return INITIAL_GAMES.find(g => g.id === favId) || INITIAL_GAMES[0];
  }, [user.stats.gamePlayCounts]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar and Identity Section */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
            
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-slate-800 p-1 group-hover:border-cyan-500 transition-colors duration-500">
                <img 
                  src={user.avatar} 
                  alt="Identity" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-950 border-2 border-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-2xl group-hover:scale-110 transition-transform">
                {user.emoji}
              </div>
            </div>
            
            <h2 className="text-2xl font-orbitron font-bold text-white mb-1">{user.username}</h2>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em] mb-4">Established Node: {new Date(user.joinedAt).toLocaleDateString()}</p>
            
            <div className="flex gap-2 justify-center w-full mt-4">
              <div className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                LVL {user.level}
              </div>
              <div className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                ELITE STATUS
              </div>
            </div>
          </div>

          {/* Emoji Picker / Customization */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Signal Frequency (Emoji)</h3>
            <div className="grid grid-cols-5 gap-2">
              {AVAILABLE_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => onUpdateEmoji(e)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border ${
                    user.emoji === e 
                    ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="flex-1 w-full space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Biggest Win Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Historical Peak Yield</span>
              <div className="text-6xl mb-4">🏆</div>
              <div className="text-center">
                <span className="text-4xl font-orbitron font-bold text-yellow-400 neon-text">{user.stats.biggestWin.toLocaleString()}</span>
                <span className="ml-2 text-yellow-500 font-bold">GC</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 italic">"Records are meant to be broken."</p>
            </div>
          </div>

          {/* Favorite Game Sector */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex items-center gap-8 relative overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-r ${favoriteGame.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
            <div className="text-7xl group-hover:scale-110 transition-transform">{favoriteGame.icon}</div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Preferred Combat Sector</span>
              <h4 className="text-2xl font-orbitron font-bold text-white mb-2">{favoriteGame.name}</h4>
              <p className="text-sm text-slate-400 max-w-md">{favoriteGame.description}</p>
            </div>
            <div className="hidden sm:block text-right">
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Deployments</span>
              <span className="text-3xl font-orbitron font-bold text-cyan-400">{user.stats.gamePlayCounts[favoriteGame.id] || 0}</span>
            </div>
          </div>
          
          {/* Achievement Progress Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-orbitron font-bold text-white">Milestone Sync</h3>
                <span className="text-xs text-slate-500 font-bold uppercase">{user.achievements.length} / 24 Unlocked</span>
             </div>
             <div className="grid grid-cols-6 gap-3">
                {Array.from({length: 12}).map((_, i) => (
                  <div key={i} className={`aspect-square rounded-xl flex items-center justify-center border ${i < user.achievements.length ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-700'}`}>
                    {i < user.achievements.length ? '⭐' : '🔒'}
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
