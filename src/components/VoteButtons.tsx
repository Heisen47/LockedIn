import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  initial?: number;
}

export default function VoteButtons({ initial = 0 }: Props) {
  const [score, setScore] = useState(initial);
  const [choice, setChoice] = useState<"up" | "down" | null>(null);

  function upvote() {
    setScore((s) => s + (choice === "up" ? -1 : choice === "down" ? 2 : 1));
    setChoice((c) => (c === "up" ? null : "up"));
  }

  function downvote() {
    setScore((s) => s + (choice === "down" ? 1 : choice === "up" ? -2 : -1));
    setChoice((c) => (c === "down" ? null : "down"));
  }

  return (
    <div className="flex items-center gap-2 text-slate-300">
      <motion.button
        whileTap={{ scale: 0.9 }}
        aria-label="Upvote"
        onClick={upvote}
        className={`rounded-full border px-2.5 py-1 text-sm transition ${
          choice === "up"
            ? "border-pink-400/60 bg-pink-500/10 text-pink-300"
            : "border-slate-700/60 bg-slate-900/40 hover:border-slate-600/60"
        }`}
      >
        ▲
      </motion.button>
      <span className="min-w-10 text-center font-semibold">{score}</span>
      <motion.button
        whileTap={{ scale: 0.9 }}
        aria-label="Downvote"
        onClick={downvote}
        className={`rounded-full border px-2.5 py-1 text-sm transition ${
          choice === "down"
            ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-300"
            : "border-slate-700/60 bg-slate-900/40 hover:border-slate-600/60"
        }`}
      >
        ▼
      </motion.button>
    </div>
  );
}
