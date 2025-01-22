import React, { useEffect } from 'react'
import { useStore } from '@/store/store'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ContactsContainer from './chat-components/contacts-container';
import EmptyChatContainer from './chat-components/empty-chat-container';
import ChatContainer from './chat-components/chat-container';

const Chat = () => {
  const { userInfo, selectedChatType } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if(!userInfo.profileSetup){
      toast.warning('Please complete profile to continue');
      navigate('/profile');
    }
  }, [userInfo, navigate]);

  return (
    <div className='flex justify-between'>
      <ContactsContainer />
      {
        selectedChatType === undefined ? <EmptyChatContainer /> : <ChatContainer />
      }
    </div>
  );
}

export default Chat