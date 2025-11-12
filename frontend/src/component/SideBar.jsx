import { useEffect, useRef } from "react";

const SideBar = () => {
  const mockData = [
    { name: "Santa Claus", img: "/src/asset/avatar_santa.png" },
    { name: "Mrs. Claus", img: "/src/asset/avatar_santa_female.png" },
    { name: "Buddy the Elf", img: "/src/asset/avatar_elf.png" },
    { name: "Frosty", img: "/src/asset/avatar_snowman.png" },
    { name: "Rudolph", img: "/src/asset/avatar_reindeer.png" },
    { name: "Ginger", img: "/src/asset/avatar_gingerbread.png" },
    { name: "Santa Claus", img: "/src/asset/avatar_santa.png" },
    { name: "Mrs. Claus", img: "/src/asset/avatar_santa_female.png" },
    { name: "Buddy the Elf", img: "/src/asset/avatar_elf.png" },
    { name: "Frosty", img: "/src/asset/avatar_snowman.png" },
    { name: "Rudolph", img: "/src/asset/avatar_reindeer.png" },
    { name: "Ginger", img: "/src/asset/avatar_gingerbread.png" },
  ];

  const sideBarContainerRef = useRef(null);

  useEffect(() => {
    sideBarContainerRef.current.scrollBy({ top: 0 });
  }, []);

  return (
    <div
      ref={sideBarContainerRef}
      className="bg-(--red-color-tier4) w-[440px] text-4xl overflow-y-auto scrollbar-none"
    >
      {mockData.map((item, index) => (
        <div
          key={index}
          className={`flex justify-between items-center p-2 cursor-pointer ${
            index === 0 && "bg-(--red-color-tier3)"
          }`}
        >
          <img
            src={item.img}
            alt={`${name}-profile`}
            className="avatar avatar-sidebar"
          />
          {item.name}
          <div>{"\u00A0"}</div>
        </div>
      ))}
    </div>
  );
};

export default SideBar;
