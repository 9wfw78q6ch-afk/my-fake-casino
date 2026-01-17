
import React, { useState, useMemo } from 'react';
import { Task, User, TaskType } from '../types.ts';

interface AchievementsViewProps {
  allTasks: Task[];
  user: User;
  friendsCount: number;
  onClaim: (task: Task) => void;
}

const AchievementsView: React.FC<AchievementsViewProps> = ({ allTasks, user, friendsCount, onClaim }) => {
  const [activeTab, setActiveTab] = useState<TaskType>('milestone');

  const getProgress = (task: Task) => {
    switch (task.category) {
      case 'level': return user.level;
      case 'friends': return friendsCount;
      case 'wager': return user.stats.totalWagered;
      case 'win': return user.stats.biggestWin;
      case 'plays': 
        const totalPlays = Object.values(user.stats.gamePlayCounts).reduce((a: number, b: number) => a + b, 0);
        return totalPlays;
      default: return 0;
    }
  };

  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => t.type === activeTab);
  }, [allTasks, activeTab]);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-400';
      case 'Medium': return 'text-cyan-400';
      case 'Hard': return 'text-purple-400';
      case 'Elite': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-orbitron font-bold">Missions & Milestones</h2>
          <p className="text-slate-500">Synchronize your node with global objectives for heavy GC & XP rewards.</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 backdrop-blur">
          {[
            { id: 'daily', label: 'Daily', icon: '🔋' },
            { id: 'weekly', label: 'Weekly', icon: '🏃' },
            { id: 'milestone', label: 'Milestones', icon: '✨' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TaskType)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-cyan-500 text-slate-950 neon-glow shadow-lg' 
                : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTasks.map(task => {
          const currentProgress = getProgress(task);
          const isCompleted = currentProgress >= task.requirement;
          const isClaimed = user.achievements.includes(task.id);
          const progressPercent = Math.min(100, (currentProgress / task.requirement) * 100);

          return (
            <div 
              key={task.id} 
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all relative overflow-hidden group ${
                isClaimed 
                ? 'bg-slate-900/50 border-emerald-500/30 opacity-70 grayscale-[0.5]' 
                : isCompleted
                ? 'bg-slate-900 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.1)] scale-[1.02] z-10'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Diff Badge */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                <div className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700">
                  <span className={getDifficultyColor(task.difficulty)}>{task.difficulty}</span>
                </div>
                {isClaimed && (
                  <div className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400">
                    SECURED
                  </div>
                )}
              </div>

              <div className="mb-6 pt-2">
                <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform duration-500">{task.icon}</div>
                <h4 className="text-lg font-bold mb-1 text-center font-orbitron">{task.title}</h4>
                <p className="text-[11px] text-slate-500 text-center leading-relaxed h-8 line-clamp-2">{task.description}</p>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                    <span>Progress</span>
                    <span>{currentProgress.toLocaleString()} / {task.requirement.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${
                        isClaimed ? 'bg-emerald-500' : isCompleted ? 'bg-cyan-400 neon-glow shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-slate-700'
                      }`} 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-tighter">
                  <div className="flex-1 py-1 px-2 rounded-lg bg-slate-900/80 border border-slate-800 text-yellow-400 flex items-center justify-center gap-1.5">
                    🪙 {task.reward.toLocaleString()}
                  </div>
                  <div className="flex-1 py-1 px-2 rounded-lg bg-slate-900/80 border border-slate-800 text-cyan-400 flex items-center justify-center gap-1.5">
                    ✨ {task.xpReward.toLocaleString()}
                  </div>
                </div>

                <div className="pt-1">
                  {isClaimed ? (
                    <div className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase text-center flex items-center justify-center gap-2">
                      <span className="text-xs">✔</span> Clear
                    </div>
                  ) : isCompleted ? (
                    <button 
                      onClick={() => onClaim(task)}
                      className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-bold uppercase tracking-widest transition-all neon-glow animate-pulse group-hover:scale-[1.02]"
                    >
                      Sync Rewards
                    </button>
                  ) : (
                    <div className="w-full py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-600 text-[10px] font-bold uppercase text-center flex items-center justify-center gap-2">
                      <span className="opacity-50">🔒</span> Objective Locked
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="py-20 text-center bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-800">
          <span className="text-5xl block mb-4 grayscale opacity-50">🛰️</span>
          <p className="text-slate-500 font-orbitron">No active mission signals.</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsView;
