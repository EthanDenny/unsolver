import Latex from "react-latex-next";
import { useState } from "react";
import { getEquation } from "./unsolver";
import "./App.css";

const ops = ["+", "-", "*"];

function App() {
  const [equation, setEquation] = useState(" ");

  const newEquation = () => {
    setEquation(getEquation(42, 3, ops));
  };

  return (
    <>
      <h1>
        <Latex>{"$" + equation + "$"}</Latex>
      </h1>
      <div className="card">
        <button onClick={newEquation}>New Equation</button>
      </div>
    </>
  );
}

export default App;
