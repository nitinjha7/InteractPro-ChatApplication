import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Code, Zap, ArrowRight } from "lucide-react";
import DmDialog from "@/pages/chat-components/contacts-dialog-box/index.jsx";
import { useStore } from "@/store/store";

const EmptyChatContainer = () => {
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const { setSelectedChatData, setSelectedChatType } = useStore();

  const handleSelectContact = (contact) => {
    setSelectedChatData(contact);
    setSelectedChatType("dm");
  };

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Real-time Messaging",
      description: "Experience instant communication with zero lag",
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Code Snippet Sharing",
      description: "Send and receive code snippets directly in the chat",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: (
        <span className="flex items-center gap-2">
          Smart Features
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 1 }}
            className="bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-md"
          >
            Coming Soon
          </motion.span>
        </span>
      ),
      description: "AI-powered suggestions and automated responses",
    },
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center h-full space-y-12"
        >
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold tracking-tight"
            >
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-500 to-violet-500 text-transparent bg-clip-text">
                InteractPro
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-400"
            >
              Start a conversation, connect with others, and experience
              communication reimagined
            </motion.p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              onClick={() => setOpenNewContactModal(true)}
            >
              Start Chatting
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.2 }}
                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-colors duration-200"
              >
                <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <DmDialog
        open={openNewContactModal}
        onOpenChange={setOpenNewContactModal}
        onSelectContact={handleSelectContact}
      />
    </div>
  );
};

export default EmptyChatContainer;
