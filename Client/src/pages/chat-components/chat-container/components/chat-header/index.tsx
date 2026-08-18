import { useState } from "react";
import { useStore } from "@/store/store";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2, Phone, Video, MoreVertical, X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AskPanel from "@/components/ai/AskPanel";

const ChatHeader = () => {
  const closeChat = useStore((s) => s.closeChat);
  const selectedChatData = useStore((s) => s.selectedChatData);
  const imageUrl = selectedChatData?.image ? selectedChatData.image : null;
  const [askOpen, setAskOpen] = useState(false);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative h-[70px] border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-11 w-11 ring-2 ring-primary/20 transition-all duration-300">
            {imageUrl ? (
              <AvatarImage
                src={imageUrl}
                alt="Profile"
                className="object-cover"
              />
            ) : (
              <UserCircle2 className="text-muted-foreground" />
            )}
          </Avatar>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-card" />
        </div>

        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {selectedChatData?.firstName && selectedChatData?.lastName
              ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
              : selectedChatData?.email}
          </span>
          <span className="text-sm text-muted-foreground">Active now</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setAskOpen((v) => !v)}
          title="Ask your chat history"
          className="text-muted-foreground hover:text-primary hover:bg-secondary w-9 h-9 rounded-full"
        >
          <Sparkles size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-secondary w-9 h-9 rounded-full"
        >
          <Phone size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-secondary w-9 h-9 rounded-full"
        >
          <Video size={18} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary w-9 h-9 rounded-full"
            >
              <MoreVertical size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-popover backdrop-blur-xl border-border"
          >
            <DropdownMenuItem className="text-foreground hover:bg-secondary">
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-foreground hover:bg-secondary">
              Search in Conversation
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive hover:bg-destructive/10">
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-9 h-9 rounded-full"
          onClick={closeChat}
        >
          <X size={18} />
        </Button>
      </div>

      <AskPanel open={askOpen} onClose={() => setAskOpen(false)} />
    </motion.div>
  );
};

export default ChatHeader;
