import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet } from "react-router-dom";

const Chat = ({ socket }) => {
  const [privateChatName, setPrivateChatName] = useState(null);
  const [groupChatName, setGroupChatName] = useState(
    sessionStorage.getItem('selectedGroupId') || null
  );
  const [groupDisplayName, setGroupDisplayName] = useState(
    sessionStorage.getItem('selectedGroupName') || null
  );
  const [chatHistory, setChatHistory] = useState({});
  const myUsername = useRef(localStorage.getItem('name'));
  const historyLoaded = useRef({});
  const groupsData = useRef({});

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
            content: data.content || data.message, // Fallback for old messages
            contentType: data.contentType || 'text', // Default to text
            message: data.message, // Keep for backward compatibility
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
        content: msg.content || msg.message, // Fallback for old messages
        contentType: msg.contentType || 'text', // Default to text
        message: msg.message, // Keep for backward compatibility
        isMe: msg.username === myUsername.current
      }));
      
      setChatHistory(prev => ({
        ...prev,
        [chatKey]: formattedMessages
      }));
      
      // Mark as loaded after receiving the data
      historyLoaded.current[chatKey] = true;
    };

    // Listen for groups list to store group names
    const handleGroupsList = (groups) => {
      groups.forEach(group => {
        groupsData.current[group.id] = group.name;
      });
    };

    socket.on('message', handleMessage);
    socket.on('messageHistory', handleMessageHistory);
    socket.on('groupsList', handleGroupsList);
    
    return () => {
      socket.off('message', handleMessage);
      socket.off('messageHistory', handleMessageHistory);
      socket.off('groupsList', handleGroupsList);
    };
  }, [socket]);

  // Update group display name when groupChatName changes
  useEffect(() => {
    if (groupChatName && groupsData.current[groupChatName]) {
      const displayName = groupsData.current[groupChatName];
      setGroupDisplayName(displayName);
      // Persist to sessionStorage
      sessionStorage.setItem('selectedGroupId', groupChatName);
      sessionStorage.setItem('selectedGroupName', displayName);
    }
  }, [groupChatName]);

  // Clear group selection from sessionStorage when switching away from group chat
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Keep the selection on refresh
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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
          groupDisplayName,
          chatHistory,
          loadChatHistory,
        }}
      />
    </div>
  );
};

export default Chat;
