import SideBar from "../component/SideBar";
import ChatBox from "../component/ChatBox";
import NavBar from "../component/NavBar";
import { useOutletContext } from "react-router";

const ChatLayout = ({ chatType }) => {
  const { privateChatName, groupChatName } = useOutletContext();

  const values = {
    private: privateChatName,
    group: groupChatName,
  };

  return (
    <div className="w-full h-dvh flex flex-col">
      <NavBar selected={chatType} />
      <div className="flex-1 flex overflow-hidden">
        {chatType === "global" ? (
          <ChatBox key="global" name="global" />
        ) : (
          <>
            <SideBar chatType={chatType} />
            <ChatBox name={values[chatType]} />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
