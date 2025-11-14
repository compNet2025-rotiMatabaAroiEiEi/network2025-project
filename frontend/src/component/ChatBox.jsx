import IconInsertVoice from "../asset/icon_insert_voice.svg?react";
import IconInsertFile from "../asset/icon_insert_file.svg?react";
import IconSend from "../asset/icon_send.svg?react";
import secretAvatar from "../asset/avatar_secret.png";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ANIMATION, slideLeftRight } from "../style/animation";

const ChatBox = ({ name, socket, chatType, roomId, messages = [] }) => {
  const [message, setMessage] = useState("");
  const chatBoxSpaceRef = useRef(null);

  console.log('ChatBox render:', name, 'messages:', messages.length, messages);

  const displayImage = (data, prevData) => {
    if (data.name !== prevData) {
      console.log("sadadsa",data)
      return (
        <div className="mt-3 flex items-end gap-2">
          <img
            src={data.image || secretAvatar}
            alt="avatar"
            className="avatar avatar-chatbox"
          />
          {/* {(!data.isMe && data.name) || "???"} */}
          {( data.name) || "???"}
        </div>
      );
    }
    return;
  };

  useEffect(() => {
    if (chatBoxSpaceRef.current) {
      chatBoxSpaceRef.current.scrollTo({
        top: chatBoxSpaceRef.current.scrollHeight,
        // behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMessage = () => {
    if(!message.trim() || !socket) return;

    const messageData = {
      message: message.trim(),
      timestamp: new Date(),
      avatar: localStorage.getItem('img')
    };

    if(chatType === 'global'){
      socket.emit('broadcast', messageData);
    }
    else if (chatType === 'group'){
      socket.emit('groupMessage', {...messageData, groupId: roomId})
    } 
    else if (chatType === 'private') {
      socket.emit('privateMessage', {...messageData, recipientId: roomId})
    }

    setMessage("");
  };




  return (
    <div className="relative flex-1 flex flex-col">
      <AnimatePresence>
        <motion.h1
          key={name}
          variants={slideLeftRight}
          initial="slideLeft"
          animate="slideRight"
          exit="slideLeft"
          custom={ANIMATION.duration}
          className="absolute top-0 left-0 m-2 text-6xl z-10"
        >
          {name}
        </motion.h1>
      </AnimatePresence>
      <div
        ref={chatBoxSpaceRef}
        className="w-full p-2 overflow-y-auto scrollbar-none flex-1"
      >
        {messages.length === 0 && <div className="text-center text-gray-400 mt-4">No messages yet</div>}
        {messages.map((data, index) => {
          if (!data || !data.message) {
            console.error('Invalid message data at index', index, data);
            return null;
          }
          const prev = index > 0 ? messages[index - 1]?.name : "";
          return (
            <div
              key={index}
              className={`px-2 flex flex-col  ${
                data.isMe ? "items-end" : "items-start"
              }`}
            >
              {displayImage(data, prev)}
              <div
                className={`message ${
                  data.isMe ? "message-right" : "message-left"
                }`}
              >
                {data.message}
              </div>
            </div>
          );
        })}
      </div>
      <div className="w-full p-4 bg-(--green-color)">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if(e.key === 'Enter' && !e.shiftKey){
              e.preventDefault();
              sendMessage();
            }
          }}
          className="w-full p-2 text-2xl bg-white/50 outline-0 rounded-xl h-[100px] resize-none"
          autoComplete="off"
          placeholder="Type a message"
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <IconInsertVoice className="icon icon-chatbox icon-chatbox-insert-voice" />
            <IconInsertFile className="icon icon-chatbox icon-chatbox-insert-file" />
          </div>
          <IconSend onClick={sendMessage} className="icon icon-chatbox icon-chatbox-send" />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
