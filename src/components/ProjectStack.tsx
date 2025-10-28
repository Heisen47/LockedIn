import { useState } from "react";
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
}

interface Props {
  user: { name: string; handle: string; avatar?: string };
  projects: Project[];
  showFollow?: boolean; // whether to show the Follow button in header (defaults to true)
}

export default function ProjectStack({ user, projects, showFollow = true }: Props) {
  const [index, setIndex] = useState(0);
  const [following, setFollowing] = useState(false);
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
                  className={`flex h-full flex-col justify-between overflow-hidden rounded-3xl border backdrop-blur-xl ${
                    isFront
                      ? "border-slate-800/60 bg-slate-900 shadow-xl"
                      : "border-slate-800/60 bg-slate-900/40"
                  } p-5`}
                >
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
        <CommentBox initial={current?.comments ?? []} />
      </div>
    </div>
  );
}