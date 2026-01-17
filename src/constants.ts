// src/constants.ts

import { Game, Task, Friend } from './types';

export const INITIAL_GAMES: Game[] = [
  {
    id: 'mines',
    name: 'Quantum Mines',
    description: 'Deactivate tiles to find gems. Avoid the hidden breaches to cash out big.',
    category: 'Mini Games',
    icon: '💣',
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'slots',
    name: 'Nebula Spins',
    description: '3-reel galactic slot machine with massive multipliers.',
    category: 'Slots',
    icon: '🎰',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'slots_retro',
    name: 'Pixel Pulse',
    description: '8-bit retro gaming vibes with glitchy high-score rewards.',
    category: 'Slots',
    icon: '🕹️',
    color: 'from-pink-500 to-indigo-600'
  },
  {
    id: 'slots_wild',
    name: 'Savage Reels',
    description: 'Deep jungle high-stakes safari. Hunt for the Golden Lion.',
    category: 'Slots',
    icon: '🦁',
    color: 'from-emerald-600 to-yellow-700'
  },
  {
    id: 'slots_gold',
    name: 'Stellar Gold',
    description: 'Unearthed treasures from an ancient cosmic empire. Solar wins await.',
    category: 'Slots',
    icon: '☀️',
    color: 'from-yellow-600 to-amber-900'
  },
  {
    id: 'slots_arcane',
    name: 'Arcane Reels',
    description: 'Master the elements and conjure massive multipliers in the wizard tower.',
    category: 'Slots',
    icon: '🔮',
    color: 'from-indigo-700 to-purple-900'
  },
  {
    id: 'dice',
    name: 'Quantum Dice',
    description: 'Predict the rolls in a provably fair digital dice game.',
    category: 'Mini Games',
    icon: '🎲',
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'hilo',
    name: 'Quantum HiLo',
    description: 'Predict if the next spectral card is higher or lower. Chain wins for exponential rewards.',
    category: 'Mini Games',
    icon: '🎴',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'rps',
    name: 'Quantum RPS',
    description: 'Rock, Paper, or Scissors? A digital protocols clash where the sharpest logic wins.',
    category: 'Mini Games',
    icon: '✊',
    color: 'from-slate-500 to-zinc-700'
  },
  {
    id: 'coinflip',
    name: 'Binary Flip',
    description: 'A 50/50 chance to double your Gemini coins.',
    category: 'Mini Games',
    icon: '🪙',
    color: 'from-yellow-400 to-orange-500'
  }
];

export const ALL_TASKS: Task[] = [
  // DAILY TASKS
  { id: 'd1', title: 'Daily Grind', description: 'Wager 1,000 GC today', icon: '🔋', requirement: 1000, type: 'daily', category: 'wager', reward: 200, xpReward: 100, difficulty: 'Easy' },
  { id: 'd2', title: 'Winner Circle', description: 'Win 500 GC total today', icon: '✨', requirement: 500, type: 'daily', category: 'win', reward: 150, xpReward: 75, difficulty: 'Easy' },
  { id: 'd3', title: 'Active Link', description: 'Play 10 rounds of any game', icon: '🕹️', requirement: 10, type: 'daily', category: 'plays', reward: 100, xpReward: 50, difficulty: 'Easy' },

  // WEEKLY CHALLENGES
  { id: 'w1', title: 'Nebula Marathon', description: 'Wager 15,000 GC this week', icon: '🏃', requirement: 15000, type: 'weekly', category: 'wager', reward: 2500, xpReward: 1000, difficulty: 'Medium' },
  { id: 'w2', title: 'High Yield Week', description: 'Win 5,000 GC in total this week', icon: '📈', requirement: 5000, type: 'weekly', category: 'win', reward: 1500, xpReward: 750, difficulty: 'Medium' },
  { id: 'w3', title: 'Social Network', description: 'Add 2 new friends this week', icon: '🛰️', requirement: 2, type: 'weekly', category: 'friends', reward: 1000, xpReward: 500, difficulty: 'Easy' },

  // PERMANENT MILESTONES
  { id: 'm0', title: 'Initiate', description: 'Reach Level 2', icon: '🚀', requirement: 2, type: 'milestone', category: 'level', reward: 100, xpReward: 200, difficulty: 'Easy' },
  { id: 'm1', title: 'Social Spark', description: 'Add your first contact', icon: '🤝', requirement: 1, type: 'milestone', category: 'friends', reward: 50, xpReward: 50, difficulty: 'Easy' },
  { id: 'm2', title: 'Entry Better', description: 'Wager a total of 5,000 GC', icon: '🪙', requirement: 5000, type: 'milestone', category: 'wager', reward: 500, xpReward: 300, difficulty: 'Easy' },
  { id: 'm3', title: 'Steady Pilot', description: 'Reach Level 5', icon: '👨‍✈️', requirement: 5, type: 'milestone', category: 'level', reward: 1000, xpReward: 1000, difficulty: 'Medium' },
  { id: 'm4', title: 'Lucky Strike', description: 'Win 2,500 GC in a single bet', icon: '🔥', requirement: 2500, type: 'milestone', category: 'win', reward: 1250, xpReward: 800, difficulty: 'Medium' }
];

export const MOCK_FRIENDS: Friend[] = [
  { id: 'f1', username: 'Cipher_X', avatar: 'https://picsum.photos/seed/1/100', status: 'online', lastActive: 'now' },
  { id: 'f2', username: 'Neon_Pulse', avatar: 'https://picsum.photos/seed/2/100', status: 'offline', lastActive: '2h ago' },
  { id: 'f3', username: 'StarLord77', avatar: 'https://picsum.photos/seed/3/100', status: 'online', lastActive: 'now' }
];

export const XP_PER_LEVEL = 1000;
