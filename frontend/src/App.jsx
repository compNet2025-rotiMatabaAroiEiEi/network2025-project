import { useEffect, useState } from "react";
import ChatLayout from "./layout/ChatLayout";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import io from "socket.io-client";

function App() {
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const backendHost =
      import.meta.env.VITE_BACKEND_HOST || window.location.hostname;
    const newSocket = io(`http://${backendHost}:5000`);

    newSocket.on("connect", () => {});
    if (localStorage.getItem("name") && localStorage.getItem("img")) {
      newSocket.emit("register", {
        name: localStorage.getItem("name"),
        avatar: localStorage.getItem("img"),
      });
      navigate("/chat/global");
    }
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Login socket={socket} />} />

        <Route path="/chat" element={<Chat socket={socket} />}>
          <Route
            path="global"
            element={<ChatLayout chatType="global" socket={socket} />}
          />
          <Route
            path="private"
            element={<ChatLayout chatType="private" socket={socket} />}
          />
          <Route
            path="group"
            element={<ChatLayout chatType="group" socket={socket} />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
