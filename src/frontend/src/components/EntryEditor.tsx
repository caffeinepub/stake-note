import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Save, Tag, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DiaryEntry } from "../backend.d";
import {
  useCreateEntry,
  useDeleteEntry,
  useUpdateEntry,
} from "../hooks/useQueries";
import TagChip from "./TagChip";

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface EntryEditorProps {
  entry: DiaryEntry | null;
  isCreating: boolean;
  onSaved: () => void;
  onDeleted: () => void;
}

export default function EntryEditor({
  entry,
  isCreating,
  onSaved,
  onDeleted,
}: EntryEditorProps) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [tagsInput, setTagsInput] = useState(entry?.moodTags.join(", ") ?? "");

  useEffect(() => {
    setTitle(entry?.title ?? "");
    setBody(entry?.body ?? "");
    setTagsInput(entry?.moodTags.join(", ") ?? "");
  }, [entry]);

  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();
  const deleteEntry = useDeleteEntry();

  const isPending = createEntry.isPending || updateEntry.isPending;

  const parsedTags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please add a title before saving.");
      return;
    }
    try {
      if (isCreating) {
        await createEntry.mutateAsync({
          title: title.trim(),
          body,
          moodTags: parsedTags,
        });
        toast.success("Entry created!");
      } else if (entry) {
        await updateEntry.mutateAsync({
          id: entry.id,
          title: title.trim(),
          body,
          moodTags: parsedTags,
        });
        toast.success("Entry updated!");
      }
      onSaved();
    } catch {
      toast.error("Failed to save entry. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    try {
      await deleteEntry.mutateAsync(entry.id);
      toast.success("Entry deleted.");
      onDeleted();
    } catch {
      toast.error("Failed to delete entry.");
    }
  };

  // Empty state — nothing selected and not creating
  if (!isCreating && !entry) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-card p-12 text-center max-w-md w-full"
        >
          <FileText
            className="w-14 h-14 mx-auto mb-4"
            style={{ color: "oklch(0.748 0.110 72)" }}
          />
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Your Journal
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Select an entry from the sidebar or click{" "}
            <strong>New Entry +</strong> to start writing.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col p-6 overflow-auto"
    >
      <div className="max-w-3xl w-full mx-auto flex flex-col gap-5 flex-1">
        {/* Entry card */}
        <div className="bg-card rounded-2xl shadow-card border border-border flex flex-col flex-1 overflow-hidden">
          <div className="p-6 pb-4 border-b border-border">
            {/* Title */}
            <input
              data-ocid="editor.title.input"
              type="text"
              placeholder="Entry title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full font-display font-bold text-3xl text-foreground bg-transparent outline-none placeholder:text-muted-foreground/40 border-none resize-none"
              style={{ lineHeight: 1.2 }}
            />
            {/* Date */}
            <p className="text-xs text-muted-foreground mt-1.5">
              {entry
                ? formatDate(entry.createdAt)
                : new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
            </p>
          </div>

          {/* Tags row */}
          <div className="px-6 py-3 border-b border-border flex items-center gap-3">
            <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Input
              data-ocid="editor.tags.input"
              placeholder="mood tags (comma-separated, e.g. happy, grateful, reflective)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="flex-1 border-none bg-transparent shadow-none px-0 text-sm focus-visible:ring-0"
            />
          </div>
          {parsedTags.length > 0 && (
            <div className="px-6 py-2.5 flex flex-wrap gap-1.5 border-b border-border">
              {parsedTags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </div>
          )}

          {/* Body */}
          <Textarea
            data-ocid="editor.body.textarea"
            placeholder="What's on your mind today…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="flex-1 min-h-[300px] border-none rounded-none bg-transparent resize-none text-base leading-relaxed focus-visible:ring-0 px-6 py-5 text-foreground placeholder:text-muted-foreground/40"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-3 pb-2">
          {entry && !isCreating ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  data-ocid="editor.delete_button"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  disabled={deleteEntry.isPending}
                >
                  {deleteEntry.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="editor.delete.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Your journal entry will be
                    permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="editor.delete.cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="editor.delete.confirm_button"
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <div />
          )}

          <Button
            data-ocid="editor.save.button"
            onClick={handleSave}
            disabled={isPending}
            className="font-semibold px-8 rounded-xl shadow-warm"
            style={{
              background: "oklch(0.748 0.110 72)",
              color: "oklch(0.160 0 0)",
            }}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isPending ? "Saving…" : "Save Entry"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
