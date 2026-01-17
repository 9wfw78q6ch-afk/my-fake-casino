// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase, fetchUserProfile, updateUserBalance, logTransaction } from './lib/supabase';
import { INITIAL_GAMES, MOCK_FRIENDS, ALL_TASKS, XP_PER_LEVEL } from './constants';
import { getDailyFortune } from './geminiService';

// Types
import { User, View, Game, Friend, ChatMessage, Reaction } from './types.ts';

// Components / Views
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomeView from './views/HomeView';
import GamesView from './views/GamesView';
import WalletView from './views/WalletView';
import FriendsView from './views/FriendsView';
import LeaderboardView from './views/LeaderboardView';
import AchievementsView from './views/AchievementsView';
import ProfileView from './views/ProfileView';
import GameOverlay from './components/GameOverlay';
import ChatPanel from './components/ChatPanel';
import Login from './views/Login';

// Default user state
const DEFAULT_USER: User = {
  id: '',
  username: '',
  balance: 0,
  level: 1,
  xp: 0,
  avatar: '',
  emoji: '🛸',
  joinedAt: '',
  isDailyBonusClaimed: false,
  achievements: [],
  stats: {
    totalWins: 0,
    totalLosses: 0,
    biggestWin: 0,
    totalWagered: 0,
    gamePlayCounts: { 'slots': 0, 'dice': 0, 'mines': 0, 'coinflip': 0 }
  }
};

