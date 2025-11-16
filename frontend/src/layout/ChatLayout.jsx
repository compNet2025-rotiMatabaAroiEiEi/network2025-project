import SideBar from "../component/SideBar";
import ChatBox from "../component/ChatBox";
import NavBar from "../component/NavBar";
import { useOutletContext } from "react-router";
import { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { SPRING_ANIMATION_TRANSITION } from "../style/animation";

const ChatLayout = ({ chatType, socket }) => {
  const { privateChatName, groupChatName, chatHistory, loadChatHistory } =
    useOutletContext();

  const values = {
    private: privateChatName,
    group: groupChatName,
  };

  // Get chat key for storing messages
  const getChatKey = () => {
    if (chatType === "global") return "global";
    if (chatType === "private") return `private:${privateChatName}`;
    if (chatType === "group") return `group:${groupChatName}`;
    return chatType;
  };

  // Get display text for chat
  const getDisplayText = () => {
    if (chatType === "global") return "No messages yet";
    if (chatType === "private") return "Select user to start chatting";
    if (chatType === "group")
      return "Select or create a group to start chatting";
  };

  const currentChatKey = getChatKey();
  const currentMessages = chatHistory[currentChatKey] || [];

  // Load history when chat changes
  useEffect(() => {
    if (chatType === "global") {
      loadChatHistory("global", "global");
    } else if (chatType === "private" && privateChatName) {
      loadChatHistory(`private:${privateChatName}`, "private", privateChatName);
    } else if (chatType === "group" && groupChatName) {
      loadChatHistory(`group:${groupChatName}`, "group", null, groupChatName);
    }
  }, [chatType, privateChatName, groupChatName, loadChatHistory]);

  return (
    <div className="w-full h-dvh flex flex-col">
      <NavBar selected={chatType} />
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="popLayout">
          {chatType !== "global" && (
            <SideBar
              key="sidebar"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={SPRING_ANIMATION_TRANSITION()}
              chatType={chatType}
              socket={socket}
            />
          )}
        </AnimatePresence>
        {chatType === "global" || values[chatType] ? (
          <ChatBox
            key={currentChatKey}
            name={values[chatType] || "global"}
            socket={socket}
            chatType={chatType}
            roomId={values[chatType] || "global"}
            messages={currentMessages}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-4xl">
            {getDisplayText()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
