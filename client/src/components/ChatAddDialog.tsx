import { Plus, UserSearch } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import { ChatUser } from "@/hooks/useAppManager";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { ScrollArea } from "./ui/scroll-area";
import { fetch } from "@tauri-apps/plugin-http";

export default function ChatAddDialog() {
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<ChatUser[] | null>(null);

  const searchUsers = async (query: string) => {
    try {
      setIsSearching(true);
      const response = await fetch(`http://localhost:8080/api/clients`);
      const data: string[] = await response.json();
      let user = data.map((id) => ({
        id: id,
        name: id,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${id}`,
      }));

      user.filter((user) => user.id == query);
      // setSearchResult());
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <AnimatePresence mode="popLayout">
      <Dialog>
        <DialogTrigger>
          <Plus className="size-4.5 rounded-full cursor-pointer text-muted-foreground" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle asChild>
              <motion.span layoutId="title">Search for friends!</motion.span>
            </DialogTitle>
            <DialogDescription asChild>
              <motion.span layoutId="description">
                Type their id to add them to your chat.
              </motion.span>
            </DialogDescription>
          </DialogHeader>
          {/* content */}
          <motion.div layout="position" className="flex items-center gap-2">
            <motion.div
              layout="position"
              className="flex w-full items-center gap-2"
            >
              <Input
                type="text"
                placeholder="Enter friend's ID"
                disabled={isSearching}
              />
              <Button
                type="submit"
                variant="outline"
                disabled={isSearching}
                onClick={() => {
                  setIsSearching(true);
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsSearching(false);
                    setIsLoading(false);
                  }, 4000);
                }}
              >
                <UserSearch />
                Search
              </Button>
            </motion.div>
          </motion.div>
          {isLoading && (
            <motion.span
              layoutId="searchiresult"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.2, delay: 0.3 },
              }}
              exit={{ opacity: 0 }}
              key="searching"
            >
              <Skeleton className="h-40"></Skeleton>
            </motion.span>
          )}
          {!isLoading && searchResult !== null && (
            <ScrollArea className="max-h-64">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ring ring-white/30 rounded-md p-3"
              >
                {searchResult.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-muted-foreground"
                  >
                    No results found
                  </motion.div>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {searchResult.map((user) => (
                      <motion.li
                        key={user.id}
                        className="flex items-center space-x-1"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>{user.username[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.username}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </ScrollArea>
          )}
          {/* content */}
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary" asChild>
                <motion.button
                  layoutId="close-btn"
                  className="transition-colors"
                >
                  Cancel
                </motion.button>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
}
