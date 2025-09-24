import { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppManager } from "./useAppManager";
import { Button } from "@/components/ui/button";
import { relaunch } from "@tauri-apps/plugin-process";
import { invoke } from "@tauri-apps/api/core";

// Loading Screen Component
export function LoadingScreen() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen flex items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center space-y-1.5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h2 className="text-xl font-semibold text-foreground">
          Loading NextielChat...
        </h2>
        <p className="text-sm text-muted-foreground">
          Please wait while we initialize the application
        </p>
      </div>
    </motion.div>
  );
}

// Error Screen Component
export function ErrorScreen({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  const onChangeId = () => {
    invoke("change_id_request").then(() => {
      onRetry();
    });
  };

  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen flex items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center max-w-md text-center space-y-5">
        <div className="rounded-full bg-destructive/10 p-4">
          <svg
            className="h-8 w-8 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="text-base text-muted-foreground">{error}</p>
        </div>
        {/*<Button
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-md mt-3 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Try Again
        </Button>*/}
        <div className="flex gap-3">
          <Button
            variant={"secondary"}
            size={"lg"}
            onClick={onRetry}
            className="mt-3"
          >
            Try Again
          </Button>
          <Button
            variant={"outline"}
            size={"lg"}
            onClick={onChangeId}
            className="mt-3"
          >
            Refresh Token
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Main App Wrapper with Loading States
export function AppWrapper({ children }: { children: ReactNode }) {
  const isLoading = useAppManager((state) => state.isLoading);
  const error = useAppManager((state) => state.error);
  const isInitialized = useAppManager((state) => state.isInitialized);
  const onRetry = useAppManager((state) => state.initializeApp);

  return (
    <AnimatePresence mode="wait">
      {isLoading && !isInitialized && <LoadingScreen />}

      {error && (
        <ErrorScreen
          key={"error"}
          error={error}
          onRetry={() => onRetry(true)}
        />
      )}

      {!isLoading && !error && isInitialized && (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          // transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
