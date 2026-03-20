import { Button } from "@/components/ui/button";
import { BookHeart, Leaf, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative"
      style={{ background: "oklch(0.928 0.030 82)" }}
    >
      <div className="app-vignette" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 bg-card rounded-2xl shadow-card border border-border p-10 w-full max-w-md mx-4 text-center"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-warm"
            style={{ background: "oklch(0.748 0.110 72)" }}
          >
            <Leaf className="w-5 h-5" style={{ color: "oklch(0.160 0 0)" }} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-foreground">
            Stake Note
          </span>
        </div>

        <BookHeart
          className="w-12 h-12 mx-auto mb-5"
          style={{ color: "oklch(0.748 0.110 72)" }}
        />

        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Your personal diary
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          A pure Indian app created by Jay Prajapati — your warm space to
          capture thoughts, moods, and memories, private and secure on the
          Internet Computer.
        </p>

        <Button
          data-ocid="auth.login.button"
          onClick={login}
          disabled={isLoggingIn}
          className="w-full font-semibold py-5 rounded-xl text-base shadow-warm"
          style={{
            background: "oklch(0.748 0.110 72)",
            color: "oklch(0.160 0 0)",
          }}
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting…
            </>
          ) : (
            "Sign in to continue"
          )}
        </Button>

        <p className="text-xs text-muted-foreground mt-5">
          Secured by Internet Identity — no passwords, no tracking.
        </p>
      </motion.div>

      <footer className="relative z-10 mt-8 text-xs text-muted-foreground text-center">
        &copy; {new Date().getFullYear()} Stake Note. Built with ♥ by Jay
        Prajapati using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
