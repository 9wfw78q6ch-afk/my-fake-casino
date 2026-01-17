// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string;
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    // Ensure balance exists and is a number
    if (data) {
      return {
        ...data,
        balance: typeof data.balance === 'number' ? data.balance : 0,
        level: typeof data.level === 'number' ? data.level : 1,
        xp: typeof data.xp === 'number' ? data.xp : 0
      };
    }
    return null;
  } catch (err) {
    console.error("Unexpected error fetching profile:", err);
    return null;
  }
};

// Update user balance in database
export const updateUserBalance = async (userId: string, balance: number) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ balance })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating balance:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Unexpected error updating balance:", err);
    return false;
  }
};

// Send friend request
export const sendFriendRequest = async (userId: string, targetUserId: string) => {
  try {
    const { data, error } = await supabase
      .from("friendships")
      .insert([
        {
          user_id: userId,
          friend_id: targetUserId,
          status: "pending"
        }
      ]);

    if (error) {
      console.error("Error sending friend request:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error sending friend request:", err);
    return { success: false, error: String(err) };
  }
};

// Get incoming friend requests
export const getIncomingRequests = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("friendships")
      .select("*, profiles!user_id(user_id, username, avatar, emoji)")
      .eq("friend_id", userId)
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching incoming requests:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Unexpected error fetching incoming requests:", err);
    return [];
  }
};

// Accept friend request
export const acceptFriendRequest = async (friendshipId: string) => {
  try {
    const { data, error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);

    if (error) {
      console.error("Error accepting friend request:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Unexpected error accepting friend request:", err);
    return false;
  }
};

// Reject/Delete friend request
export const rejectFriendRequest = async (friendshipId: string) => {
  try {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);

    if (error) {
      console.error("Error rejecting friend request:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Unexpected error rejecting friend request:", err);
    return false;
  }
};

// Get accepted friends (both directions)
export const getAcceptedFriends = async (userId: string) => {
  try {
    // Get friends where current user is the requester
    const { data: asRequester, error: error1 } = await supabase
      .from("friendships")
      .select("*, profiles!friend_id(user_id, username, avatar, emoji, balance)")
      .eq("user_id", userId)
      .eq("status", "accepted");

    // Get friends where current user is the friend
    const { data: asReceiver, error: error2 } = await supabase
      .from("friendships")
      .select("*, profiles!user_id(user_id, username, avatar, emoji, balance)")
      .eq("friend_id", userId)
      .eq("status", "accepted");

    if (error1) console.error("Error fetching outgoing friends:", error1);
    if (error2) console.error("Error fetching incoming friends:", error2);

    return { asRequester: asRequester || [], asReceiver: asReceiver || [] };
  } catch (err) {
    console.error("Unexpected error fetching accepted friends:", err);
    return { asRequester: [], asReceiver: [] };
  }
};

// Search for users to add as friend
export const searchUsers = async (query: string, currentUserId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${query}%`)
      .neq("user_id", currentUserId)
      .limit(10);

    if (error) {
      console.error("Error searching users:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Unexpected error searching users:", err);
    return [];
  }
};

// Transfer money between friends
export const transferMoneyToFriend = async (
  senderId: string,
  receiverId: string,
  amount: number
) => {
  try {
    // Check if they are accepted friends
    const { data: friendship, error: friendshipError } = await supabase
      .from("friendships")
      .select("*")
      .eq("status", "accepted")
      .or(
        `and(user_id.eq.${senderId},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${senderId})`
      )
      .single();

    if (friendshipError || !friendship) {
      console.error("Not friends or friendship not found");
      return { success: false, error: "You can only transfer to accepted friends" };
    }

    // Check sender balance
    const { data: senderProfile, error: senderError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("user_id", senderId)
      .single();

    if (senderError || !senderProfile) {
      return { success: false, error: "Could not verify sender balance" };
    }

    if ((senderProfile.balance || 0) < amount) {
      return { success: false, error: "Insufficient funds" };
    }

    // Transfer money (deduct from sender, add to receiver)
    const { error: deductError } = await supabase
      .from("profiles")
      .update({ balance: (senderProfile.balance || 0) - amount })
      .eq("user_id", senderId);

    if (deductError) {
      console.error("Error deducting from sender:", deductError);
      return { success: false, error: "Transfer failed" };
    }

    const { data: receiverProfile, error: receiverError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("user_id", receiverId)
      .single();

    if (receiverError || !receiverProfile) {
      return { success: false, error: "Could not verify receiver profile" };
    }

    const { error: addError } = await supabase
      .from("profiles")
      .update({ balance: (receiverProfile.balance || 0) + amount })
      .eq("user_id", receiverId);

    if (addError) {
      console.error("Error adding to receiver:", addError);
      return { success: false, error: "Transfer failed" };
    }

    // Log the transaction
    await logTransaction(senderId, receiverId, amount, 'transfer', 'completed');

    return { success: true, message: "Transfer successful" };
  } catch (err) {
    console.error("Unexpected error during transfer:", err);
    return { success: false, error: String(err) };
  }
};

// Log a transaction
export const logTransaction = async (
  senderId: string,
  receiverId: string,
  amount: number,
  type: 'transfer' | 'wager' | 'win' = 'transfer',
  status: 'completed' | 'pending' | 'failed' = 'completed'
) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          sender_id: senderId,
          receiver_id: receiverId,
          amount,
          type,
          status
        }
      ]);

    if (error) {
      console.error("Error logging transaction:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error logging transaction:", err);
    return { success: false, error: String(err) };
  }
};

// Get transaction history for a user
export const getTransactionHistory = async (userId: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching transaction history:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Unexpected error fetching transaction history:", err);
    return [];
  }
};

// Get transactions by type for a user
export const getTransactionsByType = async (
  userId: string,
  type: 'transfer' | 'wager' | 'win',
  limit: number = 50
) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq("type", type)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Unexpected error fetching transactions:", err);
    return [];
  }
};
