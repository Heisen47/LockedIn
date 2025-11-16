import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const TECH_STACK_OPTIONS = [
  "React",
  "Vue",
  "Angular",
  "Svelte",
  "Next.js",
  "Nuxt",
  "Astro",
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "Go",
  "Rust",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Node.js",
  "Deno",
  "Bun",
  "Express",
  "FastAPI",
  "Django",
  "Flask",
  "Spring",
  "ASP.NET",
  "Rails",
  "Laravel",
  "TailwindCSS",
  "Bootstrap",
  "MaterialUI",
  "ChakraUI",
  "ShadcnUI",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "SQLite",
  "Supabase",
  "Firebase",
  "AWS",
  "Azure",
  "GCP",
  "Vercel",
  "Netlify",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "REST",
  "tRPC",
  "Prisma",
  "Drizzle",
  "WebSocket",
  "WebRTC",
  "Three.js",
  "WebGL",
  "WebGPU",
  "TensorFlow",
  "PyTorch",
  "OpenAI",
  "LangChain",
  "CRDT",
  "IndexedDB",
  "PWA",
  "Electron",
  "Tauri",
  "Cloudflare",
  "EdgeComputing",
  "Serverless",
  "Microservices",
  "WASM",
  "Git",
  "GitHub",
  "GitLab",
  "CI/CD",
  "Jest",
  "Vitest",
  "Playwright",
  "Cypress",
  "Terraform",
  "Ansible",
  "Nginx",
  "Apache",
  "OAuth",
  "JWT",
  "Stripe",
  "Shopify",
  "Headless CMS",
  "Sanity",
  "Contentful",
];

interface TechStackInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  label?: string;
  showLabel?: boolean;
}

export default function TechStackInput({
  tags,
  onTagsChange,
  maxTags = 10,
  placeholder = "Type to search tech stack...",
  label = "Tech Stack Tags",
  showLabel = true,
}: TechStackInputProps) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (input.trim()) {
      const filtered = TECH_STACK_OPTIONS.filter(
        (tech) =>
          tech.toLowerCase().includes(input.toLowerCase()) &&
          !tags.includes(tech)
      ).slice(0, 10);
      setFilteredOptions(filtered);
      setShowDropdown(filtered.length > 0);
      setHighlightedIndex(0);
    } else {
      setFilteredOptions([]);
      setShowDropdown(false);
      setHighlightedIndex(0);
    }
  }, [input, tags]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    if (tags.length >= maxTags) return;
    if (!tags.includes(tag)) {
      const newTags = [...tags, tag];
      onTagsChange(newTags);
      // Dispatch custom event for non-React contexts (like Astro)
      const container = document.getElementById('techstack-container');
      if (container) {
        const event = new CustomEvent('techstack-change', { 
          detail: { tags: newTags },
          bubbles: true 
        });
        container.dispatchEvent(event);
      }
    }
    setInput("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    onTagsChange(newTags);
    // Dispatch custom event for non-React contexts (like Astro)
    const container = document.getElementById('techstack-container');
    if (container) {
      const event = new CustomEvent('techstack-change', { 
        detail: { tags: newTags },
        bubbles: true 
      });
      container.dispatchEvent(event);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      if (filteredOptions.length > 0) {
        e.preventDefault();
        setHighlightedIndex((i) => (i + 1) % filteredOptions.length);
      }
    } else if (e.key === 'ArrowUp') {
      if (filteredOptions.length > 0) {
        e.preventDefault();
        setHighlightedIndex((i) => (i - 1 + filteredOptions.length) % filteredOptions.length);
      }
    } else if (e.key === 'Tab') {
      if (filteredOptions.length > 0) {
        e.preventDefault();
        setInput(filteredOptions[highlightedIndex]);
        setShowDropdown(false);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) return;
      addTag(trimmed);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div>
      {showLabel && (
        <label className="mb-1 block text-sm font-medium text-slate-300">
          {label}
          {maxTags && tags.length > 0 && (
            <span className="ml-2 text-xs text-slate-500">
              ({tags.length}/{maxTags})
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredOptions.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          disabled={tags.length >= maxTags}
          className="w-full rounded-xl border border-slate-700/60 bg-slate-950/60 px-3 py-2 text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-slate-600/60 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <AnimatePresence>
          {showDropdown && filteredOptions.length > 0 && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-800/60 bg-slate-900/95 p-1 shadow-xl backdrop-blur-sm"
            >
              {filteredOptions.map((tech, idx) => {
                const active = idx === highlightedIndex;
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => {
                      setInput(tech);
                      setShowDropdown(false);
                      inputRef.current?.focus();
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${active ? 'bg-slate-800/70 text-slate-100' : 'text-slate-200 hover:bg-slate-800/60'}`}
                  >
                    {tech}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          <AnimatePresence initial={false}>
            {tags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/60 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded-full text-cyan-400 hover:text-cyan-200"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}

      {tags.length >= maxTags && (
        <p className="mt-2 text-xs text-slate-400">
          Maximum of {maxTags} tags reached
        </p>
      )}
    </div>
  );
}
