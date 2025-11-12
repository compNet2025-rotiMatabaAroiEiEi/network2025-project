import { Outlet } from "react-router-dom";

const Chat = () => {
  return (
    <div className="w-full h-dvh">
      <Outlet />
    </div>
  );
};

export default Chat;
