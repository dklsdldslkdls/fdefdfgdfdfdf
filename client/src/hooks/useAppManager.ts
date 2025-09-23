import { useSyncExternalStore } from "react";
import { emit, once } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface ChatUser {
  id: string;
  username: string;
  avatar_url: string;
}

interface AppState {
  isLoading: boolean;
  loadingState: LoadingState;
  error: string | null;
  isInitialized: boolean;
  chatId: ChatUser | null;
}

interface AppStore extends AppState {
  initializeApp: (shouldRecall?: boolean) => Promise<void>;
  setChatId: (chatId: ChatUser | null) => void;
}

class AppManagerStore {
  private state: AppState = {
    isLoading: false,
    loadingState: "idle",
    error: null,
    isInitialized: false,
    chatId: null,
  };

  private listeners = new Set<() => void>();

  getState = (): AppStore => ({
    ...this.state,
    initializeApp: this.initializeApp,
    setChatId: this.setChatId,
  });

  setChatId = (chatId: ChatUser | null) => {
    this.setState({ chatId });
  };

  setState = (partial: Partial<AppState>) => {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener());
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  initializeApp = async (shouldRecall?: boolean) => {
    if (this.state.isInitialized) return;

    this.setState({
      loadingState: "loading",
      isLoading: true,
      error: null,
    });

    try {
      console.log("emitted");

      const waitForInitialization = new Promise<void>(
        async (resolve, reject) => {
          once<{
            status: "failed" | "success";
            message?: string;
          }>("initialization-status", ({ payload }) => {
            const { status, message } = payload;

            if (status === "failed") {
              reject(new Error(message || "Failed to initialize app"));
              return;
            }

            this.setState({
              loadingState: "success",
              isLoading: false,
              isInitialized: true,
            });

            console.log("App initialized successfully");
            resolve();
          });
        },
      );
      await emit("frontend-ready");
      if (shouldRecall) {
        invoke("connect_ws");
      }
      await waitForInitialization;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to initialize app`;

      this.setState({
        error: errorMessage,
        loadingState: "error",
        isLoading: false,
      });

      console.error("App initialization failed:", err);
    }
  };
}

const appManagerStore = new AppManagerStore();

// Auto-inizializzazione
appManagerStore.initializeApp();

// Hook principale con selector
export function useAppManager<T>(selector: (state: AppStore) => T): T {
  return useSyncExternalStore(
    appManagerStore.subscribe,
    () => selector(appManagerStore.getState()),
    () => selector(appManagerStore.getState()),
  );
}

// Hook senza selector (restituisce tutto lo stato)
export function useAppManagerState(): AppStore {
  return useSyncExternalStore(
    appManagerStore.subscribe,
    appManagerStore.getState,
    appManagerStore.getState,
  );
}
