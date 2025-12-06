import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Comment {
  id: string;
  author: string;
  text: string;
  votes: number;
  userVote: 1 | -1 | 0;
}

interface Props {
  initial?: Omit<Comment, "votes" | "userVote">[];
}

export default function CommentBox({ initial = [] }: Props) {
  const [comments, setComments] = useState<Comment[]>(
    initial.map((c) => ({ ...c, votes: 0, userVote: 0 }))
  );
  const [val, setVal] = useState("");
  const [showAll, setShowAll] = useState(false);

  function add() {
    const v = val.trim();
    if (!v) return;
    setComments((c) => [
      ...c,
      {
        id: Math.random().toString(36).slice(2),
        author: "You",
        text: v,
        votes: 0,
        userVote: 0,
      },
    ]);
    setVal("");
  }

  function vote(id: string, direction: 1 | -1) {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        if (c.userVote === direction) {
          return { ...c, userVote: 0, votes: c.votes - direction };
        }

        const delta = c.userVote === 0 ? direction : direction * 2;
        return { ...c, userVote: direction, votes: c.votes + delta };
      })
    );
  }

  const visibleComments = showAll ? comments : comments.slice(-2);
  const showLoadAll = !showAll && comments.length > visibleComments.length;
  const showVotes = showAll;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a comment..."
          className="flex-1 rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-slate-600/60"
        />
        <button
          onClick={add}
          className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-600/60"
        >
          Post
        </button>
      </div>
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {visibleComments.map((c) => (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`rounded-xl border border-slate-800/60 bg-slate-900/30 px-3 py-3 sm:px-4 sm:py-4 text-sm ${
                showVotes ? "flex gap-4" : ""
              }`}
            >
              {showVotes && (
                <div className="flex flex-col items-center gap-0.5 w-6 sm:w-8 flex-shrink-0">
                  <button
                    onClick={() => vote(c.id, 1)}
                    aria-label="Upvote"
                    className={`rounded-md p-0.5 transition-colors ${
                      c.userVote === 1
                        ? "bg-green-500/20 text-green-300"
                        : "text-slate-400 hover:bg-green-500/10 hover:text-green-300"
                    }`}
                  >
                    <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <span
                    className={`text-[10px] font-semibold tabular-nums sm:text-xs ${
                      c.votes > 0
                        ? "text-green-300"
                        : c.votes < 0
                        ? "text-rose-300"
                        : "text-slate-400"
                    }`}
                  >
                    {c.votes}
                  </span>
                  <button
                    onClick={() => vote(c.id, -1)}
                    aria-label="Downvote"
                    className={`rounded-md p-0.5 transition-colors ${
                      c.userVote === -1
                        ? "bg-rose-500/20 text-rose-300"
                        : "text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
                    }`}
                  >
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              )}
              <div className={`${showVotes ? "min-w-0 flex-1" : "min-w-0"} pt-0.5`}>
                <span className="font-medium text-slate-200">{c.author}</span>
                <span className="text-slate-500"> • </span>
                <span className="text-slate-300 break-words">{c.text}</span>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {showLoadAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="w-full rounded-lg border border-slate-700/60 bg-slate-900/30 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600/60"
        >
          Load all comments ({comments.length})
        </button>
      )}
    </div>
  );
}
