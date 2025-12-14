import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TechStackInput from "./TechStackInput";
import { Plus } from "lucide-react";
import axios from "axios";

const isValidGitHubUrl = (url: string) => {
  try {
    const u = new URL(url);
    return (
      (u.hostname === "github.com" || u.hostname.endsWith(".github.com")) &&
      u.pathname.split("/").filter(Boolean).length >= 2
    );
  } catch {
    return false;
  }
};

const isValidHttpUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export default function CreatePost({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<"live" | "building">("building");
  const [tags, setTags] = useState<string[]>([]);
  const [liveUrl, setLiveUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const urlValid = useMemo(() => (link ? isValidGitHubUrl(link) : true), [link]);
  const liveUrlValid = useMemo(
    () => (status === "live" && liveUrl ? isValidHttpUrl(liveUrl) : true),
    [status, liveUrl]
  );
  const tagsValid = tags.length > 0;
  const liveUrlSatisfied = status === "live" ? !!liveUrl && liveUrlValid : true;
  const canSubmit = Boolean(link && urlValid && tagsValid && liveUrlSatisfied && !submitting);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidGitHubUrl(link)) {
      setError("Please provide a valid GitHub repository URL.");
      return;
    }

    if (!tagsValid) {
      setError("Add at least one tech stack tag before posting.");
      return;
    }

    if (status === "live") {
      if (!liveUrl) {
        setError("Live projects must include a Live Project URL.");
        return;
      }
      if (!isValidHttpUrl(liveUrl)) {
        setError("Please provide a valid live project URL (http or https).");
        return;
      }
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to create a post.");
      return;
    }

    const payload = { link, status, tags, liveUrl: status === "live" ? liveUrl : undefined };

    try {
      setSubmitting(true);
      const base = (import.meta.env.PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
      const endpoint = base ? `${base}/v1/posts` : "/v1/posts";
      await axios.post(endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
      setToast("Post created successfully!");
      toastTimer.current = window.setTimeout(() => setToast(null), 4000);

      setOpen(false);
      setLink("");
      setStatus("building");
      setTags([]);
      setLiveUrl("");
    } catch (err) {
      const message =
        (err as any)?.response?.data?.message ||
        (err as Error)?.message ||
        "Unable to create the post. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const buttonClass = compact
    ? "inline-flex items-center gap-2 rounded-xl border border-slate-700/60 ring-1 ring-cyan-500/30 shadow-[0_0_18px_rgba(6,182,212,0.25)] bg-[linear-gradient(in_oklab,to_right,#fdeff9_0%,#ec38bc_35%,#7303c0_75%,#03001e_100%)] px-5 py-2.5 text-sm font-semibold text-slate-100 hover:border-slate-600/60 hover:shadow-[0_0_26px_rgba(6,182,212,0.35)]"
    : "inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-[linear-gradient(in_oklab,to_right,#fdeff9_0%,#ec38bc_35%,#7303c0_75%,#03001e_100%)] px-4 py-2 text-sm font-semibold text-slate-100 shadow-sm hover:border-slate-600/60";

  return (
    <div className="relative">
      <div className="flex items-center justify-between ">
        <motion.button
          // whileTap={{ scale: 0.98 }}
          whileHover={{ y: -1 }}
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
          className={buttonClass}
        >
          <span className="" />
          <Plus/> Create Post
        </motion.button>
        {!compact && (
          <p className="text-sm text-slate-400">Share a GitHub project with status and tech stack.</p>
        )}
      </div>
      {toast && (
        <p className="mt-2 text-xs font-medium text-emerald-300">{toast}</p>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <motion.div
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="w-full max-w-lg rounded-2xl border border-slate-800/60 bg-slate-900 p-6 shadow-xl"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">Create a Post</h3>
                    <p className="text-sm text-slate-400">Paste a GitHub link, choose status, and add tags.</p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-slate-700/60 bg-slate-800/50 px-2 py-1 text-slate-300 hover:border-slate-600/60"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">GitHub Project Link</label>
                    <input
                      type="url"
                      placeholder="https://github.com/user/repo"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className={`w-full rounded-xl border bg-slate-950/60 px-3 py-2 text-slate-200 outline-none transition placeholder:text-slate-500 ${
                        urlValid ? "border-slate-700/60 focus:border-slate-600/60" : "border-rose-600/60 focus:border-rose-500/60"
                      }`}
                      required
                    />
                    {!urlValid && (
                      <p className="mt-1 text-xs text-rose-400">Please enter a valid GitHub repository URL.</p>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {status === "live" && (
                      <motion.div
                        key="live-url"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ type: "spring", stiffness: 260, damping: 26 }}
                      >
                        <label className="mb-1 block text-sm font-medium text-slate-300">Live Project URL<span className="ml-1 text-rose-400">*</span></label>
                        <input
                          type="url"
                          placeholder="https://your-live-app.com"
                          value={liveUrl}
                          onChange={(e) => setLiveUrl(e.target.value)}
                          className={`w-full rounded-xl border bg-slate-950/60 px-3 py-2 text-slate-200 outline-none transition placeholder:text-slate-500 ${
                            liveUrl ? (liveUrlValid ? "border-slate-700/60 focus:border-slate-600/60" : "border-rose-600/60 focus:border-rose-500/60") : "border-slate-700/60 focus:border-slate-600/60"
                          }`}
                          required={status === "live"}
                        />
                        {!liveUrl && (
                          <p className="mt-1 text-xs text-slate-400">Required when status is Live.</p>
                        )}
                        {liveUrl && !liveUrlValid && (
                          <p className="mt-1 text-xs text-rose-400">Please enter a valid URL (http or https).</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["building", "live"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={`rounded-xl border px-3 py-2 text-sm transition ${
                            status === s
                              ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                              : "border-slate-700/60 bg-slate-900/40 text-slate-300 hover:border-slate-600/60"
                          }`}
                        >
                          {s === "building" ? "Building" : "Live"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <TechStackInput
                    tags={tags}
                    onTagsChange={setTags}
                    maxTags={10}
                    placeholder="Type to search tech stack..."
                    label="Tech Stack Tags"
                  />
                  {!tagsValid && (
                    <p className="mt-1 text-xs text-slate-400">Add at least one tag (required).</p>
                  )}

                  {error && (
                    <p className="text-sm text-rose-400">{error}</p>
                  )}

                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-xl border border-slate-700/60 bg-slate-900/40 px-4 py-2 text-sm text-slate-200 hover:border-slate-600/60"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!canSubmit}
                      className="rounded-xl border border-slate-700/60 bg-[linear-gradient(in_oklab,to_right,#fdeff9_0%,#ec38bc_35%,#7303c0_75%,#03001e_100%)] px-4 py-2 text-sm font-semibold text-slate-100 opacity-100 hover:border-slate-600/60 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? "Posting..." : "Post"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
