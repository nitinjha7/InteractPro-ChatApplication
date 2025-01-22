import React from "react";
import NewDm from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import apiClient from "@/lib/apiClient";
import { useEffect } from "react";
import { useStore } from "@/store/store";
import DMList from "./components/dm-list/DMList";

import { motion } from "framer-motion";
import { MessageSquare, Users } from "lucide-react";

const ContactsContainer = () => {
  const { dmContacts, setDmContacts } = useStore();

  useEffect(() => {
    const getDMContacts = async () => {
      try {
        const response = await apiClient.get("/api/contact/get-dm-list", {
          withCredentials: true,
        });
        if (response.data.contacts) {
          setDmContacts(response.data.contacts);
        }
      } catch (error) {
        console.error("Error in getDMContacts:", error);
      }
    };
    getDMContacts();
  }, []);

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-[280px] bg-dark-primary h-screen border-r border-dark-accent/30 backdrop-blur-sm shadow-glow flex flex-col"
    >
      <div className="flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center h-16"
        >
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 text-transparent bg-clip-text">
            Messages
          </h1>
        </motion.div>

        <div className="px-4 mb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-3"
          >
            <div className="flex items-center gap-2 text-dark-text/80">
              <MessageSquare size={18} className="text-blue-500" />
              <span className="text-sm font-medium">Direct Messages</span>
            </div>
            <NewDm />
          </motion.div>
          <DMList />
        </div>

        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="px-4 mb-4"
        >
          <div className="flex items-center gap-2 text-dark-text/80 mb-3">
            <Users size={18} className="text-violet-500" />
            <span className="text-sm font-medium">Channels</span>
          </div>
        </motion.div> */}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-auto border-t border-dark-accent/30 bg-dark-accent/5 backdrop-blur-sm"
      >
        <ProfileInfo />
      </motion.div>
    </motion.div>
  );
};

export default ContactsContainer;
