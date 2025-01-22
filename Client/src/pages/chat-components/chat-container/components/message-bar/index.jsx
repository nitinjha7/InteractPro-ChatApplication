import React, { useEffect, useRef, useState } from "react";
import { Smile, Paperclip, Send, Image, Mic } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useStore } from "@/store/store";
import { useSocket } from "@/context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MessageBar = () => {
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [message, setMessage] = useState("");
  const emojiPickerRef = useRef(null);
  const { selectedChatType, selectedChatData, userInfo } = useStore();
  const socket = useSocket();
  const fileInputRef = useRef();

  const handleEmojiClick = (emojiData) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  const handleClickOutside = (e) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
      setEmojiPickerOpen(false);
    }
  };

  const handleSendMessage = () => {
    if (socket && message.trim() !== "") {
      socket.emit("sendMessage", {
        sender: userInfo._id,
        recipient: selectedChatData._id,
        content: message.trim(),
        messageType: "text",
        fileUrl: undefined,
      });
      setMessage("");
    }
  };

  const handleFileInputClick = (event) => {
    console.log(event.target.files[0]);
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="p-4 bg-dark-secondary/80 backdrop-blur-xl border-t border-dark-accent/10 relative z-10"
    >
      <div className="flex items-center gap-2 bg-dark-accent/20 rounded-xl p-2">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-dark-muted hover:text-dark-text hover:bg-dark-accent/30 w-9 h-9 rounded-full"
            onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
          >
            <Smile size={20} />
          </Button>
          <div className="absolute bottom-12 left-0" ref={emojiPickerRef}>
            <AnimatePresence>
              {emojiPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <EmojiPicker
                    theme="dark"
                    onEmojiClick={handleEmojiClick}
                    autoFocusSearch={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-dark-muted hover:text-dark-text hover:bg-dark-accent/30 w-9 h-9 rounded-full"
        >
          <Image size={20} />
        </Button>

        <Input type="file" className="hidden" ref={fileInputRef} onChange={handleFileInputClick} />
        <Button
          variant="ghost"
          size="icon"
          className="text-dark-muted hover:text-dark-text hover:bg-dark-accent/30 w-9 h-9 rounded-full"
          onClick = {() => fileInputRef.current.click()}
        >
          <Paperclip size={20} />
        </Button>

        <Input
          type="text"
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-0 text-dark-text placeholder:text-dark-muted focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />

        <Button
          variant="ghost"
          size="icon"
          className="text-dark-muted hover:text-dark-text hover:bg-dark-accent/30 w-9 h-9 rounded-full"
        >
          <Mic size={20} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`w-9 h-9 rounded-full ${
            message.trim()
              ? "text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
              : "text-dark-muted hover:bg-dark-accent/30"
          }`}
          onClick={handleSendMessage}
          disabled={!message.trim()}
        >
          <Send size={20} />
        </Button>
      </div>
    </motion.div>
  );
};

export default MessageBar;
