import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { motion, useAnimate } from "motion/react";
import { SPRING_ANIMATION_TRANSITION } from "../style/animation";

const Chat = ({ socket }) => {
  const [privateChatName, setPrivateChatName] = useState(null);
  const [groupChatName, setGroupChatName] = useState(null);
  const [chatHistory, setChatHistory] = useState({});
  const myUsername = useRef(localStorage.getItem("name"));
  const [slidingBlock, animate] = useAnimate();
  const historyLoaded = useRef({});
  const navigate = useNavigate();

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      let chatKey;

      if (data.messageType === "global") {
        chatKey = "global";
      } else if (data.messageType === "private") {
        const otherUser =
          data.username === myUsername.current
            ? data.recipientId
            : data.username;
        chatKey = `private:${otherUser}`;
      } else if (data.messageType === "group") {
        chatKey = `group:${data.groupId}`;
      }

      if (chatKey) {
        setChatHistory((prev) => {
          const newHistory = { ...prev };
          newHistory[chatKey] = [
            ...(prev[chatKey] || []),
            {
              name: data.username,
              image: data.avatar,
              content: data.content,
              contentType: data.contentType || "text",
              isMe: data.username === myUsername.current,
            },
          ];
          return newHistory;
        });
      }
    };

    // load history message
    const handleMessageHistory = ({ chatKey, messages }) => {
      const formattedMessages = messages.map((msg) => ({
        name: msg.username,
        image: msg.avatar,
        content: msg.content,
        contentType: msg.contentType || "text",
        isMe: msg.username === myUsername.current,
      }));

      setChatHistory((prev) => ({
        ...prev,
        [chatKey]: formattedMessages,
      }));

      // Mark as loaded after receiving the data
      historyLoaded.current[chatKey] = true;
    };

    socket.on("message", handleMessage);
    socket.on("messageHistory", handleMessageHistory);

    return () => {
      socket.off("message", handleMessage);
      socket.off("messageHistory", handleMessageHistory);
    };
  }, [socket]);

  useEffect(() => {
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
  }, []);

  // Function to load history for a specifi cchat - use useCallback to prevent recreation
  const loadChatHistory = useCallback(
    (chatKey, messageType, recipientId, groupId) => {
      if (!socket) return;
      if (historyLoaded.current[chatKey]) return;

      // Mark as loading to prevent duplicate requests
      historyLoaded.current[chatKey] = "loading";

      socket.emit("getMessageHistory", {
        chatKey,
        messageType,
        recipientId,
        groupId,
      });
    },
    [socket]
  );

  const handleOut = async () => {
    if (socket) {
      socket.emit("logout");
    }

    await Promise.all([
      animate(
        slidingBlock.current,
        { scaleX: 1 },
        SPRING_ANIMATION_TRANSITION(1.5)
      ),
    ]);

    localStorage.clear();
    navigate("/");
  };

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
          chatHistory,
          loadChatHistory,
        }}
      />
    </div>
  );
};

export default Chat;
