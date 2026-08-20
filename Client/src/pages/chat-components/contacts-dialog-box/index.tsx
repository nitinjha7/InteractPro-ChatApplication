import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import type { User } from "@/types";

const DmDialog = ({
  open,
  onOpenChange,
  onSelectContact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectContact: (contact: User) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data } = trpc.chat.searchContacts.useQuery({ searchTerm }, { enabled: open });
  const searchedContacts = (data?.contacts ?? []) as User[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border sm:max-w-[425px] animate-fadeIn backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Plus size={20} className="text-primary" />
            New Message
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            className="pl-10 bg-secondary border-border placeholder:text-muted-foreground"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="mt-4 max-h-[300px] pr-4">
          <AnimatePresence>
            {searchedContacts.map((contact: User, index: number) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  onSelectContact(contact);
                  onOpenChange(false);
                  setSearchTerm("");
                }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer group transition-colors backdrop-blur-sm"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {contact.firstName && contact.lastName
                      ? `${contact.firstName} ${contact.lastName}`
                      : "No Name"}
                  </h4>
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                </div>
                <Plus
                  size={18}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {searchedContacts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Search size={48} className="mx-auto mb-3 opacity-50" />
              <p>No users found</p>
            </motion.div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DmDialog;
