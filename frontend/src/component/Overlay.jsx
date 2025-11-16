const Overlay = ({ onClick, children }) => {
  return (
    <div
      onClick={onClick}
      className="bg-black/50 fixed top-0 left-0 w-dvw h-dvh z-50 cursor-pointer py-12 overflow-y-auto"
    >
      {children}
    </div>
  );
};

export default Overlay;
