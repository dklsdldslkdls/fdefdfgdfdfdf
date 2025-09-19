import { useAppManager } from "@/hooks/useAppManager";
import {
  MessagesSquare,
  MoreVerticalIcon,
  SearchIcon,
  SearchX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { AnimatePresence, motion } from "motion/react";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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

      const onClickOutsite = (event: MouseEvent) => {
        console.assert(!searchRef.current?.contains(event.target as Node));

        if (
          searchRef.current &&
          !searchRef.current.contains(event.target as Node)
        ) {
          setSearching(false);
        }
      };

      document.addEventListener("mousedown", onClickOutsite);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("mousedown", onClickOutsite);
      };
    }
  }, [searching, searchRef]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-full w-full overflow-hidden"
    >
      {/* Search bar when active */}
      <AnimatePresence>
        {searching && (
          <motion.div
            key="searchbar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 24, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            ref={searchRef}
            transition={{
              duration: 0.5,
              ease: [0.25, 1, 0.5, 1], // smoother easing (easeOut)
            }}
            className="absolute top-0 left-0 right-0 px-6 pt-0 z-10"
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
    </motion.div>
  );
}

export default function ChatPage() {
  const chatId = useAppManager((state) => state.chatId);

  return (
    <div className="bg-background flex-1 p-3">
      <AnimatePresence mode="wait">
        {chatId ? (
          <motion.div
            key={"chat"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-full bg-secondary ring ring-white/25 backdrop-blur-3xl  p-2 px-3 flex items-center justify-between rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar className="size-10">
                  <AvatarImage src={chatId.avatar_url} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <p className="text-lg">{chatId.username}</p>
              </div>
              <MoreVerticalIcon />
            </div>
            <div id="chat" className="mt-5 flex flex-col gap-4">
              ciao
            </div>
          </motion.div>
        ) : (
          <NoChatSelectedHtml key={"no-chat"} />
        )}
      </AnimatePresence>
    </div>
  );
}
