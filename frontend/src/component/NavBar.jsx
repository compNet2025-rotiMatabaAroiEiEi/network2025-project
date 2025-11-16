import IconChatGlobal from "../asset/icon_chat_global.svg?react";
import IconChatIndiv from "../asset/icon_chat_private.svg?react";
import IconChatGroup from "../asset/icon_chat_group.svg?react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOutletContext } from "react-router";
import { motion } from "motion/react";
import { SPRING_ANIMATION_TRANSITION } from "../style/animation";

const NavBar = ({ selected }) => {
  const iconList = [
    { component: IconChatGlobal, alt: "global-chat-icon", path: "global" },
    { component: IconChatIndiv, alt: "private-chat-icon", path: "private" },
    { component: IconChatGroup, alt: "group-chat-icon", path: "group" },
  ];
  const location = useLocation();
  const navigate = useNavigate();
  const { handleOut } = useOutletContext();

  const handleLink = (path) => {
    const desUrl = `/${location.pathname.split("/")[1]}/${path}`;
    if (location.pathname === desUrl) {
      return;
    }
    navigate(desUrl);
  };

  return (
    <div className="w-full bg-(--green-color)">
      <div className="flex justify-between items-center">
        <ul>
          {iconList.map((icon, index) => (
            <li key={index} className="relative p-2.5 inline-block">
              <icon.component
                onClick={() => handleLink(icon.path)}
                className={`icon icon-nav indicator-content ${
                  icon.path === selected ? "icon-nav-selected" : ""
                }`}
              />
              {icon.path === selected && (
                <motion.div
                  layoutId="navbar-indicator"
                  transition={SPRING_ANIMATION_TRANSITION()}
                  className="indicator-container bg-(--red-color-tier2)"
                />
              )}
            </li>
          ))}
        </ul>
        <button
          onClick={handleOut}
          className="btn btn-nav mr-5 active:scale-90 active:brightness-90"
        >
          BYE
        </button>
      </div>
    </div>
  );
};

export default NavBar;
