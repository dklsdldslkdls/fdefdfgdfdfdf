import { useAppManager } from "@/hooks/useAppManager";
import { MessagesSquare, SearchIcon, SearchX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { AnimatePresence, motion } from "motion/react";
import { Input } from "./ui/input";

export function NoChatSelectedHtml() {
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searching) {
      const handleKeyDown = (event: KeyboardEvent) => {
        console.log("key pressed");
        if (event.key === "Escape") {
          setSearching(false);
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [searching]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Search bar when active */}
      <AnimatePresence>
        {searching && (
          <motion.div
            key="searchbar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 24, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.25, 1, 0.5, 1], // smoother easing (easeOut)
            }}
            className="absolute top-0 left-0 right-0 px-6 pt-6 z-10"
          >
            <div className="relative group">
              <SearchIcon className="absolute size-5 top-2 left-3 group-focus-visible:stroke-red-500" />
              <Input
                placeholder="Search for friends..."
                autoFocus
                className="w-full pl-10"
              />
            </div>
          </motion.div>
        )}

        {/* Main UI */}
        <motion.div
          className="grid place-content-center h-full text-center px-6"
          animate={{
            opacity: searching ? 0.3 : 1,
            y: searching ? -20 : 0,
          }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        >
          <motion.span layoutId="icon">
            <MessagesSquare className="size-20 mx-auto" />
          </motion.span>

          <motion.h1
            className="text-3xl tracking-tight font-semibold mt-4"
            layoutId="title"
          >
            No chat selected yet!
          </motion.h1>

          <motion.p layoutId="desc">
            select or create one at any moment
          </motion.p>

          {!searching && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            >
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => setSearching(true)}
              >
                <SearchIcon className="size-4" />
                Search for Friends
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function ChatPage() {
  const chatId = useAppManager((state) => state.chatId);
  const setChatId = useAppManager((state) => state.setChatId);

  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (event.key === "Escape") {
  //       setChatId(null);
  //     }
  //   };

  //   document.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  return (
    <div className="bg-background p-3 flex-1">
      {chatId ? `Chat ID: ${chatId}` : <NoChatSelectedHtml />}
    </div>
  );
}
