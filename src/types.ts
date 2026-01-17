// src/types.ts

export type User = {
  id: string;
  username: string;
  balance: number;
  level: number;
  xp: number;
  avatar: string;
  emoji: string;
  joinedAt: string;
  isDailyBonusClaimed: boolean;
  achievements: string[];
  stats: {
    totalWins: number;
    totalLosses: number;
    biggestWin: number;
    totalWagered: number;
    gamePlayCounts: Record<string, number>;
  };
};

export type View = 
  | 'home'
  | 'games'
  | 'wallet'
  | 'friends'
  | 'leaderboard'
  | 'achievements'
  | 'profile';

export type Game = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
};

export type Friend = {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline';
  lastActive: string;
};

export type Friendship = {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  friend?: User;
  requester?: User;
};

export type ChatMessage = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  type: 'user' | 'system';
  isBigWin?: boolean;
  timestamp: string;
};

export type Reaction = {
  id: string;
  emoji: string;
  x: number;
  y: number;
};

export type TaskType = 'milestone' | 'challenge' | 'daily' | 'weekly';

export type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  type: TaskType;
  icon: string;
  requirement: number;
  reward: number;
  xpReward: number;
  difficulty: string;
};

export type Transaction = {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  type: 'transfer' | 'wager' | 'win';
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
};
