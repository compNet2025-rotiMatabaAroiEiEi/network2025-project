const ANIMATION = {
  duration: 0.4,
  type: "spring",
};

const slideLeftRight = {
  slideLeft: (time) => ({
    x: -100,
    opacity: 0,
    transition: {
      duration: time,
      type: "spring",
    },
  }),
  slideRight: (time) => ({
    x: 0,
    opacity: 1,
    transition: {
      duration: time,
      type: "spring",
    },
  }),
};

const slideTopBottom = {
  slideTop: (time) => ({
    y: -200,
    transition: {
      duration: time,
      type: "spring",
    },
  }),
  slideBottom: (time) => ({
    y: 0,
    transition: {
      duration: time,
      type: "spring",
    },
  }),
};

export { slideLeftRight, slideTopBottom, ANIMATION };
