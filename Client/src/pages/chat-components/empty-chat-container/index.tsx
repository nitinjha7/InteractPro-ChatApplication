import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Code, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DmDialog from "@/pages/chat-components/contacts-dialog-box";
import { useStore } from "@/store/store";
import type { User } from "@/types";

const EmptyChatContainer = () => {
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const setSelectedChatData = useStore((s) => s.setSelectedChatData);
  const setSelectedChatType = useStore((s) => s.setSelectedChatType);

  const handleSelectContact = (contact: User) => {
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
            className="bg-warning text-warning-foreground text-xs font-semibold px-2 py-1 rounded-md"
          >
            Coming Soon
          </motion.span>
        </span>
      ),
      description: "AI-powered suggestions and automated responses",
    },
  ];

  return (
    <div className="w-full h-screen bg-background text-foreground overflow-hidden">
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
              className="text-5xl md:text-6xl font-bold tracking-tight text-foreground"
            >
              Welcome to DevChat
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground"
            >
              Start a conversation, connect with others, and experience
              communication reimagined
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                size="lg"
                className="gap-2"
                onClick={() => setOpenNewContactModal(true)}
              >
                Start Chatting
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
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
                className="bg-card backdrop-blur-sm p-6 rounded-xl border border-border hover:border-primary/50 transition-colors duration-200"
              >
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
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
