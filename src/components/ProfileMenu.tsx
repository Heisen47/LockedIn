import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";

interface ProfileMenuProps {
  handle?: string;
  avatarUrl?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  handle: string;
}

export default function ProfileMenu({ handle: propHandle, avatarUrl: propAvatarUrl }: ProfileMenuProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await api.validate();
        if (response.valid && response.user) {
          setLoggedIn(true);
          setUser(response.user);
        } else {
          setLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth validation failed:', error);
        setLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, []);
  
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  if (loading) return null;
  if (!loggedIn || !user) return null;

  const handle = user.handle || propHandle || "user";
  const avatarUrl = propAvatarUrl || "";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/40 px-2 py-1 pr-3 text-sm text-slate-200 hover:border-slate-600/60"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="h-7 w-7 rounded-full bg-linear-to-br from-cyan-500/30 to-fuchsia-500/30" />
        )}
        <span className="hidden sm:inline text-slate-300">@{handle}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="absolute right-0 z-60 mt-2 w-44 overflow-hidden rounded-xl border border-slate-800/60 bg-slate-950/90 backdrop-blur-xl shadow-xl"
            role="menu"
          >
            <a
              href={`/profile/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800/40"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              My Profile
            </a>
            <a
              href="/settings"
              className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800/40"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Settings
            </a>
            <button
              className="block w-full px-4 py-2 text-left text-sm text-rose-300 hover:bg-rose-600/10"
              role="menuitem"
              onClick={async () => {
                try {
                  await api.logout();
                  setOpen(false);
                  setLoggedIn(false);
                  setUser(null);
                  location.href = '/';
                } catch (error) {
                  console.error('Logout failed:', error);
                }
              }}
            >
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
