import { AnimatePresence, motion } from "motion/react";
import { TypingIndicator } from "./ChatPage";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  useActiveConversation,
  useUserActions,
} from "@/hooks/MessagesProvider";
import { ChatUser } from "@/hooks/useAppManager";
import { MoreVerticalIcon } from "lucide-react";

interface RenderChatMessagesProps {
  chatId: ChatUser;
}

export default function RenderChatMessages({
  chatId,
}: RenderChatMessagesProps) {
  const currentConvo = useActiveConversation();
  const currentUser = useUserActions();

  return (
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
            <AvatarFallback>
              <div className="bg-violet-500 size-8 rounded-full p-2 flex items-center justify-center">
                <p>{chatId.username.substring(0, 2).toUpperCase()}</p>
              </div>
            </AvatarFallback>
          </Avatar>
          <p className="text-lg">{chatId.username}</p>
        </div>
        <MoreVerticalIcon />
      </div>
      <div id="chat" className="mt-5 flex flex-col gap-4">
        {currentConvo.messages.map((message) => (
          <div
            key={message.id}
            className={`w-full flex ${message.senderId === currentUser.currentUserId ? "justify-end" : "justify-start"} gap-1`}
          >
            {/*<span className="text-sm font-medium">
                {message.senderName}
              </span>*/}
            <div className="flex max-w-[55ch] break-all">
              <span
                className={`text-base ${message.senderId === currentUser.currentUserId ? "bg-violet-900 text-secondary-foreground" : "bg-secondary text-secondary-foreground"} px-3 py-2 rounded-lg`}
              >
                {message.content}
              </span>
            </div>
          </div>
        ))}

        <AnimatePresence>
          {currentConvo.isTyping && (
            <TypingIndicator typingUsers={currentConvo.typingUsers} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
