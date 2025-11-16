import { motion } from "motion/react";
import { SPRING_ANIMATION_TRANSITION } from "../style/animation";

const Overlay = ({ onClick, children }) => {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={SPRING_ANIMATION_TRANSITION()}
      exit={{ opacity: 0 }}
      className="bg-black/50 fixed top-0 left-0 w-dvw h-dvh z-50 cursor-pointer py-12 overflow-y-auto"
    >
      {children}
    </motion.div>
  );
};

export default Overlay;
