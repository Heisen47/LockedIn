import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, MessageSquare, X } from "lucide-react";

interface Comment {
  id: string;
  author: string;
  text: string;
  votes: number;
  userVote: 1 | -1 | 0;
  parentId: string | null;
  createdAt: number;
}

interface InitialComment {
  id: string;
  author: string;
  text: string;
  parentId?: string | null;
  createdAt?: number;
}

interface Props {
  initial?: InitialComment[];
  title?: string;
}

export default function CommentBox({ initial = [], title = "Discussion" }: Props) {
  const [comments, setComments] = useState<Comment[]>(() =>
    initial.map((c, idx) => ({
      id: c.id,
      author: c.author,
      text: c.text,
      votes: 0,
      userVote: 0,
      parentId: c.parentId ?? null,
      createdAt: c.createdAt ?? Date.now() - (initial.length - idx) * 1000,
    }))
  );
  const [val, setVal] = useState("");
  const [threadOpen, setThreadOpen] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!threadOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setThreadOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [threadOpen]);

  const createComment = (text: string, parentId: string | null = null) => {
    const body = text.trim();
    if (!body) return;
    setComments((current) => [
      ...current,
      {
        id: Math.random().toString(36).slice(2),
        author: "You",
        text: body,
        votes: 0,
        userVote: 0,
        parentId,
        createdAt: Date.now(),
      },
    ]);
  };

  const reportComment = (id: string) => {
    alert("Thank you for reporting this comment. Our team will review it shortly.");
  }

  function add() {
    createComment(val, null);
    setVal("");
  }

  function addReply(parentId: string) {
    const draft = replyDrafts[parentId]?.trim() ?? "";
    if (!draft) return;
    createComment(draft, parentId);
    setReplyDrafts((prev) => ({ ...prev, [parentId]: "" }));
    setActiveReplyId(null);
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

  const sortedByTime = useMemo(
    () => [...comments].sort((a, b) => a.createdAt - b.createdAt),
    [comments]
  );
  const topLevel = sortedByTime.filter((comment) => !comment.parentId);
  const previewComment = topLevel[topLevel.length - 1];
  const commentCount = comments.length;
  const remainingCount = Math.max(commentCount - (previewComment ? 1 : 0), 0);
  const submitDisabled = val.trim().length === 0;

  const openThread = () => setThreadOpen(true);
  const closeThread = () => setThreadOpen(false);
  const renderPreviewComment = (comment: Comment) => (
    <motion.li
      layout
      key={comment.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="rounded-2xl border border-slate-800/60 bg-slate-900/30 px-3 py-3 text-sm sm:px-4 sm:py-4"
    >
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="font-medium text-slate-200">{comment.author}</span>
        <span aria-hidden="true">&bull;</span>
        <span>moments ago</span>
      </div>
      <p className="mt-1 break-words text-sm text-slate-300">{comment.text}</p>
    </motion.li>
  );

  const childrenMap = useMemo(() => {
    const grouped = new Map<string | null, Comment[]>();
    sortedByTime.forEach((comment) => {
      const key = comment.parentId;
      const bucket = grouped.get(key) ?? [];
      bucket.push(comment);
      grouped.set(key, bucket);
    });
    return grouped;
  }, [sortedByTime]);

  const threadRoots = childrenMap.get(null) ?? [];

  const renderThread = (comment: Comment, depth = 0): JSX.Element => {
    const replies = childrenMap.get(comment.id) ?? [];
    const isReplying = activeReplyId === comment.id;

    return (
      <li key={comment.id} className="space-y-3">
        <div className="flex gap-3">
          {depth > 0 && <span className="mt-1 w-px bg-slate-800/60" aria-hidden="true" />}
          <div className="flex flex-1 gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 px-4 py-3">
            <div className="flex w-8 flex-col items-center gap-0.5">
              <button
                onClick={() => vote(comment.id, 1)}
                aria-label="Upvote"
                className={`rounded-md p-0.5 transition-colors ${
                  comment.userVote === 1
                    ? "bg-green-500/20 text-green-300"
                    : "text-slate-400 hover:bg-green-500/10 hover:text-green-300"
                }`}
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <span
                className={`text-[10px] font-semibold tabular-nums sm:text-xs ${
                  comment.votes > 0
                    ? "text-green-300"
                    : comment.votes < 0
                    ? "text-rose-300"
                    : "text-slate-400"
                }`}
              >
                {comment.votes}
              </span>
              <button
                onClick={() => vote(comment.id, -1)}
                aria-label="Downvote"
                className={`rounded-md p-0.5 transition-colors ${
                  comment.userVote === -1
                    ? "bg-rose-500/20 text-rose-300"
                    : "text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-200">{comment.author}</span>
                <span aria-hidden="true">&bull;</span>
                <span>moments ago</span>
              </div>
              <p className="mt-1 break-words text-sm text-slate-300">{comment.text}</p>
              
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setActiveReplyId((prev) => (prev === comment.id ? null : comment.id))}
                  className="font-semibold text-slate-300 transition hover:text-slate-100 cursor-pointer"
                >
                  Reply
                </button>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => reportComment(comment.id)}
                  className="font-semibold text-slate-300 transition hover:text-slate-100 cursor-pointer"
                >
                  Report
                </button>
              </div>
              </div>

              {isReplying && (
                <div className="mt-3 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-3">
                  <textarea
                    value={replyDrafts[comment.id] ?? ""}
                    onChange={(event) =>
                      setReplyDrafts((prev) => ({ ...prev, [comment.id]: event.target.value }))
                    }
                    rows={3}
                    placeholder="Add a reply..."
                    className="w-full resize-y rounded-xl border border-slate-800/60 bg-transparent p-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-slate-600/60 focus:outline-none"
                    onKeyDown={(event) => {
                      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                        event.preventDefault();
                        addReply(comment.id);
                      }
                    }}
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(null)}
                      className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-1.5 text-xs text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => addReply(comment.id)}
                      disabled={(replyDrafts[comment.id] ?? "").trim().length === 0}
                      className="rounded-lg border border-slate-700/60 bg-[linear-gradient(in_oklab,to_right,#00c6ff_0%,#0072ff_100%)] px-4 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {replies.length > 0 && (
          <ul className="ml-5 border-l border-slate-800/60 pl-4">
            {replies.map((child) => renderThread(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Latest comments</p>
        <button
          type="button"
          onClick={openThread}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-900/40 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600/60"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {commentCount ? `View thread (${commentCount})` : "Open thread"}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={val}
          onChange={(event) => setVal(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && add()}
          placeholder="Add a comment..."
          className="flex-1 rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-slate-600/60"
        />
        <button
          type="button"
          onClick={add}
          disabled={submitDisabled}
          className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-600/60 disabled:opacity-50"
        >
          Post
        </button>
      </div>

      {previewComment ? (
        <ul className="space-y-2" aria-live="polite">
          <AnimatePresence initial={false}>{renderPreviewComment(previewComment)}</AnimatePresence>
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/30 px-4 py-6 text-sm text-slate-400">
          Be the first to share your thoughts.
        </div>
      )}

      {previewComment && (
        <p className="text-xs text-slate-500">
          Crack open the full thread to read every comment and reply.
        </p>
      )}

      {remainingCount > 0 && (
        <p className="text-xs text-slate-500">
          {remainingCount} more comment{remainingCount === 1 ? "" : "s"} waiting inside the thread—hit “View thread” to stack them all like Reddit.
        </p>
      )}

      <AnimatePresence>
        {threadOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70" onClick={closeThread} />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-800/60 bg-slate-950/95 p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{title}</p>
                  <p className="text-xs text-slate-500">{commentCount} comment{commentCount === 1 ? "" : "s"}</p>
                </div>
                <button
                  type="button"
                  onClick={closeThread}
                  aria-label="Close thread"
                  className="rounded-full border border-slate-700/60 bg-slate-900/40 p-1 text-slate-300 hover:border-slate-600/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="mt-4 flex-1 overflow-y-auto pr-1">
                {threadRoots.length > 0 ? (
                  <ul className="space-y-4">
                    {threadRoots
                      .slice()
                      .reverse()
                      .map((comment) => renderThread(comment))}
                  </ul>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/30 px-4 py-6 text-sm text-slate-400">
                    No comments yet. Start the conversation below.
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-slate-800/60 pt-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Add a comment
                </label>
                <textarea
                  value={val}
                  onChange={(event) => setVal(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                      event.preventDefault();
                      add();
                    }
                  }}
                  rows={3}
                  placeholder="Share constructive feedback..."
                  className="w-full resize-y rounded-2xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-slate-600/60 focus:outline-none"
                />
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeThread}
                    className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-600/60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      add();
                      if (!submitDisabled) closeThread();
                    }}
                    disabled={submitDisabled}
                    className="rounded-lg border border-slate-700/60 bg-[linear-gradient(in_oklab,to_right,#00c6ff_0%,#0072ff_100%)] px-4 py-1.5 text-sm font-semibold text-white transition disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
