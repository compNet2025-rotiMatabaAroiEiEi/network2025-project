const SPRING_ANIMATION_TRANSITION = (multipler = 1) => {
  return {
    duration: 0.4 * multipler,
    type: "spring",
  };
};

const ANIMATION_TRANSITION = (type, multipler = 1, ) => {
  return {
    duration: 0.4 * multipler,
    type: type,
  };
};

export { SPRING_ANIMATION_TRANSITION, ANIMATION_TRANSITION };
