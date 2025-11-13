import ChatLayout from "./layout/ChatLayout";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import { Navigate, Route, Routes } from "react-router-dom";
import { socket } from "./test";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/chat" element={<Chat />}>
          <Route path="global" element={<ChatLayout chatType="global" />} />
          <Route path="private" element={<ChatLayout chatType="private" />} />
          <Route path="group" element={<ChatLayout chatType="group" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