const App: React.FC = () => {
  // State
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [dealerMsg, setDealerMsg] = useState<string>("Welcome to the Nebula, pilot.");
  const [isFortuneLoading, setIsFortuneLoading] = useState(false);
  const [dailyFortune, setDailyFortune] = useState<string>("");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showSocialUI, setShowSocialUI] = useState(true);
  const [isSignInBonusClaimed, setIsSignInBonusClaimed] = useState(false);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  // Helper functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addChatMessage = useCallback((text: string, type: 'user' | 'system' = 'user', isBigWin: boolean = false, overrideUser?: Partial<User>) => {
    const newMessage: ChatMessage = {
      id: generateId(),
      userId: overrideUser?.id || user.id,
      username: overrideUser?.username || user.username,
      avatar: overrideUser?.avatar || user.avatar,
      text,
      type,
      isBigWin,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage].slice(-50));
  }, [user.id, user.username, user.avatar]);

  const handleSendReaction = useCallback((emoji: string) => {
    const newReaction: Reaction = {
      id: generateId(),
      emoji,
      x: Math.random() * 80 + 10,
      y: 0
    };
    setReactions(prev => [...prev, newReaction]);
    const timer = setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const updateBalance = useCallback((amount: number) => {
    setUser(prev => {
      const newBalance = Math.max(0, prev.balance + amount);
      // Update in database (fire and forget to avoid blocking UI)
      if (session?.user?.id) {
        updateUserBalance(session.user.id, newBalance).catch((err: any) => 
          console.error('Failed to sync balance to database:', err)
        );
      }
      return { ...prev, balance: newBalance };
    });
  }, [session?.user?.id]);

  const addXP = useCallback((amount: number) => {
    setUser(prev => ({ ...prev, xp: prev.xp + amount }));
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(DEFAULT_USER);
      setCurrentView('home');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  // Auth session management
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        setSession(session);

        if (!session?.user?.id) {
          // No valid session, stop here
          setIsSessionChecked(true);
          return;
        }

        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          console.log('Loaded profile from Supabase:', profile); // Debug log
          setUser({
            id: profile.user_id,
            username: profile.username || 'Player',
            balance: profile.balance || 0,
            level: profile.level || 1,
            xp: profile.xp || 0,
            achievements: profile.achievements || [],
            avatar: profile.avatar || 'https://picsum.photos/seed/nova/200',
            emoji: profile.emoji || '🛸',
            joinedAt: profile.created_at || new Date().toISOString(),
            isDailyBonusClaimed: false,
            stats: {
              totalWins: profile.stats?.totalWins || 0,
              totalLosses: profile.stats?.totalLosses || 0,
              biggestWin: profile.stats?.biggestWin || 0,
              totalWagered: profile.stats?.totalWagered || 0,
              gamePlayCounts: profile.stats?.gamePlayCounts || { 'slots': 0, 'dice': 0, 'mines': 0, 'coinflip': 0 }
            }
          });
        } else {
          console.warn('No profile found for user:', session.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsSessionChecked(true);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        initializeAuth();
      } else {
        setIsSessionChecked(true);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Daily fortune
  useEffect(() => {
    const fetchFortune = async () => {
      if (!user.username) return;
      try {
        setIsFortuneLoading(true);
        const fortune = await getDailyFortune(user.username);
        setDailyFortune(fortune);
      } catch (error) {
        console.error('Fortune fetch error:', error);
      } finally {
        setIsFortuneLoading(false);
      }
    };

    fetchFortune();
  }, [user.username]);

  // Render
  if (!isSessionChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌌</div>
          <p className="text-xl font-orbitron">Initializing Nova Gateway...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <Login onLoginSuccess={(sess: any) => setSession(sess)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-white overflow-hidden">
      <Header user={user} onProfileClick={() => setCurrentView('profile')} onSignOut={handleSignOut} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeView={currentView} 
          onViewChange={setCurrentView}
          showSocialUI={showSocialUI}
          onToggleSocialUI={() => setShowSocialUI(!showSocialUI)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {currentView === 'home' && (
              <HomeView 
                user={user} 
                fortune={dailyFortune} 
                isFortuneLoading={isFortuneLoading} 
                onGameSelect={setActiveGame} 
                dealerMsg={dealerMsg} 
              />
            )}
            {currentView === 'games' && <GamesView onGameSelect={setActiveGame} />}
            {currentView === 'wallet' && (
              <WalletView 
                user={user} 
                onClaimBonus={() => {
                  setUser(prev => ({ ...prev, isDailyBonusClaimed: true, balance: prev.balance + 500 }));
                  addChatMessage('Daily bonus claimed! +500 GC', 'system');
                }}
                onClaimSignInBonus={() => {
                  setUser(prev => ({ ...prev, balance: prev.balance + 5000 }));
                  setIsSignInBonusClaimed(true);
                  addChatMessage('Welcome bonus claimed! +5000 GC', 'system', true);
                }}
                isSignInBonusClaimed={isSignInBonusClaimed}
              />
            )}
            {currentView === 'friends' && (
              <FriendsView 
                user={user}
                onBalanceChange={(newBalance) => {
                  setUser(prev => ({ ...prev, balance: newBalance }));
                  updateUserBalance(user.id, newBalance);
                }}
              />
            )}
            {currentView === 'leaderboard' && <LeaderboardView />}
            {currentView === 'achievements' && (
              <AchievementsView 
                allTasks={ALL_TASKS} 
                user={user} 
                friendsCount={friends.length} 
                onClaim={(task) => {
                  setUser(prev => ({
                    ...prev,
                    achievements: [...prev.achievements, task.id],
                    balance: prev.balance + task.reward,
                    xp: prev.xp + task.xpReward
                  }));
                  addChatMessage(`Claimed "${task.title}" reward! +${task.reward} GC`, 'system');
                }} 
              />
            )}
            {currentView === 'profile' && (
              <ProfileView 
                user={user} 
                onUpdateEmoji={(emoji) => {
                  setUser(prev => ({ ...prev, emoji }));
                }} 
              />
            )}
          </div>
        </main>
      </div>
      {activeGame && (
        <GameOverlay 
          game={activeGame} 
          onClose={() => setActiveGame(null)}
          user={user}
          onResult={(isWin, bet, winAmount) => {
            if (isWin) {
              updateBalance(winAmount - bet);
              addXP(Math.floor(bet / 10));
              addChatMessage(`Won ${winAmount} GC on ${activeGame.name}!`, 'system', true);
              // Log wager transaction
              logTransaction(user.id, user.id, bet, 'wager', 'completed');
              // Log win transaction
              logTransaction(user.id, user.id, winAmount, 'win', 'completed');
            } else {
              updateBalance(-bet);
              addChatMessage(`Lost ${bet} GC on ${activeGame.name}.`, 'system');
              // Log wager transaction (loss)
              logTransaction(user.id, user.id, bet, 'wager', 'completed');
            }
          }}
        />
      )}
      {chatOpen && (
        <ChatPanel 
          messages={messages} 
          reactions={reactions} 
          onSend={addChatMessage} 
        />
      )}
    </div>
  );
};

export default App;
