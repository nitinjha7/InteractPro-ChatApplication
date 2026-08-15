import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useStore } from '@/store/store';
import ContactsContainer from './chat-components/contacts-container';
import EmptyChatContainer from './chat-components/empty-chat-container';
import ChatContainer from './chat-components/chat-container';

const Chat = () => {
  const userInfo = useStore((s) => s.userInfo);
  const selectedChatType = useStore((s) => s.selectedChatType);
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo && !userInfo.profileSetup) {
      toast.warning('Please complete profile to continue');
      navigate('/profile');
    }
  }, [userInfo, navigate]);

  return (
    <div className="flex justify-between">
      <ContactsContainer />
      {selectedChatType === undefined ? <EmptyChatContainer /> : <ChatContainer />}
    </div>
  );
};

export default Chat;
