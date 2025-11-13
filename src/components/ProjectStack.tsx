import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  // Optional GitHub/meta stats
  durationDays?: number; // duration from first commit to latest, in days
  stars?: number;
  forks?: number;
  createdAt?: string | number | Date; // when the post was made
}

interface Props {
  user: { name: string; handle: string; avatar?: string };
  projects: Project[];
  showFollow?: boolean; // whether to show the Follow button in header (defaults to true)
}

export default function ProjectStack({ user, projects, showFollow = true }: Props) {
  const [index, setIndex] = useState(0);
  const [following, setFollowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const count = projects.length;
  const current = count > 0 ? projects[index] : undefined;

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

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <div className="h-8 w-8 shrink-0 rounded-full bg-slate-800/60" />
        <div>
          <p className="text-sm font-semibold text-slate-200">{user.name}</p>
          <p className="text-xs text-slate-400">@{user.handle}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {count === 0 ? "0 / 0" : `${index + 1} / ${count}`}
          </span>
          {showFollow && (
            <>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setFollowing((f) => !f)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  following
                    ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                    : "border-slate-700/60 bg-slate-900/40 text-slate-300 hover:border-slate-600/60"
                }`}
                aria-pressed={following}
                aria-label={following ? "Unfollow" : "Follow"}
              >
                {following ? "Following" : "Follow"}
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

      {/* Stack visualization */}
      <div className="relative h-[420px]">
        {count === 0 ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-slate-800/60 bg-slate-900 text-slate-400">
            No projects available
          </div>
        ) : (
          [2, 1, 0].map((offset) => {
            const i = (index + offset) % count;
            const p = projects[i];
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
                  className={`relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border backdrop-blur-xl ${
                    isFront
                      ? "border-slate-800/60 bg-slate-900 shadow-xl"
                      : "border-slate-800/60 bg-slate-900/40"
                  } p-5`}
                >
                  {/* Timestamp (top-right, per project) */}
                  {p.createdAt && (
                    (() => {
                      const d = new Date(p.createdAt);
                      const iso = d.toISOString();
                      const short = d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
                      return (
                        <div className="absolute right-5 top-5">
                          <span className="inline-flex items-center rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-1 text-xs text-slate-300">
                            <time dateTime={iso}>{short}</time>
                          </span>
                        </div>
                      );
                    })()
                  )}
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      {p.status === "building" && (
                        <span className="rounded-full border border-amber-400/50 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300">
                          Building
                        </span>
                      )}
                      <TagList tags={p.tags} />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-slate-100">
                      {p.title}
                    </h3>
                    <p className="mb-3 text-sm leading-relaxed text-slate-300">
                      {p.description}
                    </p>
                    {(typeof p.durationDays === "number" || typeof p.stars === "number" || typeof p.forks === "number") && (
                      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
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
                    <VoteButtons initial={p.score ?? 0} />
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
        <CommentBox key={current?.id ?? "none"} initial={current?.comments ?? []} />
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