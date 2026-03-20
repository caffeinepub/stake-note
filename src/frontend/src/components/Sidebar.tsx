import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Plus, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { DiaryEntry } from "../backend.d";
import { useEntries, useSearchEntries } from "../hooks/useQueries";
import TagChip from "./TagChip";

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface SidebarProps {
  selectedEntry: DiaryEntry | null;
  onSelectEntry: (entry: DiaryEntry) => void;
  onNewEntry: () => void;
}

export default function Sidebar({
  selectedEntry,
  onSelectEntry,
  onNewEntry,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allEntries = [], isLoading } = useEntries();
  const { data: searchResults } = useSearchEntries(searchQuery);

  const entries = useMemo(() => {
    if (searchQuery.trim()) return searchResults ?? [];
    return [...allEntries].sort(
      (a, b) => Number(b.createdAt) - Number(a.createdAt),
    );
  }, [searchQuery, allEntries, searchResults]);

  return (
    <aside
      className="w-[320px] flex-shrink-0 flex flex-col h-full border-r border-border"
      style={{ background: "oklch(0.916 0.032 80)" }}
    >
      {/* Sidebar header */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-foreground">
            Journal Entries
          </h2>
        </div>
        <Button
          data-ocid="sidebar.new_entry.button"
          onClick={onNewEntry}
          className="w-full font-semibold rounded-xl mb-3 shadow-warm"
          style={{
            background: "oklch(0.748 0.110 72)",
            color: "oklch(0.160 0 0)",
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Entry +
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="sidebar.search.input"
            placeholder="Search entries…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl border-border"
            style={{ background: "oklch(0.977 0.015 82)" }}
          />
        </div>
      </div>

      {/* Entry list */}
      <ScrollArea className="flex-1 px-3 pb-3">
        {isLoading && (
          <div
            data-ocid="sidebar.loading_state"
            className="flex flex-col gap-2 mt-2"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl bg-card/60 h-24 animate-pulse"
              />
            ))}
          </div>
        )}
        {!isLoading && entries.length === 0 && (
          <div
            data-ocid="sidebar.empty_state"
            className="flex flex-col items-center justify-center py-12 text-center gap-3"
          >
            <BookOpen className="w-10 h-10 text-muted-foreground/50" />
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? "No entries match your search."
                : "No entries yet. Start writing!"}
            </p>
          </div>
        )}
        <AnimatePresence>
          {entries.map((entry, idx) => (
            <motion.button
              key={entry.id.toString()}
              data-ocid={`entry.item.${idx + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18, delay: idx * 0.04 }}
              onClick={() => onSelectEntry(entry)}
              className={[
                "w-full text-left rounded-xl p-4 mb-2 border transition-all",
                selectedEntry?.id === entry.id
                  ? "bg-card border-primary/50 shadow-warm"
                  : "bg-card/70 border-border hover:bg-card hover:shadow-xs",
              ].join(" ")}
            >
              <p className="font-semibold text-sm text-foreground truncate mb-0.5">
                {entry.title || "Untitled"}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {formatDate(entry.createdAt)}
              </p>
              {entry.body && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {entry.body}
                </p>
              )}
              {entry.moodTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.moodTags.slice(0, 3).map((tag) => (
                    <TagChip key={tag} tag={tag} />
                  ))}
                </div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </ScrollArea>
    </aside>
  );
}
