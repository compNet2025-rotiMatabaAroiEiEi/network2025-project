import IconInsertVoice from "../asset/icon_insert_voice.svg?react";
import IconInsertFile from "../asset/icon_insert_file.svg?react";
import IconSend from "../asset/icon_send.svg?react";
import secretAvatar from "../asset/avatar_secret.png";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPRING_ANIMATION_TRANSITION } from "../style/animation";

const ChatBox = ({ name, socket, chatType, roomId, messages = [] }) => {
  const [message, setMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const chatBoxSpaceRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const backendHost =
    import.meta.env.VITE_BACKEND_HOST || window.location.hostname;
  console.log("ChatBox render:", name, "messages:", messages.length, messages);

  const displayImage = (data, prevData) => {
    if (data.name !== prevData) {
      console.log("sadadsa", data);
      return (
        <div className="mt-3 flex items-end gap-2">
          <img
            src={data.image || secretAvatar}
            alt="avatar"
            className="avatar avatar-chatbox"
          />
          {/* {(!data.isMe && data.name) || "???"} */}
          {data.name || "???"}
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

  // Listen for typing indicators
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data) => {
      const { username, chatType: typingChatType, groupId, isTyping } = data;

      // Check if typing event is for current chat
      let isRelevant = false;
      if (chatType === "global" && typingChatType === "global") {
        isRelevant = true;
      } else if (
        chatType === "private" &&
        typingChatType === "private" &&
        username === roomId
      ) {
        isRelevant = true;
      } else if (
        chatType === "group" &&
        typingChatType === "group" &&
        groupId === roomId
      ) {
        isRelevant = true;
      }

      if (isRelevant) {
        if (isTyping) {
          setTypingUsers((prev) => [...new Set([...prev, username])]);
        } else {
          setTypingUsers((prev) => prev.filter((u) => u !== username));
        }
      }
    };

    socket.on("userTyping", handleUserTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
    };
  }, [socket, chatType, roomId]);

  const handleTyping = () => {
    if (!socket) return;

    // Emit typing event
    socket.emit("typing", {
      chatType,
      recipientId: chatType === "private" ? roomId : null,
      groupId: chatType === "group" ? roomId : null,
      isTyping: true,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        chatType,
        recipientId: chatType === "private" ? roomId : null,
        groupId: chatType === "group" ? roomId : null,
        isTyping: false,
      });
    }, 1000);
  };

  const sendMessage = () => {
    if (!message.trim() || !socket) return;

    const messageData = {
      content: message.trim(),
      contentType: "text",
      timestamp: new Date(),
      avatar: localStorage.getItem("img"),
    };

    if (chatType === "global") {
      socket.emit("broadcast", messageData);
    } else if (chatType === "group") {
      socket.emit("groupMessage", { ...messageData, groupId: roomId });
    } else if (chatType === "private") {
      socket.emit("privateMessage", { ...messageData, recipientId: roomId });
    }

    setMessage("");
  };

  //voice and image handler
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const sendMediaMessage = (contentType, content) => {
    if (!socket) return;

    const messageData = {
      content: content,
      contentType: contentType,
      timestamp: new Date(),
      avatar: localStorage.getItem("img"),
    };

    if (chatType === "global") {
      socket.emit("broadcast", messageData);
    } else if (chatType === "group") {
      socket.emit("groupMessage", { ...messageData, groupId: roomId });
    } else if (chatType === "private") {
      socket.emit("privateMessage", { ...messageData, recipientId: roomId });
    }
  };

  //voice recording
  const handleRecordClick = async () => {
    if (isUploading) return;

    if (isRecording) {
      //stop recording
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      //start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaStreamRef.current = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
          audioChunksRef.current.push(event.data);
        });

        mediaRecorderRef.current.addEventListener("stop", async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());

          const formData = new FormData();
          formData.append("audioFile", audioBlob, "voice-message.webm");

          setIsUploading(true);
          try {
            const response = await fetch(
              `http://${backendHost}:5000/upload-audio`,
              {
                method: "POST",
                body: formData,
              }
            );

            if (!response.ok) {
              throw new Error("Audio upload failed");
            }

            const data = await response.json();

            sendMediaMessage("voice", data.url);
          } catch (err) {
            console.error("Audio upload failed:", err);
            alert("Error uploading voice message. Please try again.");
          } finally {
            setIsUploading(false);
          }
        });

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error starting recording:", err);
        alert("Could not access microphone.");
      }
    }
  };

  const handleFileClick = () => {
    if (isRecording || isUploading) return;
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("imageFile", file, file.name);

    setIsUploading(true);
    try {
      const response = await fetch(`http://${backendHost}:5000/upload-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Image upload failed");
      const data = await response.json();

      sendMediaMessage("image", data.url);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
      event.target.value = null;
    }
  };
  //ENDING

  return (
    <div className="relative flex-1 flex flex-col">
      <AnimatePresence>
        <motion.h1
          key={name}
          initial={{
            x: "-100%",
            opacity: 0,
          }}
          animate={{
            x: 0,
            opacity: 1,
          }}
          exit={{
            x: "-100%",
            opacity: 0,
          }}
          transition={SPRING_ANIMATION_TRANSITION()}
          className="absolute top-0 left-0 m-2 text-6xl z-10"
        >
          {name}
        </motion.h1>
      </AnimatePresence>
      <div
        ref={chatBoxSpaceRef}
        className="w-full p-2 overflow-y-auto scrollbar-none flex-1"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-4">No messages yet</div>
        )}

        {messages.map((data, index) => {
          if (!data) {
            console.error("Invalid message data at index", index, data);
            return null;
          }

          const content = data.content || data.message;
          const contentType = data.contentType || "text";

          if (!content) {
            console.error("No message content found at index", index, data);
            return null;
          }

          const prev = index > 0 ? messages[index - 1]?.name : "";

          const renderContent = () => {
            switch (contentType) {
              case "text":
                return content;
              case "image":
                return (
                  <img
                    src={content}
                    alt="User upload"
                    className="max-w-xs rounded-lg"
                  />
                );
              case "voice":
                return (
                  <audio src={content} controls className="w-full max-w-xs" />
                );
              default:
                return "[Unsupported message type]";
            }
          };

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
                {renderContent()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="w-full p-4 bg-(--green-color)">
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="w-full p-2 text-2xl bg-white/50 outline-0 rounded-xl h-[100px] resize-none"
          autoComplete="off"
          placeholder="Type a message"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <IconInsertVoice
              className={`icon icon-chatbox icon-chatbox-insert-voice ${
                isRecording ? "text-red-500" : ""
              }`}
              onClick={handleRecordClick}
              disabled={isUploading}
              style={{
                cursor: isUploading ? "not-allowed" : "pointer",
                opacity: isUploading ? 0.5 : 1,
              }}
            />
            <IconInsertFile
              className="icon icon-chatbox icon-chatbox-insert-file"
              onClick={handleFileClick}
              disabled={isRecording || isUploading}
              style={{
                cursor: isRecording || isUploading ? "not-allowed" : "pointer",
                opacity: isRecording || isUploading ? 0.5 : 1,
              }}
            />
          </div>
          <IconSend
            onClick={sendMessage}
            className="icon icon-chatbox icon-chatbox-send"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
