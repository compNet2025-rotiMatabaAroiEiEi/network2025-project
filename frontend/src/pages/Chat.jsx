import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet } from "react-router-dom";

const Chat = ({ socket }) => {
  const [privateChatName, setPrivateChatName] = useState(null);
  const [groupChatName, setGroupChatName] = useState(null);
  const [chatHistory, setChatHistory] = useState({});
  const myUsername = useRef(localStorage.getItem('name'));
  const historyLoaded = useRef({});

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      let chatKey;
      
      // Determine which chat this message belongs to based on messageType
      if (data.messageType === 'global') {
        chatKey = 'global';
      } else if (data.messageType === 'private') {
        // For private messages, use the other person's username
        const otherUser = data.username === myUsername.current 
          ? data.recipientId 
          : data.username;
        chatKey = `private:${otherUser}`;
      } else if (data.messageType === 'group') {
        chatKey = `group:${data.groupId}`;
      }

      if (chatKey) {
        setChatHistory(prev => {
          const newHistory = { ...prev };
          newHistory[chatKey] = [...(prev[chatKey] || []), {
            name: data.username,
            image: data.avatar,
            message: data.message,
            isMe: data.username === myUsername.current
          }];
          return newHistory;
        });
      }
    };

    // Listen for message history from backend
    const handleMessageHistory = ({ chatKey, messages }) => {
      const formattedMessages = messages.map(msg => ({
        name: msg.username,
        image: msg.avatar,
        message: msg.message,
        isMe: msg.username === myUsername.current
      }));
      
      setChatHistory(prev => ({
        ...prev,
        [chatKey]: formattedMessages
      }));
      
      // Mark as loaded after receiving the data
      historyLoaded.current[chatKey] = true;
    };

    socket.on('message', handleMessage);
    socket.on('messageHistory', handleMessageHistory);
    
    return () => {
      socket.off('message', handleMessage);
      socket.off('messageHistory', handleMessageHistory);
    };
  }, [socket]);

  // Function to load history for a specific chat - use useCallback to prevent recreation
  const loadChatHistory = useCallback((chatKey, messageType, recipientId, groupId) => {
    if (!socket) return;
    if (historyLoaded.current[chatKey]) return;
    
    // Mark as loading to prevent duplicate requests
    historyLoaded.current[chatKey] = 'loading';
    
    socket.emit('getMessageHistory', {
      chatKey,
      messageType,
      recipientId,
      groupId
    });
  }, [socket]);

  return (
    <div className="w-full h-dvh">
      <Outlet
        context={{
          privateChatName,
          setPrivateChatName,
          groupChatName,
          setGroupChatName,
          chatHistory,
          loadChatHistory,
        }}
      />
    </div>
  );
};

export default Chat;
