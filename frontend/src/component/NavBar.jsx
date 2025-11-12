import iconChatGlobal from "../asset/icon_chat_global.png";
import iconChatIndiv from "../asset/icon_chat_private.png";
import iconChatGroup from "../asset/icon_chat_group.png";
import { useNavigate, useLocation  } from "react-router-dom";

const NavBar = () => {
  const iconList = [
    { src: iconChatGlobal, alt: "global-chat-icon", path: "global" },
    { src: iconChatIndiv, alt: "private-chat-icon", path: "private" },
    { src: iconChatGroup, alt: "group-chat-icon", path: "group" },
  ];
  const location = useLocation();
  const navigate = useNavigate();

  const handleLink = (path) => {
    const desUrl = `/${location.pathname.split("/")[1]}/${path}`;
    if (location.pathname === desUrl) {
      return;
    }
    navigate(desUrl);
  };

  const handleExit = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-full bg-(--green-color)">
      <div className="flex justify-between items-center">
        <ul className="py-2.5 px-12.5">
          {iconList.map((icon, index) => (
            <li key={index} className="icon icon-nav">
              <img
                src={icon.src}
                alt={icon.alt}
                onClick={() => handleLink(icon.path)}
              />
            </li>
          ))}
        </ul>
        <button onClick={() => handleExit()} className="btn btn-nav mr-5">
          BYE
        </button>
      </div>
    </div>
  );
};

export default NavBar;
