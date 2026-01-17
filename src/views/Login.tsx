// src/views/Login.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Signup from './Signup';

interface LoginProps {
  onLoginSuccess?: (session: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      onLoginSuccess?.(data.session);
    }
  };

  if (isSigningUp) {
    return (
      <div className="w-full max-w-sm">
        <Signup />
        <p className="text-center mt-4">
          Already have an account?{' '}
          <button onClick={() => setIsSigningUp(false)} className="text-cyan-400 hover:text-cyan-300">
            Log In
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3 drop-shadow-lg">🎰</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 font-orbitron">
          NEBULA CASINO
        </h1>
        <p className="text-sm text-slate-400 italic font-light">
          Enter the digital frontier of high-stakes gaming
        </p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-300">
            Email or Username
          </label>
          <input
            type="email"
            placeholder="player@nebula.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            required
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-300">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full p-3 mt-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold uppercase tracking-widest hover:from-cyan-400 hover:to-purple-400 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-cyan-500/50"
        >
          Log In
        </button>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3 bg-rose-600/20 border border-rose-600/40 rounded text-rose-300 text-sm">
            {errorMsg}
          </div>
        )}
      </form>

      {/* Signup Toggle */}
      <p className="text-center mt-6 text-slate-400">
        New to Nebula Casino?{' '}
        <button onClick={() => setIsSigningUp(true)} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
          Create an Account
        </button>
      </p>
    </div>
  );
};

export default Login;
