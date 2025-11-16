import React, { useEffect, useMemo, useState } from "react";

type EditableBioProps = {
  handle: string;
  initialBio: string;
  className?: string;
  maxLength?: number;
};

/**
 * EditableBio
 * - Displays a bio with a pencil button.
 * - Clicking the pencil switches to edit mode with textarea and Save/Cancel.
 * - Persists to localStorage under key `profile:{handle}:bio` (demo-only).
 */
export default function EditableBio({
  handle,
  initialBio,
  className,
  maxLength = 240,
}: EditableBioProps) {
  const storageKey = useMemo(() => `profile:${handle}:bio`, [handle]);

  // Load initial bio from localStorage or use initialBio
  const [bio, setBio] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return (saved && saved.trim().length > 0) ? saved : initialBio;
    } catch {
      return initialBio;
    }
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(bio);
  const [saving, setSaving] = useState(false);

  // Update when handle or initialBio changes (e.g., viewing different profile)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const newBio = (saved && saved.trim().length > 0) ? saved : initialBio;
      setBio(newBio);
      setDraft(newBio);
      setEditing(false);
    } catch {
      setBio(initialBio);
      setDraft(initialBio);
      setEditing(false);
    }
  }, [initialBio, handle, storageKey]);

  const remaining = maxLength - draft.length;
  const tooLong = remaining < 0;
  const canSave = !saving && !tooLong && draft.trim().length > 0 && draft !== bio;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      // Demo persistence only
      localStorage.setItem(storageKey, draft.trim());
      setBio(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setDraft(bio);
    setEditing(false);
  };

  return (
    <div className={className}>
      {!editing ? (
        <div className="group inline-flex items-start gap-2">
          <p className="max-w-2xl text-sm text-slate-300">{bio}</p>
          <button
            type="button"
            aria-label="Edit bio"
            title="Edit bio"
            onClick={() => setEditing(true)}
            className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-800/60 bg-slate-900/40 text-slate-300/80 hover:text-slate-100 hover:border-slate-700/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M15.586 3.586a2 2 0 0 1 0 2.828l-8.5 8.5a2 2 0 0 1-.878.505l-3.12.78a.75.75 0 0 1-.91-.91l.78-3.12a2 2 0 0 1 .505-.878l8.5-8.5a2 2 0 0 1 2.828 0Z" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="max-w-2xl">
          <label className="block text-xs font-medium text-slate-400">Bio</label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            maxLength={Math.max(maxLength * 2, maxLength)}
            className="mt-1 w-full resize-y rounded-lg border border-slate-700/60 bg-slate-900/50 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-600/60 focus:outline-none"
            placeholder="Tell people what you’re building, learning, or excited about…"
            autoFocus
          />
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs ${tooLong ? "text-rose-400" : "text-slate-400"}`}>
              {remaining} characters left
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-600/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={!canSave}
                className="rounded-lg border border-slate-700/60 bg-[linear-gradient(in_oklab,to_right,#00c6ff_0%,#0072ff_100%)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
