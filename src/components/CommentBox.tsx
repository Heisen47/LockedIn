import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  author: string;
  text: string;
}

interface Props {
  initial?: Comment[];
}

export default function CommentBox({ initial = [] }: Props) {
  const [comments, setComments] = useState<Comment[]>(initial);
  const [val, setVal] = useState("");

  function add() {
    const v = val.trim();
    if (!v) return;
    setComments((c) => [
      ...c,
      { id: Math.random().toString(36).slice(2), author: "You", text: v },
    ]);
    setVal("");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
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
          {comments.map((c) => (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-3 text-sm"
            >
              <span className="font-medium text-slate-200">{c.author}</span>
              <span className="text-slate-500"> • </span>
              <span className="text-slate-300">{c.text}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
