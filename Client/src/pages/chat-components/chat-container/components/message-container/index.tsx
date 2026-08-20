import { useEffect, useRef, useState } from "react";
import moment from "moment";
import { useStore } from "@/store/store";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/themes/prism-tomorrow.css";
import type { Message } from "@/types";

const MessageContainer = () => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const selectedChatData = useStore((s) => s.selectedChatData);
  const userInfo = useStore((s) => s.userInfo);
  const selectedChatType = useStore((s) => s.selectedChatType);
  const selectedChatMessages = useStore((s) => s.selectedChatMessages);
  const setSelectedChatMessages = useStore((s) => s.setSelectedChatMessages);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChatMessages]);

  const { data } = trpc.chat.getMessages.useQuery(
    { contactId: selectedChatData?.id ?? "" },
    { enabled: !!selectedChatData && selectedChatType === "dm" }
  );

  useEffect(() => {
    if (data?.chat) setSelectedChatMessages(data.chat as never);
  }, [data, setSelectedChatMessages]);

  const handleCopy = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);

    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  const renderMessages = () => {
    let lastDate: string | null = null;
    return selectedChatMessages.map((message: Message, index: number) => {
      const messageDate = moment(message.timeStamp).format("DD-MM-YYYY");
      const showDate = lastDate !== messageDate;
      lastDate = messageDate;

      const isSender = message.sender === userInfo?.id;
      const isCopied = copiedMessageId === message.id;

      return (
        <motion.div
          key={message.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center"
        >
          {showDate && (
            <div className="sticky top-2 bg-secondary text-muted-foreground py-1.5 px-4 text-center text-xs rounded-full my-4 backdrop-blur-sm z-10 w-fit">
              {messageDate}
            </div>
          )}
          <div
            className={`flex ${
              isSender ? "justify-end" : "justify-start"
            } w-full my-1`}
          >
            <div
              className={`relative max-w-[70%] px-4 py-2.5 ${
                message.messageType === "code"
                  ? "font-mono bg-secondary border border-border rounded-lg"
                  : isSender
                  ? "rounded-2xl bg-primary text-primary-foreground"
                  : "rounded-2xl bg-card text-card-foreground border border-border"
              } transition-all duration-200 hover:shadow-lg`}
            >
              {message.messageType === "code" ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {message.language}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => handleCopy(message.id, message.content ?? "")}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Copy
                      </button>
                      {isCopied && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-card text-card-foreground border border-border text-xs px-2 py-1 rounded-md">
                          Copied!
                        </div>
                      )}
                    </div>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    <code
                      dangerouslySetInnerHTML={{
                        __html: highlight(
                          message.content ?? "",
                          (languages[message.language || "javascript"] || languages.javascript)!,
                          message.language || "javascript"
                        ),
                      }}
                    />
                  </pre>
                </div>
              ) : (
                <p className="text-sm break-words leading-relaxed">
                  {message.content}
                </p>
              )}
              <span
                className={`block text-right text-xs mt-1 ${
                  message.messageType !== "code" && isSender
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                {moment(message.timeStamp).format("HH:mm")}
              </span>
            </div>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-transparent text-foreground flex flex-col p-6 overflow-y-auto custom-scrollbar"
    >
      <div className="flex flex-col space-y-2 min-h-0">
        {renderMessages()}
        <div ref={messagesEndRef} className="h-0" />
      </div>
    </div>
  );
};

export default MessageContainer;
