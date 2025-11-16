import { useEffect, useState } from "react";
import ChatLayout from "./layout/ChatLayout";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import { Navigate, Route, Routes } from "react-router-dom";
import io from "socket.io-client";

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const backendHost =
      import.meta.env.VITE_BACKEND_HOST || window.location.hostname;
    const newSocket = io(`http://${backendHost}:5000`);

    newSocket.on("connect", () => {});

    const name = localStorage.getItem("name");
    const img = localStorage.getItem("img");
    
    if(name && img){
      newSocket.emit("register", { name, avatar: img });
    }

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<Login socket={socket} />}
        />

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
