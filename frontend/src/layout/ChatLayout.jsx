import SideBar from "../component/SideBar";
import ChatBox from "../component/ChatBox";
import NavBar from "../component/NavBar";

const ChatLayout = ({ chatType }) => {
  return (
    <div className="w-full h-dvh flex flex-col">
      <NavBar />
      <div className="flex-1 flex overflow-hidden">
        {chatType === "global" && <ChatBox name="global" />}
        {chatType === "private" && (
          <>
            <SideBar />
            <ChatBox name="private" />
          </>
        )}
        {chatType === "group" && (
          <>
            <SideBar />
            <ChatBox name="group" />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
