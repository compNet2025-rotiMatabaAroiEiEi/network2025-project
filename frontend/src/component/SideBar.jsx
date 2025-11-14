import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router";
import IconDoor from "../asset/icon_door.svg?react";
import IconAddGroup from "../asset/icon_add_group.svg?react";
import { motion } from "motion/react";
import { ANIMATION } from "../style/animation";

const SideBar = ({ chatType, socket }) => {
  const [chatData, setChatData] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
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

  const handleChangeChat = (name) => {
    setters[chatType]?.(name);
    
    // If it's a group chat, also store the display name
    if (chatType === 'group') {
      const group = chatData.find(g => g.id === name);
      if (group) {
        sessionStorage.setItem('selectedGroupId', name);
        sessionStorage.setItem('selectedGroupName', group.name);
      }
    }
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

  // Reset state when switching tabs - do this immediately
  useEffect(() => {
    // Clear data immediately to prevent rendering mismatched data
    setChatData([]);
    setShowCreateGroup(false);
    setNewGroupName("");
    setSelectedMembers([]);
    setAllUsers([]);
  }, [chatType]);

  useEffect(() => {
    if (!socket) return;

    if (chatType === 'private') {
      // Request users list when component mounts
      socket.emit('getUsers');

      // Listen for users list
      const handleUsersList = (users) => {
        const myUsername = localStorage.getItem('name');
        // Filter out current user
        const userList = users.filter(user => user.name !== myUsername);
        setChatData(userList);
        setAllUsers(userList);
      };

      socket.on('usersList', handleUsersList);

      return () => {
        socket.off('usersList', handleUsersList);
      };
    } else if (chatType === 'group') {
      // Request groups list
      socket.emit('getGroups');
      socket.emit('getUsers');

      // Listen for groups list
      const handleGroupsList = (groups) => {
        const myUsername = localStorage.getItem('name');
        // Filter groups where user is a member
        const userGroups = groups.filter(group => 
          group.members.includes(myUsername)
        );
        setChatData(userGroups);
      };

      // Listen for users list (for creating groups)
      const handleUsersList = (users) => {
        const myUsername = localStorage.getItem('name');
        const userList = users.filter(user => user.name !== myUsername);
        setAllUsers(userList);
      };

      // Listen for group created event
      const handleGroupCreated = ({ groupId, groupName }) => {
        setShowCreateGroup(false);
        setNewGroupName("");
        setSelectedMembers([]);
        setGroupChatName(groupId);
      };

      socket.on('groupsList', handleGroupsList);
      socket.on('usersList', handleUsersList);
      socket.on('groupCreated', handleGroupCreated);

      return () => {
        socket.off('groupsList', handleGroupsList);
        socket.off('usersList', handleUsersList);
        socket.off('groupCreated', handleGroupCreated);
      };
    }
  }, [socket, chatType, setGroupChatName]);

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) {
      alert("Please enter a group name and select at least one member");
      return;
    }

    socket.emit('createGroup', {
      groupName: newGroupName.trim(),
      members: selectedMembers
    });
  };

  const toggleMemberSelection = (username) => {
    setSelectedMembers(prev => 
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  };

  return (
    <div
      ref={sideBarContainerRef}
      className="bg-(--red-color-tier4) w-[440px] text-4xl overflow-y-auto scrollbar-none z-20 relative"
    >
      {chatType === 'group' && (
        <div className="sticky top-0 bg-(--red-color-tier4) p-2 border-b-2 border-(--red-color-tier3) z-30">
          <button
            onClick={() => setShowCreateGroup(!showCreateGroup)}
            className="w-full flex items-center justify-center gap-2 p-2 bg-(--green-color) rounded-lg hover:brightness-110 active:scale-95"
          >
            <IconAddGroup className="icon icon-sidebar" />
            <span className="text-2xl">Create Group</span>
          </button>
        </div>
      )}

      {showCreateGroup && chatType === 'group' && allUsers.length > 0 && (
        <div className="sticky top-[70px] bg-(--red-color-tier3) p-4 border-b-2 border-(--red-color-tier2) z-20">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name"
            className="w-full p-2 text-2xl mb-3 rounded-lg outline-none"
          />
          <div className="text-2xl mb-2">Select members:</div>
          <div className="max-h-[200px] overflow-y-auto mb-3">
            {allUsers.map((user, index) => (
              <div
                key={index}
                onClick={() => toggleMemberSelection(user.name)}
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-(--red-color-tier4) rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user.name)}
                  onChange={() => {}}
                  className="w-5 h-5"
                />
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="avatar avatar-sidebar"
                />
                <span className="text-2xl">{user.name}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateGroup}
              className="flex-1 p-2 text-2xl bg-(--green-color) rounded-lg hover:brightness-110 active:scale-95"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateGroup(false);
                setNewGroupName("");
                setSelectedMembers([]);
              }}
              className="flex-1 p-2 text-2xl bg-gray-400 rounded-lg hover:brightness-110 active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {chatData.map((item, index) => {
        // Skip rendering if item doesn't match expected structure for chatType
        if (chatType === 'group' && !item.id) return null;
        if (chatType === 'private' && !item.name) return null;
        
        const itemName = chatType === 'group' ? item.id : item.name;
        const displayName = chatType === 'group' ? item.name : item.name;
        
        return (
          <div
            key={index}
            onClick={() => handleChangeChat(itemName)}
            className="flex justify-between items-center p-2 cursor-pointer relative"
          >
            {displayContainerSelected(itemName) && (
              <motion.div
                layoutId="sidebar-indicator"
                transition={ANIMATION}
                className="indicator-container bg-(--red-color-tier3)"
              />
            )}
            {displayLeftSideElement(item)}
            <div className="indicator-content flex-1 px-2">
              <p className="truncate">{displayName}</p>
              {chatType === 'group' && item.members && (
                <p className="text-lg text-gray-300">
                  {item.members.length} members
                </p>
              )}
            </div>
            {displayRightSideElement()}
          </div>
        );
      })}
    </div>
  );
};

export default SideBar;
