import { Button } from "@/components/ui/button";
import { Leaf, LogOut, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile } from "../hooks/useQueries";

interface HeaderProps {
  activeTab: "journal" | "settings";
  onTabChange: (tab: "journal" | "settings") => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const { identity, clear } = useInternetIdentity();
  const { data: profile } = useUserProfile();

  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 10)}…`
    : null;

  const displayName = profile?.name || principalShort || "";

  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-4 px-6 h-[60px] border-b border-border"
      style={{ background: "oklch(0.902 0.042 80)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.748 0.110 72)" }}
        >
          <Leaf className="w-4 h-4" style={{ color: "oklch(0.160 0 0)" }} />
        </div>
        <span className="font-display font-bold text-lg tracking-tight text-foreground">
          Stake Note
        </span>
      </div>

      {/* Nav tabs */}
      <nav
        className="flex-1 flex justify-center gap-1"
        aria-label="Main navigation"
      >
        <button
          type="button"
          data-ocid="nav.journal.tab"
          onClick={() => onTabChange("journal")}
          className={[
            "px-5 py-1.5 rounded-full text-sm font-semibold transition-all",
            activeTab === "journal"
              ? "bg-primary text-primary-foreground shadow-warm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
          ].join(" ")}
        >
          Journal
        </button>
        <button
          type="button"
          data-ocid="nav.settings.tab"
          onClick={() => onTabChange("settings")}
          className={[
            "px-5 py-1.5 rounded-full text-sm font-semibold transition-all",
            activeTab === "settings"
              ? "bg-primary text-primary-foreground shadow-warm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
          ].join(" ")}
        >
          Settings
        </button>
      </nav>

      {/* User / Auth */}
      <div className="flex items-center gap-2 min-w-[160px] justify-end">
        {identity && (
          <>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="truncate max-w-[100px]">{displayName}</span>
            </div>
            <Button
              data-ocid="auth.logout.button"
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
