import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  searchUsers,
  sendFriendRequest,
  getIncomingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getAcceptedFriends,
  transferMoneyToFriend
} from '../lib/supabase';

interface FriendsViewProps {
  user: User;
  onBalanceChange?: (newBalance: number) => void;
}

const FriendsView: React.FC<FriendsViewProps> = ({ user, onBalanceChange }) => {
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [sendAmount, setSendAmount] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load friends and requests on mount
  useEffect(() => {
    loadFriendsAndRequests();
  }, [user.id]);

  const loadFriendsAndRequests = async () => {
    setLoading(true);
    try {
      // Get incoming requests
      const incoming = await getIncomingRequests(user.id);
      setIncomingRequests(incoming);

      // Get accepted friends
      const { asRequester, asReceiver } = await getAcceptedFriends(user.id);
      
      // Combine both directions
      const friendsList = [
        ...asRequester.map((f: any) => ({
          ...f,
          friend_data: f.profiles,
          direction: 'requester'
        })),
        ...asReceiver.map((f: any) => ({
          ...f,
          friend_data: f.profiles,
          direction: 'receiver'
        }))
      ];
      
      setFriends(friendsList);
    } catch (err) {
      console.error('Error loading friends:', err);
    }
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchUsers(query, user.id);
      setSearchResults(results || []);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    try {
      const result = await sendFriendRequest(user.id, targetUserId);
      if (result.success) {
        setMessage('Friend request sent!');
        setSearchQuery('');
        setSearchResults([]);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (err) {
      setMessage('Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      const success = await acceptFriendRequest(friendshipId);
      if (success) {
        setMessage('Friend request accepted!');
        await loadFriendsAndRequests();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('Failed to accept request');
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      const success = await rejectFriendRequest(friendshipId);
      if (success) {
        setMessage('Friend request rejected');
        await loadFriendsAndRequests();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('Failed to reject request');
    }
  };

  const handleTransfer = async () => {
    if (!selectedFriend) return;

    const targetUserId = selectedFriend.direction === 'requester' 
      ? selectedFriend.friend_data.user_id 
      : selectedFriend.friend_data.user_id;

    try {
      const result = await transferMoneyToFriend(user.id, targetUserId, sendAmount);
      if (result.success) {
        setMessage(`✅ Transferred ${sendAmount} GC to ${selectedFriend.friend_data.username}!`);
        onBalanceChange?.(user.balance - sendAmount);
        setSendAmount(100);
        setSelectedFriend(null);
        await loadFriendsAndRequests();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (err) {
      setMessage('Transfer failed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 font-bold uppercase text-xs tracking-widest transition-all ${
              activeTab === 'friends'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 font-bold uppercase text-xs tracking-widest transition-all ${
              activeTab === 'requests'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Requests ({incomingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 font-bold uppercase text-xs tracking-widest transition-all ${
              activeTab === 'search'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Add Friends
          </button>
        </div>

        {/* Friends List */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-orbitron font-bold">Network Contacts</h2>
            {friends.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <span className="text-4xl block mb-4">🛸</span>
                <p>No friends yet. Search and add some!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {friends.map(friendship => (
                  <div
                    key={friendship.id}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                      selectedFriend?.id === friendship.id
                        ? 'bg-slate-800 border-cyan-500 shadow-lg'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                    onClick={() => setSelectedFriend(friendship)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={friendship.friend_data?.avatar || 'https://picsum.photos/seed/nova/200'}
                          alt={friendship.friend_data?.username}
                          className="w-12 h-12 rounded-full border border-slate-700"
                        />
                        <span className="absolute -bottom-1 -right-1 text-xs bg-slate-900 rounded-full w-5 h-5 flex items-center justify-center border border-slate-700">
                          {friendship.friend_data?.emoji || '🛸'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold">{friendship.friend_data?.username || 'Unknown'}</h4>
                        <p className="text-xs text-slate-500">Friends since {new Date(friendship.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Incoming Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-orbitron font-bold">Pending Requests</h2>
            {incomingRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <span className="text-4xl block mb-4">📬</span>
                <p>No pending friend requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map(request => (
                  <div key={request.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={request.profiles?.avatar || 'https://picsum.photos/seed/nova/200'}
                        alt={request.profiles?.username}
                        className="w-10 h-10 rounded-full border border-slate-700"
                      />
                      <div>
                        <p className="font-bold">{request.profiles?.username}</p>
                        <p className="text-xs text-slate-500">Sent {new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold transition-all"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Users */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-orbitron font-bold">Find Players</h2>
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
            />
            {searchResults.length === 0 && searchQuery.length > 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map(player => (
                  <div
                    key={player.user_id}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={player.avatar || 'https://picsum.photos/seed/nova/200'}
                        alt={player.username}
                        className="w-10 h-10 rounded-full border border-slate-700"
                      />
                      <div>
                        <p className="font-bold">{player.username}</p>
                        <p className="text-xs text-slate-500">Level {player.level}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(player.user_id)}
                      className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-bold transition-all"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transfer Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-fit sticky top-24">
        <h3 className="text-lg font-orbitron font-bold mb-6">Quantum Transfer</h3>
        {selectedFriend ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <img
                src={selectedFriend.friend_data?.avatar || 'https://picsum.photos/seed/nova/200'}
                alt=""
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-bold">To: {selectedFriend.friend_data?.username}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount (GC)</label>
              <input
                type="number"
                value={sendAmount}
                onChange={e => setSendAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none text-white font-orbitron"
              />
            </div>

            <button
              onClick={handleTransfer}
              disabled={user.balance < sendAmount || sendAmount <= 0}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-xl transition-all neon-glow"
            >
              {user.balance < sendAmount ? 'Insufficient Funds' : 'Confirm Transfer'}
            </button>
            <p className="text-center text-[10px] text-slate-500">A small processing fee of 0.5 GC will be applied.</p>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <span className="text-4xl block mb-4">🛸</span>
            <p className="text-sm">Select a friend to initiate a transfer.</p>
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-300 text-xs text-center">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsView;
