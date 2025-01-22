import React, { useEffect, useRef } from "react";
import moment from "moment";
import { useStore } from "@/store/store";
import apiClient from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";

const MessageContainer = () => {
  const scrollRef = useRef();
  const {
    selectedChatData,
    userInfo,
    selectedChatType,
    selectedChatMessages,
    setSelectedChatMessages,
  } = useStore();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
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
    if (selectedChatData) {
      if (selectedChatType == "dm") {
        getMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timeStamp).format("DD-MM-YYYY");
      const showDate = lastDate !== messageDate;
      lastDate = messageDate;

      const isSender = message.sender === userInfo._id;

      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          {showDate && (
            <div className="sticky top-0 bg-dark-accent/20 text-dark-muted py-1.5 px-4 text-center text-xs rounded-full my-4 backdrop-blur-sm z-10">
              {messageDate}
            </div>
          )}
          <div
            className={`flex ${
              isSender ? "justify-end" : "justify-start"
            } w-full my-1`}
          >
            <div
              className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                isSender
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                  : "bg-dark-accent/30 text-dark-text backdrop-blur-sm"
              } transition-all duration-200 hover:shadow-lg`}
            >
              {message.messageType === "text" && (
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
    <div className="flex-1 bg-transparent text-dark-text flex flex-col p-6 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col space-y-2">
        {renderMessages()}
        <div ref={scrollRef}></div>
      </div>
    </div>
  );
};

export default MessageContainer;