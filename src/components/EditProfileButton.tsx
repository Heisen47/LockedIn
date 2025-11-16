import React, { useEffect, useMemo, useState } from "react";

type Props = {
  handle: string;
  initialEmail: string;
  initialWebsite: string;
  initialBio: string;
  className?: string;
};

export default function EditProfileButton({
  handle,
  initialEmail,
  initialWebsite,
  initialBio,
  className,
}: Props) {
  const key = useMemo(() => (field: string) => `profile:${handle}:${field}`, [handle]);
  const [open, setOpen] = useState(false);

  const [email, setEmail] = useState(initialEmail);
  const [website, setWebsite] = useState(initialWebsite);
  const [bio, setBio] = useState(initialBio);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(key("email"));
      const savedWebsite = localStorage.getItem(key("website"));
      const savedBio = localStorage.getItem(key("bio"));
      if (savedEmail) setEmail(savedEmail);
      if (savedWebsite) setWebsite(savedWebsite);
      if (savedBio) setBio(savedBio);
    } catch {
      // ignore
    }
  }, [key]);

  useEffect(() => {
    // Reset values when handle changes
    setEmail(initialEmail);
    setWebsite(initialWebsite);
    setBio(initialBio);
  }, [handle, initialEmail, initialWebsite, initialBio]);

  const onSave = () => {
    try {
      localStorage.setItem(key("email"), email.trim());
      localStorage.setItem(key("website"), website.trim());
      localStorage.setItem(key("bio"), bio.trim());
    } catch {
      // ignore
    }

    // Notify page to update displayed values without refresh
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("profile:updated", {
          detail: { handle, email: email.trim(), website: website.trim(), bio: bio.trim() },
        })
      );
    }
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:border-slate-600/60"
        }
      >
        Edit Profile
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-800/60 bg-slate-900/90 p-5 shadow-2xl">
            <h3 className="mb-3 text-lg font-semibold text-slate-100">Edit Profile</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/60 p-2.5 text-sm text-slate-100 focus:border-slate-600/60 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/60 p-2.5 text-sm text-slate-100 focus:border-slate-600/60 focus:outline-none"
                  placeholder="https://your-site.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={480}
                  className="mt-1 w-full resize-y rounded-lg border border-slate-700/60 bg-slate-900/60 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-600/60 focus:outline-none"
                  placeholder="Tell people what you’re building, learning, or excited about…"
                />
                <div className="mt-1 text-right text-xs text-slate-400">{bio.length}/480</div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-600/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                className="rounded-lg border border-slate-700/60 bg-[linear-gradient(in_oklab,to_right,#00c6ff_0%,#0072ff_100%)] px-3 py-1.5 text-sm font-medium text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
