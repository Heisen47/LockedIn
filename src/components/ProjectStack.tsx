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
}

interface Props {
  user: { name: string; handle: string; avatar?: string };
  projects: Project[];
}

export default function ProjectStack({ user, projects }: Props) {
  const [index, setIndex] = useState(0);
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
        <span className="ml-auto text-xs text-slate-500">
          {count === 0 ? "0 / 0" : `${index + 1} / ${count}`}
        </span>
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
                    <p className="mb-4 text-sm leading-relaxed text-slate-300">
                      {p.description}
                    </p>
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