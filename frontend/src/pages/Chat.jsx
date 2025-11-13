import { useState } from "react";
import { Outlet } from "react-router-dom";

const Chat = () => {
  const [privateChatName, setPrivateChatName] = useState(null);
  const [groupChatName, setGroupChatName] = useState(null);

  return (
    <div className="w-full h-dvh">
      <Outlet
        context={{
          privateChatName,
          setPrivateChatName,
          groupChatName,
          setGroupChatName,
        }}
      />
    </div>
  );
};

export default Chat;
