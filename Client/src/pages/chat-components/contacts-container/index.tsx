import { useEffect } from "react";
import NewDm from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import { useStore } from "@/store/store";
import { trpc } from "@/lib/trpc";
import DMList from "./components/dm-list/DMList";

import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

const ContactsContainer = () => {
  const setDmContacts = useStore((s) => s.setDmContacts);
  const { data } = trpc.chat.getDmList.useQuery();

  useEffect(() => {
    if (data?.contacts) setDmContacts(data.contacts as never);
  }, [data, setDmContacts]);

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-[320px] bg-card h-full border-r border-border flex flex-col"
    >
      <div className="flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center h-16"
        >
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
        </motion.div>

        <div className="px-4 mb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-3"
          >
            <div className="flex items-center gap-2 text-foreground/80">
              <MessageSquare size={18} className="text-primary" />
              <span className="text-sm font-medium">Direct Messages</span>
            </div>
            <NewDm />
          </motion.div>
          <DMList />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-auto border-t border-border"
      >
        <ProfileInfo />
      </motion.div>
    </motion.div>
  );
};

export default ContactsContainer;
