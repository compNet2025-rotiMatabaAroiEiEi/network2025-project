import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import santaImage from "../asset/avatar_santa.png";
import santaFemaleImage from "../asset/avatar_santa_female.png";
import elfImage from "../asset/avatar_elf.png";
import snowmanImage from "../asset/avatar_snowman.png";
import reindeerImage from "../asset/avatar_reindeer.png";
import gingerbreadImage from "../asset/avatar_gingerbread.png";
import { motion, useAnimate } from "motion/react";
import {
  ANIMATION_TRANSITION,
  SPRING_ANIMATION_TRANSITION,
} from "../style/animation";

const Login = ({ socket }) => {
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
  const [slidingBlock, animate] = useAnimate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!socket) {
      setError("Connection error. Please refresh the page.");
      return;
    }

    setError("");
    setIsLoading(true);

    // Try to register with the server first
    socket.emit("register", { name, avatar: img });
  };

  useEffect(() => {
    const loadElement = async () => {
      await Promise.all([
        animate(
          [...slidingBlock.current.children],
          { x: "-200%" },
          ANIMATION_TRANSITION("ease-in-out")
        ),
        animate(
          slidingBlock.current,
          { scaleX: 0.5 },
          SPRING_ANIMATION_TRANSITION(1.5)
        ),
      ]);
    };

    loadElement();

    // Only set up socket listeners if socket exists
    if (!socket) return;

    // Listen for registration success
    const handleRegisterSuccess = async (username) => {
      localStorage.setItem("name", username);
      localStorage.setItem("img", img);

      await Promise.all([
        animate(
          [...slidingBlock.current.children],
          { x: "200%" },
          ANIMATION_TRANSITION("ease-in-out")
        ),
        animate(
          slidingBlock.current,
          { scaleX: 2 },
          SPRING_ANIMATION_TRANSITION(1.5)
        ),
      ]);

      navigate("/chat/global");
    };

    // Listen for registration error
    const handleRegisterError = (errorMessage) => {
      setError(errorMessage);
      setIsLoading(false);
    };

    socket.on("registerSuccess", handleRegisterSuccess);
    socket.on("registerError", handleRegisterError);

    // Cleanup listeners
    return () => {
      socket.off("registerSuccess", handleRegisterSuccess);
      socket.off("registerError", handleRegisterError);
    };
  }, [socket, navigate, animate, slidingBlock, img]);

  return (
    <div className="grid grid-cols-2 min-h-dvh bg-(--red-color-tier3)">
      <div className="bg-[url('asset/bg_login.png')] bg-cover bg-center flex flex-col justify-evenly items-center text-center">
        <h1 className="text-stroke text-7xl font-bold">Yuletide666</h1>
        <div className="w-[350px] h-[350px] border-3 border-white rounded-full overflow-hidden relative">
          <motion.img
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.2 }}
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
      <motion.div
        ref={slidingBlock}
        className="w-full flex justify-center items-center bg-(--red-color-tier3) text-4xl origin-right scale-x-200"
      >
        <div className="flex flex-col items-center gap-3 translate-x-[200%]">
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
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-xl bg-white px-4 py-2 rounded-lg shadow-lg"
              >
                {error}
              </motion.div>
            )}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: name.length > 0 ? 1 : 0 }}
              transition={SPRING_ANIMATION_TRANSITION()}
              type="submit"
              className="btn btn-main mx-auto mt-3 active:scale-90 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "GO!"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
