import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogOut, Settings, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/store";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ProfileInfo = () => {
  const navigate = useNavigate();
  const userInfo = useStore((s) => s.userInfo);
  const clearUserInfo = useStore((s) => s.clearUserInfo);

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      clearUserInfo();
      navigate("/auth");
    },
  });

  const imageUrl = userInfo?.image ? userInfo.image : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 flex items-center gap-4"
    >
      <motion.div whileHover={{ scale: 1.05 }} className="relative">
        <Avatar className="h-10 w-10 ring-2 ring-primary/30 transition-all duration-300">
          {imageUrl ? (
            <AvatarImage
              src={imageUrl}
              alt="Profile"
              className="object-cover"
            />
          ) : (
            <UserCircle2 className="text-muted-foreground" />
          )}
        </Avatar>
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-card" />
      </motion.div>

      <div className="flex-1 min-w-0">
        <motion.h4
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-medium text-foreground truncate"
        >
          {userInfo?.firstName && userInfo?.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : userInfo?.email}
        </motion.h4>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground truncate"
        >
          Online
        </motion.p>
      </div>

      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                onClick={() => navigate("/profile")}
              >
                <Settings size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                onClick={() => logout.mutate()}
              >
                <LogOut size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Log Out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
};

export default ProfileInfo;
