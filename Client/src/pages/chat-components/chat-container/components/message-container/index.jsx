import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { useStore } from "@/store/store";
import apiClient from "@/lib/apiClient";
import { motion } from "framer-motion";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/themes/prism-tomorrow.css";

const MessageContainer = () => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null); // Track copied message ID
  const {
    selectedChatData,
    userInfo,
    selectedChatType,
    selectedChatMessages,
    setSelectedChatMessages,
  } = useStore();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChatMessages]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await apiClient.post(
          "/api/message/get-messages",
          { id: selectedChatData._id },
          { withCredentials: true }
        );
        if (res.data.chat) {
          setSelectedChatMessages(res.data.chat);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (selectedChatData && selectedChatType === "dm") {
      getMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  const handleCopy = (messageId, content) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);

    // Remove the copied status after 2 seconds
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timeStamp).format("DD-MM-YYYY");
      const showDate = lastDate !== messageDate;
      lastDate = messageDate;

      const isSender = message.sender === userInfo._id;
      const isCopied = copiedMessageId === message._id; // Check if the message is copied

      return (
        <motion.div
          key={message._id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center"
        >
          {showDate && (
            <div className="sticky top-2 bg-dark-accent/20 text-dark-muted py-1.5 px-4 text-center text-xs rounded-full my-4 backdrop-blur-sm z-10 w-fit">
              {messageDate}
            </div>
          )}
          <div
            className={`flex ${
              isSender ? "justify-end" : "justify-start"
            } w-full my-1`}
          >
            <div
              className={`relative max-w-[70%] px-4 py-2.5 rounded-2xl ${
                isSender
                  ? message.messageType === "code"
                    ? "bg-[#1E1E1E] text-white"
                    : "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                  : message.messageType === "code"
                  ? "bg-[#1E1E1E] text-white"
                  : "bg-dark-accent/30 text-dark-text backdrop-blur-sm"
              } transition-all duration-200 hover:shadow-lg`}
            >
              {message.messageType === "code" ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {message.language}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => handleCopy(message._id, message.content)}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        Copy
                      </button>
                      {isCopied && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded-md">
                          Copied!
                        </div>
                      )}
                    </div>
                  </div>
                  <pre className="text-sm font-mono overflow-x-auto">
                    <code
                      dangerouslySetInnerHTML={{
                        __html: highlight(
                          message.content,
                          languages[message.language || "javascript"],
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
              <span className="block text-right text-xs opacity-70 mt-1">
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
      className="flex-1 bg-transparent text-dark-text flex flex-col p-6 overflow-y-auto custom-scrollbar"
    >
      <div className="flex flex-col space-y-2 min-h-0">
        {renderMessages()}
        <div ref={messagesEndRef} className="h-0" />
      </div>
    </div>
  );
};

export default MessageContainer;
