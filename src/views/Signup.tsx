// src/views/Signup.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setErrorMsg(error.message);
      setSuccessMsg('');
    } else {
      setSuccessMsg('Signup successful! Please check your email to verify your account.');
      setEmail('');
      setPassword('');
      setErrorMsg('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSignup} className="flex flex-col space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="p-2 rounded bg-slate-800 border border-slate-700 text-white"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="p-2 rounded bg-slate-800 border border-slate-700 text-white"
          required
        />
        <button type="submit" className="p-2 bg-cyan-500 rounded hover:bg-cyan-400">
          Sign Up
        </button>
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        {successMsg && <p className="text-green-500">{successMsg}</p>}
      </form>
    </div>
  );
};

export default Signup;
