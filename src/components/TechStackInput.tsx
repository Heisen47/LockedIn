import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TECH_STACK_OPTIONS } from "../lib/techStackOptions";

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
  console.log('🎯 TechStackInput initialized with props:', {
    tags,
    onTagsChange: typeof onTagsChange,
    maxTags,
    placeholder,
    label,
    showLabel
  });
  
  const [localTags, setLocalTags] = useState<string[]>(tags);
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalTags(tags);
  }, [tags]);

  useEffect(() => {
    if (input.trim()) {
      const filtered = TECH_STACK_OPTIONS.filter(
        (tech) =>
          tech.toLowerCase().includes(input.toLowerCase()) &&
          !localTags.includes(tech)
      ).slice(0, 10);
      setFilteredOptions(filtered);
      setShowDropdown(filtered.length > 0);
      setHighlightedIndex(0);
    } else {
      setFilteredOptions([]);
      setShowDropdown(false);
      setHighlightedIndex(0);
    }
  }, [input, localTags]);

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
    console.log('🏷️  addTag called with:', tag);
    console.log('🏷️  onTagsChange type:', typeof onTagsChange);
    console.log('🏷️  onTagsChange value:', onTagsChange);
    
    setInput("");
    setFilteredOptions([]);
    setShowDropdown(false);
    setHighlightedIndex(0);
    inputRef.current?.focus();

    if (!tag) return;

    if (localTags.length >= maxTags) return;
    if (!localTags.includes(tag)) {
      const newTags = [...localTags, tag];
      console.log('🏷️  New tags array:', newTags);
      setLocalTags(newTags);
      
      // Call onTagsChange if it's a function
      if (typeof onTagsChange === 'function') {
        console.log('🏷️  Calling onTagsChange with:', newTags);
        onTagsChange(newTags);
      } else {
        console.error('❌ onTagsChange is not a function!', onTagsChange);
      }
      
      // Dispatch custom event for non-React contexts (like Astro)
      const container = document.getElementById('techstack-container');
      if (container) {
        console.log('🏷️  Dispatching custom event');
        const event = new CustomEvent('techstack-change', { 
          detail: { tags: newTags },
          bubbles: true 
        });
        container.dispatchEvent(event);
      }
    }
  };

  const removeTag = (tag: string) => {
    const newTags = localTags.filter((t) => t !== tag);
    setLocalTags(newTags);
    
    // Call onTagsChange if it's a function
    if (typeof onTagsChange === 'function') {
      onTagsChange(newTags);
    }
    
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
      if (filteredOptions.length > 0 && showDropdown) {
        e.preventDefault();
        addTag(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0 && showDropdown) {
        addTag(filteredOptions[highlightedIndex]);
      } else {
        const trimmed = input.trim();
        if (trimmed) addTag(trimmed);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div>
      {showLabel && (
        <label className="mb-1 block text-sm font-medium text-slate-300">
          {label}
          {maxTags && localTags.length > 0 && (
            <span className="ml-2 text-xs text-slate-500">
              ({localTags.length}/{maxTags})
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
          placeholder={placeholder}
          disabled={localTags.length >= maxTags}
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
                    onClick={() => addTag(tech)}
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

      {localTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          <AnimatePresence initial={false}>
            {localTags.map((tag) => (
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

      {localTags.length >= maxTags && (
        <p className="mt-2 text-xs text-slate-400">
          Maximum of {maxTags} tags reached
        </p>
      )}
    </div>
  );
}
