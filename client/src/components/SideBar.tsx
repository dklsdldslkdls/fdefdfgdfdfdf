import {
  BubblesIcon,
  ChevronsUpDown,
  ChevronUp,
  Home,
  MessageCircle,
  Plus,
  Shuffle,
  ShuffleIcon,
  Trash,
  User,
  User2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
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
} from "./ui/alert-dialog";
import { Tooltip } from "./ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAppManager } from "@/hooks/useAppManager";
import {
  useConversationActions,
  useConversationsList,
} from "@/hooks/MessagesProvider";
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
import ChatAddDialog from "./ChatAddDialog";

export default function SideBar() {
  const setChatId = useAppManager((state) => state.setChatId);
  const { conversations } = useConversationsList();
  const { setActiveConversation } = useConversationActions();

  return (
    <Sidebar side="left">
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <h1 className="text-2xl font-bold">NextielChat</h1>
          <MessageCircle className="size-6.5" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupAction>
            <ChatAddDialog />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 mt-3">
              {conversations.map((convo, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    onClick={() =>
                      setChatId({
                        avatar_url: "",
                        id: convo.id,
                        username: convo.title,
                      })
                    }
                  >
                    <Avatar className="size-6">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>
                        {convo.title.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-base">{convo.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Username
                  {/*<ChevronUp className="ml-auto" />*/}
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-(--radix-popper-anchor-width)"
              >
                <DropdownMenuItem>
                  <span className="flex items-center gap-2 p-0.5">
                    <ShuffleIcon className="stroke-white" />
                    Change ID
                  </span>
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="flex items-center gap-2 p-0.5">
                        <Trash className="stroke-destructive" />
                        Clear chats
                      </span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete all your chat history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => {
                          // Qui puoi aggiungere la logica per cancellare le chat
                          console.log("Clearing all chats...");
                          // Esempio: clearAllChats();
                        }}
                      >
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
