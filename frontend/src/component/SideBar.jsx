import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router";
import IconDoor from "../asset/icon_door.svg?react";
import { motion } from "motion/react";
import { ANIMATION } from "../style/animation";

const SideBar = ({ chatType, socket }) => {
  const [chatData, setChatData] = useState([]);
  const sideBarContainerRef = useRef(null);
  const {
    privateChatName,
    setPrivateChatName,
    groupChatName,
    setGroupChatName,
  } = useOutletContext();

  const setters = {
    private: setPrivateChatName,
    group: setGroupChatName,
  };

  const values = {
    private: privateChatName,
    group: groupChatName,
  };

  const handleChangeChat = (name) => {
    setters[chatType]?.(name);
  };

  const displayContainerSelected = (name) => {
    return values[chatType] === name;
  };

  const displayLeftSideElement = (item) => {
    if (chatType === "private") {
      return (
        <img
          src={item.avatar || item.img}
          alt={`${item.name}-profile`}
          className="avatar avatar-sidebar indicator-content"
        />
      );
    }
    return <div className="indicator-content">{"\u00A0"}</div>;
  };

  const displayRightSideElement = () => {
    if (chatType === "group") {
      return (
        <IconDoor className="icon icon-sidebar icon-sidebar-door indicator-content" />
      );
    }
    return <div className="indicator-content">{"\u00A0"}</div>;
  };

  useEffect(() => {
    sideBarContainerRef.current.scrollBy({ top: 0 });
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Request users list when component mounts
    socket.emit('getUsers');

    // Listen for users list
    socket.on('usersList', (users) => {
      const myUsername = localStorage.getItem('name');
      // Filter out current user
      const userList = users.filter(user => user.name !== myUsername);
      setChatData(userList);
    });

    return () => socket.off('usersList');
  }, [socket]);

  return (
    <div
      ref={sideBarContainerRef}
      className="bg-(--red-color-tier4) w-[440px] text-4xl overflow-y-auto scrollbar-none z-20"
    >
      {chatData.map((item, index) => (
        <div
          key={index}
          onClick={() => handleChangeChat(item.name)}
          className="flex justify-between items-center p-2 cursor-pointer relative"
        >
          {displayContainerSelected(item.name) && (
            <motion.div
              layoutId="sidebar-indicator"
              transition={ANIMATION}
              className="indicator-container bg-(--red-color-tier3)"
            />
          )}
          {displayLeftSideElement(item)}
          <p className="indicator-content">{item.name}</p>
          {displayRightSideElement()}
        </div>
      ))}
    </div>
  );
};

export default SideBar;
