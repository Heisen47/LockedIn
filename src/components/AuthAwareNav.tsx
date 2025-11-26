import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import ProfileMenu from './ProfileMenu';

interface AuthAwareNavProps {
  defaultHandle?: string;
}

export default function AuthAwareNav({ defaultHandle = 'alexcodes' }: AuthAwareNavProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userHandle, setUserHandle] = useState(defaultHandle);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const result = await api.validate();
        setIsAuthenticated(result.valid);
        if (result.valid && result.user) {
          setUserHandle(result.user.handle);
        }
      } catch (error) {
        console.error('Auth validation failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-slate-800/60"></div>
    );
  }

  if (!isAuthenticated) {
    return (
      <a
        href="/auth"
        className="rounded-full border border-slate-700/60 bg-[linear-gradient(in_oklab,to_right,#fdeff9_0%,#ec38bc_35%,#7303c0_75%,#03001e_100%)] px-5 py-2 text-sm font-semibold text-slate-200 backdrop-blur-sm transition hover:border-slate-600/60 hover:opacity-90"
      >
        Get Started
      </a>
    );
  }

  return <ProfileMenu handle={userHandle} />;
}
