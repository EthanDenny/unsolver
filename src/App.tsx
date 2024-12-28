import Latex from "react-latex-next";
import { useState } from "react";
import { MathOp, getEquation } from "./unsolver";
import "./App.css";
import "../node_modules/katex/dist/katex.css";

const ops = [MathOp.Add, MathOp.Sub, MathOp.Mul, MathOp.Div];

const App = () => {
  const [answer, setAnswer] = useState(42);
  const [depth, setDepth] = useState(3);
  const [equation, setEquation] = useState(getEquation(answer, depth, ops));

  const newEquation = () => {
    setEquation(getEquation(answer, depth, ops));
  };

  return (
    <>
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
