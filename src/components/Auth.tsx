import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const genders = [
  'Male', 'Female', 'Other', 'Walmart Bag', 'Attack Helicopter', 
  'Two and a Half Men', 'A Toaster', '404 Not Found', 'Jedi', 'Sith', 
  'Three Raccoons in a Trenchcoat', 'Garlic Bread', 'Error 500', 
  'Default Human', 'Loading...', 'The Color Blue', 'Redacted'
];

export function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState('Default Human');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        let finalEmail = identifier;
        
        // If not email, lookup username to get email
        if (!identifier.includes('@')) {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', identifier)
            .single();
            
          if (profileError || !data?.email) {
            throw new Error('Username not found');
          }
          finalEmail = data.email;
        }

        const { error: authError } = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password,
        });
        
        if (authError) throw authError;
      } else {
        // Checking if username exists first to provide better error
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single();

        if (existingUser) {
          throw new Error('Username already taken');
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: identifier,
          password,
          options: {
            data: {
              username,
              age,
              gender
            }
          }
        });
        
        if (signUpError) throw signUpError;
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
      <div className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-800 p-8 shadow-2xl relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-emerald-500 drop-shadow-sm">Emerald Chat</h1>
        </div>
        
        <h2 className="mb-6 mt-2 text-xl font-semibold tracking-tight text-white text-center">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        
        {error && (
          <div className="mb-4 rounded-lg bg-red-950/50 p-3 text-sm text-red-400 border border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">
              {isLogin ? 'Email or Username' : 'Email'}
            </label>
            <input
              type={isLogin ? 'text' : 'email'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              placeholder={isLogin ? 'Enter email or username...' : 'you@example.com'}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-400">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  placeholder="Choose a username..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-400">Age</label>
                  <input
                    type="number"
                    min="7"
                    max="1000"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-400">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-white focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  >
                    {genders.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-500 hover:text-emerald-400 hover:underline focus:outline-none"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
