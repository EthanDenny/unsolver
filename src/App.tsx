import Latex from "react-latex-next";
import { useState } from "react";
import { getEquation } from "./unsolver";
import InfoTab from "./InfoTab"
import React from "react";
import { MathOp } from "./unsolver";
import "./App.css"; 
import "../node_modules/katex/dist/katex.css"


function App() {
  const [ops, setOps] = React.useState(["+", "-", "*"]);
  
  function updateOpsArray(op: MathOp): void {
    const newArray = ops.filter((x) => x !== op)
    if (newArray.length === ops.length) ops.concat(op)
    setOps(newArray)
  }
  
  const [equation, setEquation] = useState(" ");

  const newEquation = () => {
    setEquation(getEquation(answer, depth, ops));
  };

  return (
    <>
        <InfoTab handleChange={updateOpsArray}></InfoTab>
      <h1>
        <Latex>{"$" + equation + "$"}</Latex>
      </h1>

      <div className="card">
        Answer:{" "}
        <input
          type="number"
          value={answer}
          onChange={(e) => {
            setAnswer(parseInt(e.target.value));
            newEquation();
          }}
        />
      </div>
      <div className="card">
        Max Depth: {depth}
        <input
          type="range"
          min="1"
          max="10"
          value={depth}
          onChange={(e) => {
            setDepth(parseInt(e.target.value));
            newEquation();
          }}
        />
      </div>
      <div className="card">
        <button onClick={newEquation}>New Equation</button>
      </div>
    </>
  );
};

export default App;
