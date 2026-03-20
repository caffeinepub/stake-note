import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { DiaryEntry } from "./backend.d";
import EntryEditor from "./components/EntryEditor";
import Header from "./components/Header";
import LoginPage from "./components/LoginPage";
import Sidebar from "./components/Sidebar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"journal" | "settings">("journal");

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading Stake Note…</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setIsCreating(true);
  };

  const handleSelectEntry = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setIsCreating(false);
  };

  const handleEntrySaved = () => {
    setIsCreating(false);
  };

  const handleEntryDeleted = () => {
    setSelectedEntry(null);
    setIsCreating(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ background: "oklch(0.928 0.030 82)" }}
    >
      <div className="app-vignette" aria-hidden="true" />
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main
        className="flex flex-1 relative z-10 overflow-hidden"
        style={{ height: "calc(100vh - 60px)" }}
      >
        {activeTab === "journal" && (
          <>
            <Sidebar
              selectedEntry={selectedEntry}
              onSelectEntry={handleSelectEntry}
              onNewEntry={handleNewEntry}
            />
            <EntryEditor
              key={
                isCreating ? "new" : (selectedEntry?.id?.toString() ?? "empty")
              }
              entry={isCreating ? null : selectedEntry}
              isCreating={isCreating}
              onSaved={handleEntrySaved}
              onDeleted={handleEntryDeleted}
            />
          </>
        )}
        {activeTab === "settings" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-card rounded-2xl shadow-card p-10 text-center max-w-md w-full mx-4">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Settings
              </h2>
              <p className="text-muted-foreground">
                Settings panel coming soon.
              </p>
            </div>
          </div>
        )}
      </main>
      <footer className="relative z-10 text-center py-3 text-xs text-muted-foreground border-t border-border bg-muted/40">
        <span className="font-semibold text-foreground">Stake Note</span> &copy;{" "}
        {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
