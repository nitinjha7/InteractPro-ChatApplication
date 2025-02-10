import React from 'react'
import ChatHeader from './components/chat-header'
import MessageContainer from './components/message-container'
import MessageBar from './components/message-bar'

const ChatContainer = () => {
  return (
    <div className="flex-1 h-[100vh] bg-dark-primary flex flex-col relative overflow-hidden">
      {/* Modern gradient background with subtle patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(147,51,234,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.8),rgba(24,24,27,0.9))]" />

      {/* Content */}
      <div className="relative flex flex-col h-full z-10">
        <ChatHeader />
        <MessageContainer />
        <MessageBar />
      </div>
    </div>
  );
};

export default ChatContainer;