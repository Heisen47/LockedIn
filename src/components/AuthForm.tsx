import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import TechStackInput from './TechStackInput';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  
  const handleTechStackChange = (newTags: string[]) => {
    console.log('🔧 Tech stack callback received:', newTags);
    console.log('🔧 Array length:', newTags.length);
    console.log('🔧 Individual items:', newTags.map((tag, i) => `[${i}]: "${tag}"`));
    setTechStack(newTags);
  };
  
  // Log tech stack changes
  useEffect(() => {
    console.log('✅ Tech stack state updated to:', techStack);
    console.log('✅ Is array?', Array.isArray(techStack));
    console.log('✅ Length:', techStack.length);
  }, [techStack]);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.login({
          email: formData.email,
          password: formData.password,
        });
        
        console.log('Login successful:', response.user);
        
      } else {
        console.log('📤 Submitting registration...');
        console.log('📤 Tech stack before submit:', techStack);
        console.log('📤 Tech stack is array?', Array.isArray(techStack));
        console.log('📤 Tech stack length:', techStack.length);
        console.log('📤 Tech stack items:', techStack);
        
        if (!techStack || techStack.length === 0) {
          setError('Please add at least one technology to your tech stack');
          setLoading(false);
          return;
        }
        
        const registerData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          techStack: techStack,
        };
        
        console.log('📤 Full registration data:', registerData);
        console.log('📤 Registration data.techStack:', registerData.techStack);
        
        const response = await api.register(registerData);
        
        console.log('✅ Registration successful:', response.user);
        
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800/60 bg-slate-900 p-8 shadow-xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-100">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {isLogin ? 'Sign in to your account' : 'Join the community'}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-700/60 bg-slate-950/60 px-3 py-2 text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-slate-600/60"
                placeholder="johndoe"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Bio
              </label>
              <input
                type="text"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700/60 bg-slate-950/60 px-3 py-2 text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-slate-600/60"
                placeholder="Tell us about yourself (optional)"
              />
            </div>
            <div className="relative">
              <TechStackInput
                tags={techStack}
                onTagsChange={handleTechStackChange}
                maxTags={5}
              />
            </div>
          </>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-700/60 bg-slate-950/60 px-3 py-2 text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-slate-600/60"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-700/60 bg-slate-950/60 px-3 py-2 text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-slate-600/60"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl border border-slate-700/60 bg-[linear-gradient(in_oklab,to_right,#fdeff9_0%,#ec38bc_35%,#7303c0_75%,#03001e_100%)] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-600/60 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span className="font-semibold text-cyan-400">
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </button>
      </div>
    </div>
  );
}
