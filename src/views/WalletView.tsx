
import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import { getTransactionHistory } from '../lib/supabase';

interface WalletViewProps {
  user: User;
  onClaimBonus: () => void;
  onClaimSignInBonus?: () => void;
  isSignInBonusClaimed?: boolean;
}

const WalletView: React.FC<WalletViewProps> = ({ user, onClaimBonus, onClaimSignInBonus, isSignInBonusClaimed }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTransactionHistory();
  }, [user.id]);

  const loadTransactionHistory = async () => {
    setLoading(true);
    try {
      const history = await getTransactionHistory(user.id, 20);
      setTransactions(history);
    } catch (err) {
      console.error('Error loading transaction history:', err);
    }
    setLoading(false);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'win':
        return '🎰';
      case 'wager':
        return '🎲';
      case 'transfer':
        return '💸';
      default:
        return '💳';
    }
  };

  const getTransactionLabel = (type: string, senderId: string, receiverId: string) => {
    if (type === 'wager') return 'Game Wager';
    if (type === 'win') return 'Game Win';
    if (type === 'transfer') {
      if (senderId === user.id) return 'Sent to Friend';
      return 'Received from Friend';
    }
    return type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-rose-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10';
      case 'pending':
        return 'bg-yellow-500/10';
      case 'failed':
        return 'bg-rose-500/10';
      default:
        return 'bg-slate-500/10';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Main Balance Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
          <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-6">Central Vault</h3>
          <div className="mb-8">
            <span className="text-5xl font-orbitron font-bold text-white neon-text">{user.balance.toLocaleString()}</span>
            <span className="ml-2 text-cyan-400 font-bold">GC</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Total Won</span>
              <span className="text-emerald-400 font-bold">12,450 GC</span>
            </div>
            <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Total Wagered</span>
              <span className="text-slate-300 font-bold">28,900 GC</span>
            </div>
          </div>
        </div>

        {/* Sign-In Bonus Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center text-3xl mb-4 neon-glow">
            🚀
          </div>
          <h3 className="text-xl font-orbitron font-bold mb-2">Welcome Boost</h3>
          <p className="text-slate-400 text-sm mb-6">Claim your exclusive welcome bonus to jumpstart your cosmic journey.</p>
          
          <button 
            disabled={isSignInBonusClaimed}
            onClick={onClaimSignInBonus}
            className={`w-full py-4 rounded-xl font-bold transition-all ${
              isSignInBonusClaimed 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-500 text-white neon-glow transform hover:scale-105'
            }`}
          >
            {isSignInBonusClaimed ? 'Bonus Claimed ✓' : 'Claim 5000 GC'}
          </button>
          
          {!isSignInBonusClaimed && (
            <p className="mt-4 text-xs text-purple-400/80 font-medium">One-time bonus • Claim now!</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Daily Bonus Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center text-3xl mb-4 neon-glow">
            🎁
          </div>
          <h3 className="text-xl font-orbitron font-bold mb-2">Daily Fuel Injection</h3>
          <p className="text-slate-400 text-sm mb-6">Receive 500 Gemini Coins every 24 hours to keep your systems operational.</p>
          
          <button 
            disabled={user.isDailyBonusClaimed}
            onClick={onClaimBonus}
            className={`w-full py-4 rounded-xl font-bold transition-all ${
              user.isDailyBonusClaimed 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 neon-glow transform hover:scale-105'
            }`}
          >
            {user.isDailyBonusClaimed ? 'Refueling in Progress...' : 'Inject 500 GC'}
          </button>
          
          {user.isDailyBonusClaimed && (
            <p className="mt-4 text-xs text-yellow-500/60 font-medium">Available again in 22:14:05</p>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-orbitron font-bold">Transaction History</h3>
          <button
            onClick={loadTransactionHistory}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              <p>No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isIncoming = tx.receiver_id === user.id;
              const amount = isIncoming ? tx.amount : -tx.amount;
              
              return (
                <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      amount > 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                    }`}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{getTransactionLabel(tx.type, tx.sender_id, tx.receiver_id)}</p>
                      <p className="text-xs text-slate-500">{formatDate(tx.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {amount > 0 ? '+' : ''}{amount} GC
                    </p>
                    <p className={`text-[10px] font-bold uppercase ${getStatusColor(tx.status)}`}>{tx.status}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletView;
