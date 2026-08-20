import { useEffect, useRef, useState } from "react";
import { Smile, Paperclip, Send, Image, Mic, Code } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { toast } from "sonner";
import { useStore } from "@/store/store";
import { useSocket } from "@/context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
// Ensure that Prism’s dependencies load in proper order:
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-go";
import "prismjs/themes/prism-tomorrow.css";

const MessageBar = () => {
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedChatData = useStore((s) => s.selectedChatData);
  const userInfo = useStore((s) => s.userInfo);
  const socket = useSocket();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const languageOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "go", label: "Go" },
  ];

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
      setEmojiPickerOpen(false);
    }
  };

  const handleSendMessage = () => {
    if (socket && message.trim() !== "" && selectedChatData && userInfo) {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        recipient: selectedChatData.id,
        content: message.trim(),
        messageType: isCodeMode ? "code" : "text",
        language: isCodeMode ? language : undefined,
      });
      setMessage("");
      setIsCodeMode(false);
    }
  };

  const toggleCodeMode = () => {
    setIsCodeMode(!isCodeMode);
    if (!isCodeMode) {
      setMessage(""); // Clear message when entering code mode
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-scroll the code editor container when message (code) changes
  useEffect(() => {
    if (isCodeMode && editorContainerRef.current) {
      editorContainerRef.current.scrollTop =
        editorContainerRef.current.scrollHeight;
    }
  }, [message, isCodeMode]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="p-4 bg-card/95 backdrop-blur-xl border-t border-border relative z-10"
    >
      <div className="flex flex-col gap-2">
        {isCodeMode && (
          <div className="flex items-center gap-2 bg-secondary rounded-t-xl p-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-background text-foreground text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              {languageOptions.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">Code Mode</span>
          </div>
        )}

        <div className="flex items-center gap-2 bg-secondary rounded-xl p-2">
          <div className="flex items-center gap-1">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-accent/15 w-9 h-9 rounded-lg"
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
                      className="shadow-2xl"
                    >
                      <EmojiPicker
                        theme={"dark" as never}
                        onEmojiClick={handleEmojiClick}
                        autoFocusSearch={false}
                        skinTonesDisabled
                        searchDisabled
                        previewConfig={{ showPreview: false }}
                        width={320}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={`text-muted-foreground hover:text-foreground w-9 h-9 rounded-lg ${
                isCodeMode ? "bg-primary/10 text-primary" : ""
              }`}
              onClick={toggleCodeMode}
            >
              <Code size={20} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent/15 w-9 h-9 rounded-lg"
            >
              <Image size={20} />
            </Button>

            <Input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={() => toast.info('File attachments are coming soon')}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent/15 w-9 h-9 rounded-lg"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={20} />
            </Button>
          </div>

          <div className="flex-1">
            {isCodeMode ? (
              // Wrap the Editor in a container with a ref and overflow auto
              <div
                ref={editorContainerRef}
                style={{
                  overflowY: "auto",
                  maxHeight: "200px",
                  minHeight: "60px",
                }}
                className="w-full bg-background rounded-lg"
              >
                <Editor
                  value={message}
                  onValueChange={setMessage}
                  highlight={(code: string) => highlight(code, (languages[language] || languages.javascript)!, language)}
                  padding={12}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "14px",
                    lineHeight: "1.5",
                    color: "hsl(var(--foreground))",
                  }}
                  textareaClassName="focus:outline-none custom-scrollbar"
                  preClassName={`language-${language} custom-scrollbar`}
                />
              </div>
            ) : (
              <Input
                type="text"
                placeholder="Type a message..."
                className="w-full bg-background border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/20 rounded-lg py-2.5"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSendMessage()
                }
              />
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent/15 w-9 h-9 rounded-lg"
            >
              <Mic size={20} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`w-9 h-9 rounded-lg ${
                message.trim()
                  ? "text-primary hover:text-primary hover:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/15"
              }`}
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBar;
