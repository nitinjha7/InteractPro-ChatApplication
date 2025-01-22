import React from "react";
import { useStore } from "@/store/store";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2, Phone, Video, MoreVertical, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ChatHeader = () => {
  const { closeChat, selectedChatData } = useStore();
  const imageUrl = selectedChatData?.image
    ? `${import.meta.env.VITE_APP_SERVER_URL}/${selectedChatData.image}`
    : null;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-[70px] border-b border-dark-accent/10 bg-dark-secondary/80 backdrop-blur-xl flex items-center justify-between px-6 relative z-10"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-11 w-11 ring-2 ring-blue-500/20 transition-all duration-300">
            {imageUrl ? (
              <AvatarImage
                src={imageUrl}
                alt="Profile"
                className="object-cover"
              />
            ) : (
              <UserCircle2 className="text-dark-muted" />
            )}
          </Avatar>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-dark-primary" />
        </div>

        <div className="flex flex-col">
          <span className="font-medium text-dark-text">
            {selectedChatData?.firstName && selectedChatData?.lastName
              ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
              : selectedChatData?.email}
          </span>
          <span className="text-sm text-dark-muted">Active now</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-dark-muted hover:text-dark-text hover:bg-dark-accent/20 w-9 h-9 rounded-full"
        >
          <Phone size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-dark-muted hover:text-dark-text hover:bg-dark-accent/20 w-9 h-9 rounded-full"
        >
          <Video size={18} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-dark-muted hover:text-dark-text hover:bg-dark-accent/20 w-9 h-9 rounded-full"
            >
              <MoreVertical size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-dark-secondary/90 backdrop-blur-xl border-dark-accent/10"
          >
            <DropdownMenuItem className="text-dark-text hover:bg-dark-accent/20">
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-dark-text hover:bg-dark-accent/20">
              Search in Conversation
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          className="text-dark-muted hover:text-red-400 hover:bg-red-500/10 w-9 h-9 rounded-full"
          onClick={closeChat}
        >
          <X size={18} />
        </Button>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
