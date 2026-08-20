import { useState } from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserPlus } from "lucide-react";
import DmDialog from "@/pages/chat-components/contacts-dialog-box";
import { useStore } from "@/store/store";
import type { User } from "@/types";

const NewDm = () => {
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const setSelectedChatData = useStore((s) => s.setSelectedChatData);
  const setSelectedChatType = useStore((s) => s.setSelectedChatType);

  const handleSelectContact = (contact: User) => {
    setSelectedChatData(contact);
    setSelectedChatType("dm");
  };

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenNewContactModal(true)}
              className="p-2 rounded-full hover:bg-secondary transition-colors backdrop-blur-sm"
            >
              <UserPlus size={18} className="text-primary" />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            <p>New Message</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DmDialog
        open={openNewContactModal}
        onOpenChange={setOpenNewContactModal}
        onSelectContact={handleSelectContact}
      />
    </div>
  );
};

export default NewDm;
