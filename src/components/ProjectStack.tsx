import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import VoteButtons from "./VoteButtons";
import TagList from "./TagList";
import CommentBox from "./CommentBox";

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: "live" | "building";
  score?: number;
  comments?: { id: string; author: string; text: string }[];
  durationDays?: number; 
  stars?: number;
  forks?: number;
  createdAt?: string | number | Date; 
}

interface Props {
  user: { name: string; handle: string; avatar?: string };
  projects: Project[];
  showFollow?: boolean; 
  initiallyFollowing?: boolean;
}

export default function ProjectStack({ user, projects, showFollow = true, initiallyFollowing = false }: Props) {
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));
  }, [projects]);
  const [index, setIndex] = useState(0);
  const [following, setFollowing] = useState(initiallyFollowing);
  const [isSelf, setIsSelf] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const [awarded, setAwarded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const count = sortedProjects.length;
  const current = count > 0 ? sortedProjects[index] : undefined;

  const next = () => {
    if (count === 0) return;
    setIndex((i) => (i + 1) % count);
  };
  const prev = () => {
    if (count === 0) return;
    setIndex((i) => (i - 1 + count) % count);
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setReportOpen(false);
        setBlockOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setFollowing(initiallyFollowing);
  }, [initiallyFollowing]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsSelf(false);
      return;
    }
    const loggedInHandle = sessionStorage.getItem("username")?.toLowerCase();
    setIsSelf(Boolean(loggedInHandle && user.handle?.toLowerCase() === loggedInHandle));
  }, [user.handle]);

  const handleFollow = async () => {
    if (following || followLoading || isSelf) return;
    setFollowError(null);

    const token = typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null;
    if (!token) {
      setFollowError("Log in to follow others.");
      return;
    }

    const username = user.handle;
    if (!username) {
      setFollowError("Unable to find user handle.");
      return;
    }

    const base = (import.meta.env.PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
    const endpoint = base ? `${base}/v1/users/${encodeURIComponent(username)}/follow` : `/v1/users/${encodeURIComponent(username)}/follow`;

    try {
      setFollowLoading(true);
      await axios.post(
        endpoint,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFollowing(true);
    } catch (error) {
      const message =
        (error as any)?.response?.data?.error ||
        (error as Error)?.message ||
        "Unable to follow user.";
      setFollowError(message);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <div className="h-8 w-8 shrink-0 rounded-full bg-slate-800/60" />
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-200">{user.name}</p>
            <p className="text-xs text-slate-400">@{user.handle}</p>
          </div>
          {showFollow && !following && !isSelf && (
            <motion.button
              type="button"
              whileTap={{ scale: following || followLoading ? 1 : 0.98 }}
              onClick={handleFollow}
              disabled={following || followLoading}
              className={`ml-2 rounded-full border px-4 py-1.5 text-sm transition ${
                following
                  ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                  : "border-slate-700/60 bg-slate-900/40 text-slate-300 hover:border-slate-600/60"
              } ${followLoading ? "opacity-60" : ""}`}
              aria-pressed={following}
              aria-label={following ? "Following" : "Follow"}
            >
              {followLoading ? "Following..." : following ? "Following" : "Follow"}
            </motion.button>
          )}
          {showFollow && following && !isSelf && (
            <span className="ml-2 rounded-full border border-cyan-500/60 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-300">
              Following
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          {showFollow && (
            <>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setAwarded((a) => !a)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                  awarded
                    ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                    : "border-slate-700/60 bg-slate-900/40 text-slate-300 hover:border-slate-600/60"
                }`}
                aria-pressed={awarded}
                aria-label={awarded ? "Remove award" : "Give award"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clipRule="evenodd" />
                </svg>
                {awarded ? "Awarded" : "Award"}
              </motion.button>
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  aria-label="More actions"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/40 text-slate-300 hover:border-slate-600/60"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <circle cx="4" cy="10" r="1.5" />
                    <circle cx="10" cy="10" r="1.5" />
                    <circle cx="16" cy="10" r="1.5" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/95 p-1 shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setReportOpen(true);
                        setReportSubmitted(false);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/60"
                    >
                      Report
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setBlockOpen(true);
                      }}
                      className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-500/10"
                    >
                      Block
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {followError && (
        <p className="-mt-2 mb-3 text-xs text-rose-400" role="status">
          {followError}
        </p>
      )}

      {/* Stack visualization */}
      <div className="relative h-[420px]">
        {count === 0 ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-slate-800/60 bg-slate-900 text-slate-400">
            No projects available
          </div>
        ) : (
          [2, 1, 0].map((offset) => {
            const i = (index + offset) % count;
            const p = sortedProjects[i];
            const depth = 2 - offset; // 0 back ... 2 front
            const isFront = offset === 0;

            return (
              <motion.div
                key={p.id}
                className="absolute inset-0"
                style={{
                  zIndex: 10 + depth,
                  pointerEvents: isFront ? "auto" : "none",
                }}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{
                  opacity: isFront ? 1 : 0.65,
                  y: isFront ? 0 : 10,
                  scale: isFront ? 1 : 0.98 - depth * 0.01,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                aria-hidden={!isFront}
              >
                <motion.div
                  whileDrag={{ rotate: 1 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 100) prev();
                    else if (info.offset.x < -100) next();
                  }}
                  className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border backdrop-blur-xl ${
                    isFront
                      ? "border-slate-800/60 bg-slate-900 shadow-xl"
                      : "border-slate-800/60 bg-slate-900/40"
                  } p-5`}
                >
                  {/* Slide count and timestamp (top-right, inside card) */}
                  <div className="absolute right-5 top-5 flex flex-col items-end gap-2">
                    <span className="inline-flex items-center rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-400">
                      {index + 1} / {count}
                    </span>
                    {p.createdAt && (
                      (() => {
                        const d = new Date(p.createdAt);
                        const iso = d.toISOString();
                        const short = d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
                        return (
                          <span className="inline-flex items-center rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-1 text-xs text-slate-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <time dateTime={iso}>{short}</time>
                          </span>
                        );
                      })()
                    )}
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-slate-100">
                      {p.title}
                    </h3>
                    <div className="mb-2 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {p.status === "building" && (
                        <span className="rounded-full border border-amber-400/50 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300">
                          Building
                        </span>
                      )}
                      <TagList tags={p.tags} />
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-slate-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {p.description}
                    </p>
                    {(typeof p.durationDays === "number" || typeof p.stars === "number" || typeof p.forks === "number") && (
                      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {typeof p.durationDays === "number" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/40 px-2 py-1">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-slate-500"><path d="M12 8v5l3 3"/><circle cx="12" cy="12" r="9"/></svg>
                            {p.durationDays} days
                          </span>
                        )}
                        {typeof p.stars === "number" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/40 px-2 py-1">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-yellow-400" fill="currentColor"><path d="M12 17.3 6.2 20.6l1.1-6.5-4.7-4.6 6.6-1 3-6 3 6 6.6 1-4.7 4.6 1.1 6.5z"/></svg>
                            {p.stars}
                          </span>
                        )}
                        {typeof p.forks === "number" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/40 px-2 py-1">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-slate-500"><path d="M7 4v4a4 4 0 0 0 4 4h2a4 4 0 0 1 4 4v4"/><circle cx="7" cy="4" r="2"/><circle cx="17" cy="20" r="2"/><circle cx="17" cy="8" r="2"/></svg>
                            {p.forks}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <VoteButtons initial={p.score ?? 0} postId={p.id} />
                    <div className="flex gap-2">
                      <button
                        onClick={prev}
                        className="rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:border-slate-600/60"
                      >
                        Prev
                      </button>
                      <button
                        onClick={next}
                        className="rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:border-slate-600/60"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Comments */}
      <div className="mt-4">
        <CommentBox
          key={current?.id ?? "none"}
          initial={current?.comments ?? []}
          title={current?.title ?? "Discussion"}
        />
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReportOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800/60 bg-slate-900/95 p-5 shadow-2xl">
            {!reportSubmitted ? (
              <>
                <h3 className="mb-2 text-lg font-semibold text-slate-100">Report project</h3>
                <p className="mb-4 text-sm text-slate-400">Tell us briefly what’s wrong. This is a demo—no data leaves your browser.</p>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-lg border border-slate-700/60 bg-slate-900/60 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-600/60 focus:outline-none"
                  placeholder="Spam, abusive content, or other issues…"
                />
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportOpen(false)}
                    className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-600/60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReportSubmitted(true);
                      setReportText("");
                    }}
                    className="rounded-lg border border-slate-700/60 bg-[linear-gradient(in_oklab,to_right,#00c6ff_0%,#0072ff_100%)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                    disabled={reportText.trim().length === 0}
                  >
                    Submit
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="mb-2 text-lg font-semibold text-slate-100">Report received</h3>
                <p className="mb-4 text-sm text-slate-400">Thanks for the report. We’ll review this project shortly. (Demo message)</p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setReportOpen(false)}
                    className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-600/60"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Block Modal */}
      {blockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBlockOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800/60 bg-slate-900/95 p-5 shadow-2xl">
            <h3 className="mb-2 text-lg font-semibold text-slate-100">User blocked</h3>
            <p className="mb-4 text-sm text-slate-400">
              You won’t see @{user.handle}’s future posts again. This is a demo action and affects only your current session.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBlockOpen(false)}
                className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-600/60"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function toTimestamp(value: Project["createdAt"]): number {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? 0 : time;
  }
  if (typeof value === "number") {
    return Number.isNaN(value) ? 0 : value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}