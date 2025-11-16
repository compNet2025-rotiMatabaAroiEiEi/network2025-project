import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router";
import IconDoor from "../asset/icon_door.svg?react";
import IconAddGroup from "../asset/icon_add_group.svg?react";
import { motion, AnimatePresence } from "motion/react";
import { SPRING_ANIMATION_TRANSITION } from "../style/animation";

const SideBar = ({ chatType, socket, setMembers, isGroupMember, ...motionProps }) => {
  const [addGroupClicked, setAddGroupClicked] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
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

  //  adding new group
  const handleAddGroup = (e) => {
    e.preventDefault();
    setAddGroupClicked(false);

    socket.emit("createGroup", {
      groupName: newGroupName.trim(),
    });
    socket.on("createGroupError", (msg) =>{
      alert(msg);
    })
    setNewGroupName("");
  };

  //  change new chat
  const handleChangeChat = (item) => {
    setters[chatType]?.(item.name);

    // If it's a group, auto-join if not a member, then fetch members
    if (chatType === "group" && item.id) {
      if (!isGroupMember(item.id)) {
        socket.emit("joinGroup", { groupId: item.id });
      }
      socket.emit("getGroupMembers", { groupId: item.id });
    }
  };

  const displayAddGroup = () => {
    if (chatType !== "group") return null;
    return (
      <div
        onClick={() => setAddGroupClicked(true)}
        className="bg-(--red-color-tier2) p-2 h-16 flex overflow-x-hidden"
      >
        <AnimatePresence mode="popLayout">
          {addGroupClicked ? (
            <form
              key="form"
              onSubmit={handleAddGroup}
              className="w-full overflow-x-hidden"
            >
              <motion.input
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                name="group-name"
                type="text"
                value={newGroupName.name}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="group name"
                className="w-full my-auto text-xl"
                autoFocus
                required
              />
            </form>
          ) : (
            <div key="icon" className="overflow-x-hidden w-full my-auto  ">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="w-full  flex justify-center items-center  cursor-pointer"
              >
                <IconAddGroup className="icon icon-sidebar icon-sidebar-addgroup" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
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
    if (!socket) return;

    const eventMap = {
      private: {
        emit: "getUsers",
        listen: "usersList",
        handler: (users) => {
          const myUsername = localStorage.getItem("name");
          const userList = users.filter((user) => user.name !== myUsername);
          setAllUsers(userList);
        },
      },
      group: {
        emit: "getGroups",
        listen: "groupsList",
        handler: (groups) => setAllUsers(groups),
      },
    };

    const config = eventMap[chatType];
    if (!config) return;
    socket.emit(config.emit);
    socket.on(config.listen, config.handler);

    const handleGroupMembers = ({ members }) => {
      setMembers(members);
    };

    socket.on("groupMembers", handleGroupMembers);

    return () => {
      socket.off(config.listen, config.handler);
      socket.off("groupMembers", handleGroupMembers);
    };
  }, [socket, chatType, setGroupChatName]);

  return (
    <motion.div
      ref={sideBarContainerRef}
      className="bg-(--red-color-tier4) w-[440px] text-4xl overflow-y-auto scrollbar-none z-20 relative origin-left"
      {...motionProps}
    >
      {displayAddGroup()}
      {allUsers.map((item, index) => (
        <div key={index}>
          <div
            onClick={() => handleChangeChat(item)}
            className="flex justify-between items-center p-2 cursor-pointer relative sidebar-block-container"
          >
            {displayContainerSelected(item.name) && (
              <motion.div
                layoutId="sidebar-indicator"
                transition={SPRING_ANIMATION_TRANSITION()}
                className="indicator-container bg-(--red-color-tier3)"
              />
            )}
            {displayLeftSideElement(item)}
            <p className="indicator-content flex-1">{item.name}</p>
            {displayRightSideElement()}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default SideBar;
