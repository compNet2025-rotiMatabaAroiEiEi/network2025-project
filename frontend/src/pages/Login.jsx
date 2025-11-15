import { useState } from "react";
import { useNavigate } from "react-router-dom";
import santaImage from "../asset/avatar_santa.png";
import santaFemaleImage from "../asset/avatar_santa_female.png";
import elfImage from "../asset/avatar_elf.png";
import snowmanImage from "../asset/avatar_snowman.png";
import reindeerImage from "../asset/avatar_reindeer.png";
import gingerbreadImage from "../asset/avatar_gingerbread.png";
import { motion } from "motion/react";
import { ANIMATION, slideLeftRight, slideTopBottom } from "../style/animation";

const Login = ({socket}) => {
  const imageList = [
    { src: santaImage, alt: "santa-avatar" },
    { src: santaFemaleImage, alt: "santa-female-avatar" },
    { src: elfImage, alt: "elf-avatar" },
    { src: snowmanImage, alt: "snowman-avatar" },
    { src: reindeerImage, alt: "reindeer-avatar" },
    { src: gingerbreadImage, alt: "gingerbread-avatar" },
  ];

  const [name, setName] = useState("");
  const [img, setImg] = useState(santaImage);
  const [prevImg, setPrevImg] = useState(santaImage);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.clear();
    if (name === "") {
      alert("Please enter a name");
    } else if (!socket) {
      alert("Connection not ready, please wait...");
    } else {
      localStorage.setItem("name", name);
      localStorage.setItem("img", img);
      
      socket.once('registerSuccess', () => {
        navigate("/chat/global");
      });
      
      socket.once('registerError', (error) => {
        alert(error);
      });
      
      socket.emit('register', { name, avatar: img });
    }
  };

  return (
    <div className="grid grid-cols-2 min-h-dvh">
      <div className="bg-[url('asset/bg_login.png')] bg-cover bg-center flex flex-col justify-evenly items-center text-center">
        <h1 className="text-stroke text-7xl font-bold">Yuletide666</h1>
        <div className="w-[350px] h-[350px] border-3 border-white rounded-full overflow-hidden relative">
          <motion.img
            variants={slideTopBottom}
            initial="slideTop"
            animate="slideBottom"
            custom={ANIMATION.duration}
            key={img}
            src={img}
            alt="profile-img"
            className="absolute"
          />
          <img src={prevImg} alt="profile-img" className="" />
        </div>
        <div>
          <p className="text-5xl text-stroke font-bold">WELCOME</p>
          <p className="text-5xl text-stroke font-bold">{name || "\u00A0"}</p>
        </div>
      </div>
      <div className="w-full flex justify-center items-center bg-(--red-color-tier3) text-4xl">
        <div className="flex flex-col items-center  gap-3">
          <h2>Select your Avatar</h2>
          <div className="grid grid-cols-3 grid-rows-2 gap-x-3 gap-y-2.5 mb-3">
            {imageList.map((image, index) => (
              <img
                key={index}
                src={image.src}
                alt={image.alt}
                className="avatar avatar-select"
                onClick={() => {
                  setPrevImg(img);
                  setImg(image.src);
                }}
              />
            ))}
          </div>
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-col items-start  gap-3"
          >
            <label>Display name:</label>
            <input
              type="text"
              name="name"
              value={name}
              autoComplete="off"
              className="bg-white outline-0 px-4 py-2 rounded-xl"
              onChange={(e) => setName(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-main mx-auto mt-3 active:scale-90 active:brightness-90"
            >
              GO!
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
