import { motion } from "framer-motion";
import { useStore } from "@/store/store";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DmContact } from "@/types";

const DMList = () => {
  const selectedChatData = useStore((s) => s.selectedChatData);
  const setSelectedChatData = useStore((s) => s.setSelectedChatData);
  const setSelectedChatMessages = useStore((s) => s.setSelectedChatMessages);
  const setSelectedChatType = useStore((s) => s.setSelectedChatType);
  const dmContacts = useStore((s) => s.dmContacts);

  const handleClick = (contact: DmContact) => {
    if (selectedChatData && selectedChatData.id !== contact.id) {
      setSelectedChatMessages([]);
    }
    setSelectedChatData(contact);
    setSelectedChatType("dm");
  };

  return (
    <div className="space-y-1">
      {dmContacts.map((contact: DmContact, index: number) => {
        const imageUrl = contact.image ? contact.image : null;
        const isSelected = selectedChatData?.id === contact.id;

        return (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all",
              "hover:bg-secondary group",
              isSelected && "bg-secondary hover:bg-secondary"
            )}
            onClick={() => handleClick(contact)}
          >
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-border transition-transform group-hover:scale-105">
                {imageUrl ? (
                  <AvatarImage
                    src={imageUrl}
                    alt={`${contact.firstName || ""} ${
                      contact.lastName || "User"
                    }`}
                  />
                ) : (
                  <UserCircle2 className="text-muted-foreground" />
                )}
              </Avatar>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-card" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {contact.firstName && contact.lastName
                  ? `${contact.firstName} ${contact.lastName}`
                  : contact.email}
              </h4>
              <p className="text-sm text-muted-foreground truncate">Available</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DMList;
