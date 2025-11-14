import SideBar from "../component/SideBar";
import ChatBox from "../component/ChatBox";
import NavBar from "../component/NavBar";
import { useOutletContext } from "react-router";
import { useEffect } from "react";

const ChatLayout = ({ chatType, socket }) => {
  const { privateChatName, groupChatName, chatHistory, loadChatHistory } = useOutletContext();

  const values = {
    private: privateChatName,
    group: groupChatName,
  };

  // Get chat key for storing messages
  const getChatKey = () => {
    if (chatType === 'global') return 'global';
    if (chatType === 'private') return `private:${privateChatName}`;
    if (chatType === 'group') return `group:${groupChatName}`;
    return chatType;
  };

  const currentChatKey = getChatKey();
  const currentMessages = chatHistory[currentChatKey] || [];

  // Load history when chat changes
  useEffect(() => {
    if (chatType === 'global') {
      loadChatHistory('global', 'global');
    } else if (chatType === 'private' && privateChatName) {
      loadChatHistory(`private:${privateChatName}`, 'private', privateChatName);
    } else if (chatType === 'group' && groupChatName) {
      loadChatHistory(`group:${groupChatName}`, 'group', null, groupChatName);
    }
  }, [chatType, privateChatName, groupChatName, loadChatHistory]);

  return (
    <div className="w-full h-dvh flex flex-col">
      <NavBar selected={chatType} />
      <div className="flex-1 flex overflow-hidden">
        {chatType === "global" ? (
          <ChatBox 
            key="global" 
            name="global" 
            socket={socket} 
            chatType="global"
            messages={currentMessages}
          />
        ) : (
          <>
            <SideBar chatType={chatType} socket={socket} />
            {values[chatType] ? (
              <ChatBox 
                key={currentChatKey}
                name={values[chatType]} 
                socket={socket} 
                chatType={chatType} 
                roomId={values[chatType]}
                messages={currentMessages}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-4xl text-gray-400">
                Select user to start chatting
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
