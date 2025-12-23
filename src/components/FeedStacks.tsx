import { useEffect, useMemo, useState } from "react";
import ProjectStack, { type Project } from "./ProjectStack";

interface ApiPost {
  id?: string;
  content?: string;
  projectLink?: string;
  imageUrl?: string;
  tags?: string[];
  status?: string;
  likesCount?: number;
  commentsCount?: number;
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
  authorUsername?: string;
  authorId?: string;
}

interface FeedUser {
  name: string;
  handle: string;
  projects: Project[];
}

const randomId = () => Math.random().toString(36).slice(2);
const deriveTitle = (post: ApiPost) => {
  if (post.projectLink) {
    try {
      const url = new URL(post.projectLink);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`;
      }
      return url.hostname;
    } catch {
      return post.projectLink;
    }
  }
  return post.content?.slice(0, 48) || "Untitled project";
};

export default function FeedStacks() {
  const [users, setUsers] = useState<FeedUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const base = (import.meta.env.PUBLIC_API_URL ?? "").replace(/\/$/, "");
        const endpoint = base ? `${base}/getAllPosts` : "getAllPosts";
        const response = await fetch(endpoint, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to load posts (${response.status})`);
        }
        const payload = await response.json();
        const posts: ApiPost[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        const grouped = new Map<string, FeedUser>();
        for (const post of posts) {
          const handle = (post.authorUsername ?? "anonymous").trim() || "anonymous";
          const name = handle;
          const key = handle || post.id || randomId();
          const existing = grouped.get(key) ?? { name, handle, projects: [] };
          const tags = Array.isArray(post.tags)
            ? post.tags.filter((tag): tag is string => typeof tag === "string")
            : [];
          const comments: Project["comments"] = [];
          existing.projects.push({
            id: post.id ?? randomId(),
            title: deriveTitle(post),
            description: post.content ?? "",
            tags,
            status: post.status?.toLowerCase() === "live" ? "live" : "building",
            score: post.likesCount ?? 0,
            durationDays: undefined,
            stars: undefined,
            forks: undefined,
            createdAt: post.createdAt,
            comments,
          });
          grouped.set(key, existing);
        }
        if (active) {
          setUsers(Array.from(grouped.values()));
        }
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Unable to load posts.";
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="rounded-3xl border border-slate-800/60 bg-slate-900/30 p-6 text-sm text-slate-300">
          Loading projects...
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-100">
          Failed to load projects: {error}
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="rounded-3xl border border-slate-800/60 bg-slate-900/30 p-6 text-sm text-slate-300">
          No projects found yet. Try creating one to get the feed started.
        </div>
      );
    }

    return (
      <section className="space-y-10">
        {users.map((user) => (
          <div key={user.handle} className="rounded-3xl border border-slate-800/60 bg-slate-900/30 p-6 backdrop-blur-xl">
            <ProjectStack user={{ name: user.name, handle: user.handle }} projects={user.projects} />
          </div>
        ))}
      </section>
    );
  }, [error, loading, users]);

  return content;
}
