import React from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/store";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DMList = () => {
  const {
    selectedChatData,
    setSelectedChatData,
    dmContacts,
    setSelectedChatMessage,
    setSelectedChatType,
  } = useStore();

  const handleClick = (contact) => {
    setSelectedChatData(contact);
    setSelectedChatType("dm");
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessage([]);
    }
  };

  return (
    <div className="space-y-1">
      {dmContacts.map((contact, index) => {
        const imageUrl = contact.image
          ? `${import.meta.env.VITE_APP_SERVER_URL}/${contact.image}`
          : null;
        const isSelected = selectedChatData?._id === contact._id;

        return (
          <motion.div
            key={contact._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all",
              "hover:bg-dark-accent/30 group backdrop-blur-sm",
              isSelected &&
                "bg-dark-accent/40 hover:bg-dark-accent/40 shadow-inner-glow"
            )}
            onClick={() => handleClick(contact)}
          >
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-dark-accent/30 transition-transform group-hover:scale-105">
                {imageUrl ? (
                  <AvatarImage
                    src={imageUrl}
                    alt={`${contact.firstName || ""} ${
                      contact.lastName || "User"
                    }`}
                  />
                ) : (
                  <UserCircle2 className="text-dark-muted" />
                )}
              </Avatar>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-dark-primary shadow-glow" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-dark-text truncate group-hover:text-blue-400 transition-colors">
                {contact.firstName && contact.lastName
                  ? `${contact.firstName} ${contact.lastName}`
                  : contact.email}
              </h4>
              <p className="text-sm text-dark-muted truncate">
                {contact.status || "Available"}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DMList;
