
import React from 'react';

const LeaderboardView: React.FC = () => {
  const leaders = [
    { rank: 1, name: 'NebulaKing', level: 88, earnings: '1,240,500', avatar: 'https://picsum.photos/seed/l1/100' },
    { rank: 2, name: 'VoidWalker', level: 75, earnings: '980,200', avatar: 'https://picsum.photos/seed/l2/100' },
    { rank: 3, name: 'NovaSurfer', level: 72, earnings: '850,000', avatar: 'https://picsum.photos/seed/l3/100' },
    { rank: 4, name: 'CyberPilot', level: 42, earnings: '450,100', avatar: 'https://picsum.photos/seed/nova/100' },
    { rank: 5, name: 'Zenith', level: 39, earnings: '420,000', avatar: 'https://picsum.photos/seed/l5/100' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-orbitron font-bold text-cyan-400 neon-text">Intergalactic Hall of Fame</h2>
        <p className="text-slate-500 mt-2">The highest-performing nodes in the Nova network.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 px-8 py-4 bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="col-span-1">Rank</div>
          <div className="col-span-6">Operator</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-3 text-right">Total Earnings</div>
        </div>
        <div className="divide-y divide-slate-800">
          {leaders.map((leader) => (
            <div key={leader.rank} className={`grid grid-cols-12 px-8 py-6 items-center hover:bg-slate-800/30 transition-colors ${leader.name === 'CyberPilot' ? 'bg-cyan-500/5 border-l-4 border-cyan-500' : ''}`}>
              <div className="col-span-1">
                {leader.rank === 1 && <span className="text-xl">🥇</span>}
                {leader.rank === 2 && <span className="text-xl">🥈</span>}
                {leader.rank === 3 && <span className="text-xl">🥉</span>}
                {leader.rank > 3 && <span className="font-orbitron text-slate-500">#{leader.rank}</span>}
              </div>
              <div className="col-span-6 flex items-center gap-4">
                <img src={leader.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-700" />
                <span className="font-bold text-slate-100">{leader.name}</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="px-2 py-1 bg-slate-950 rounded text-xs text-cyan-400 border border-cyan-500/20">{leader.level}</span>
              </div>
              <div className="col-span-3 text-right">
                <span className="font-orbitron font-bold text-yellow-400">{leader.earnings} GC</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardView;
