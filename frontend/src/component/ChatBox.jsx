import IconInsertVoice from "../asset/icon_insert_voice.svg?react";
import IconInsertFile from "../asset/icon_insert_file.svg?react";
import IconSend from "../asset/icon_send.svg?react";
import secretAvatar from "../asset/avatar_secret.png";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, stagger } from "motion/react";
import { SPRING_ANIMATION_TRANSITION } from "../style/animation";
import Overlay from "./Overlay";

const ChatBox = ({
  name,
  socket,
  members,
  chatType,
  roomId,
  messages = [],
}) => {
  const [message, setMessage] = useState("");
  const [isShowMemberClicked, setIsShowMemberClicked] = useState(false);
  const chatBoxSpaceRef = useRef(null);
  const me = useRef(localStorage.getItem("name"));

  const backendHost =
    import.meta.env.VITE_BACKEND_HOST || window.location.hostname;

  const displayImage = (data, prevData) => {
    if (data.name !== prevData) {
      return (
        <div className="mt-3 flex items-end gap-2">
          <img
            src={data.image || secretAvatar}
            alt="avatar"
            className="avatar avatar-chatbox"
          />
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
      });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !socket) return;

    const messageData = {
      content: message.trim(),
      contentType: "text",
      avatar: localStorage.getItem("img"),
    };

    if (chatType === "global") {
      console.log(messageData);
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
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      //start recording
      try {
        // Check if MediaRecorder is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert("Your browser doesn't support audio recording.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        mediaStreamRef.current = stream;

        // Try to use a compatible audio format
        let mimeType = "audio/webm";
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
          mimeType = "audio/ogg;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        }

        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
        audioChunksRef.current = [];

        mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        });

        mediaRecorderRef.current.addEventListener("stop", async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType,
          });

          // Stop all tracks
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          }

          // Check if we have audio data
          if (audioBlob.size === 0) {
            alert("No audio recorded. Please try again.");
            setIsUploading(false);
            return;
          }

          const formData = new FormData();
          const extension = mimeType.includes("webm")
            ? "webm"
            : mimeType.includes("ogg")
            ? "ogg"
            : "mp4";
          formData.append("audioFile", audioBlob, `voice-message.${extension}`);

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
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || "Audio upload failed");
            }

            const data = await response.json();

            sendMediaMessage("voice", data.url);
          } catch (err) {
            console.error("Audio upload failed:", err);
            alert(`Error uploading voice message: ${err.message}`);
          } finally {
            setIsUploading(false);
          }
        });

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error starting recording:", err);
        if (err.name === "NotAllowedError") {
          alert(
            "Microphone access denied. Please allow microphone access in your browser settings."
          );
        } else if (err.name === "NotFoundError") {
          alert(
            "No microphone found. Please connect a microphone and try again."
          );
        } else {
          alert(
            "Could not access microphone. Please check your browser settings."
          );
        }
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
        <motion.div
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
          transition={{
            ...SPRING_ANIMATION_TRANSITION(),
            when: "beforeChildren",
          }}
          className="absolute top-0 left-0 m-2 z-10"
        >
          <h1 className="text-6xl flex items-center gap-2">
            {name}{" "}
            <AnimatePresence>
              {chatType !== "private" && members.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={SPRING_ANIMATION_TRANSITION(1.5)}
                  onClick={() => setIsShowMemberClicked(!isShowMemberClicked)}
                  className="text-xl inline-block bg-(--red-color-tier2) rounded-full px-4 py-2 text-white! cursor-pointer"
                >
                  {members.length}
                </motion.span>
              )}
            </AnimatePresence>
          </h1>
        </motion.div>
      </AnimatePresence>
      <div
        ref={chatBoxSpaceRef}
        className="w-full p-2 overflow-y-auto scrollbar-none flex-1"
      >
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
                  <audio
                    controls
                    style={{
                      width: "300px",
                      height: "40px",
                      display: "block",
                    }}
                    preload="metadata"
                    onError={(e) => {
                      console.error(
                        "Audio load error:",
                        content,
                        e.target.error
                      );
                    }}
                  >
                    <source src={content} type="audio/webm" />
                    <source src={content} type="audio/ogg" />
                    <source src={content} type="audio/mp4" />
                    Your browser does not support the audio element.
                  </audio>
                );
              default:
                return "[Unsupported message type]";
            }
          };

          return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_ANIMATION_TRANSITION()}
              key={index}
              className={`px-2 flex flex-col  ${
                data.isMe ? "items-end" : "items-start"
              }`}
            >
              {displayImage(data, prev)}
              <div
                className={`message ${
                  data.isMe ? "message-right" : "message-left"
                } ${
                  contentType === "voice" || contentType === "image"
                    ? "p-2"
                    : ""
                }`}
                style={
                  contentType === "voice"
                    ? { wordBreak: "normal", overflow: "visible" }
                    : {}
                }
              >
                {renderContent()}
              </div>
            </motion.div>
          );
        })}
      </div>
      <motion.div
        layoutId="chat-box"
        transition={SPRING_ANIMATION_TRANSITION()}
        className="w-full p-4 bg-(--green-color)"
      >
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
      </motion.div>

      <AnimatePresence>
        {isShowMemberClicked && (
          <Overlay
            onClick={() => setIsShowMemberClicked(!isShowMemberClicked)}
            key="overlay"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={SPRING_ANIMATION_TRANSITION}
              exit={{ y: "100%" }}
              className="absolute left-1/2 -translate-x-1/2 bg-white rounded-2xl w-2/3 overflow-hidden"
            >
              {[...members]
                .sort((a, b) => {
                  if (a.name === me.current) return -1;
                  if (b.name === me.current) return 1;
                  return 0;
                })
                .map((member, idx) => {
                  return (
                    <div
                      key={idx}
                      className={`w-full text-2xl py-4 px-8 flex justify-start items-center gap-4 ${
                        member.name === me.current
                          ? "bg-(--red-color-tier3)"
                          : "bg-(--red-color-tier4)"
                      }`}
                    >
                      <img
                        src={member.avatar}
                        className="avatar avatar-chatbox"
                      />
                      {member.name} {member.name === me.current && "<Me>"}
                    </div>
                  );
                })}
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBox;
