import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { motion, useAnimate } from "motion/react";
import { SPRING_ANIMATION_TRANSITION } from "../style/animation";

const Chat = ({ socket }) => {
  const [privateChatName, setPrivateChatName] = useState(null);
  const [groupChatName, setGroupChatName] = useState(
    sessionStorage.getItem('selectedGroupId') || null
  );
  const [groupDisplayName, setGroupDisplayName] = useState(
    sessionStorage.getItem('selectedGroupName') || null
  );
  const [slidingBlock, animate] = useAnimate();
  const [chatHistory, setChatHistory] = useState({});
  const myUsername = useRef(localStorage.getItem('name'));
  const navigate = useNavigate();
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

    // Listen for groups list to store group names
    const handleGroupsList = (groups) => {
      groups.forEach(group => {
        groupsData.current[group.id] = group.name;
      });
    };

    // Listen for user online/offline events
    const handleUserOnline = (data) => {
      console.log(`${data.username} came online`);
      // You can show a notification here
    };

    const handleUserOffline = (data) => {
      console.log(`${data.username} went offline`);
      // You can show a notification here
    };

    socket.on('message', handleMessage);
    socket.on('messageHistory', handleMessageHistory);
    socket.on('groupsList', handleGroupsList);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    
    return () => {
      socket.off('message', handleMessage);
      socket.off('messageHistory', handleMessageHistory);
      socket.off('groupsList', handleGroupsList);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
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

    const loadElement = async () => {
      await Promise.all([
        animate(
          slidingBlock.current,
          { scaleX: 0 },
          SPRING_ANIMATION_TRANSITION(1.5)
        ),
      ]);
    };

    loadElement();
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleOut = async () => {
    // Emit logout event to server
    if (socket) {
      socket.emit('logout');
    }

    await Promise.all([
      animate(
        slidingBlock.current,
        { scaleX: 1 },
        SPRING_ANIMATION_TRANSITION(1.5)
      ),
    ]);

    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

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
      <motion.div
        ref={slidingBlock}
        className="absolute top-0 left-0 h-full w-full bg-(--red-color-tier3) origin-left z-30"
      />
      <Outlet
        context={{
          handleOut,
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
