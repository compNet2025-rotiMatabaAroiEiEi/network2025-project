import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
//test
import {socket} from "./test";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="font-bold text-xl">Bung Sell ROTI</div>
    </>
  );
}

export default App;
