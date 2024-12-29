import Latex from "react-latex-next";
import { useState } from "react";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import React from "react";
import { getEquation, MathOp } from "./unsolver";
import "./App.css";
import "../node_modules/katex/dist/katex.css";

interface OpLabel {
  label: string;
  op: MathOp;
}

const opLabels: OpLabel[] = [
  { label: "Addition", op: MathOp.Add },
  { label: "Subtraction", op: MathOp.Sub },
  { label: "Multiplication", op: MathOp.Mul },
  { label: "Division", op: MathOp.Div },
];

const generateOpMap = () => {
  let map = new Map<MathOp, boolean>();
  opLabels.forEach(({ op }) => map.set(op, true));
  return map;
};

function App() {
  const [answer, setAnswer] = useState(42);
  const [depth, setDepth] = useState(3);
  const [ops, setOps] = React.useState(generateOpMap());

  const getOpList = () =>
    opLabels.filter(({ op }) => ops.get(op)).map(({ op }) => op);

  const [equation, setEquation] = useState(
    getEquation(answer, depth, getOpList())
  );

  const newEquation = () => {
    setEquation(getEquation(answer, depth, getOpList()));
  };

  const setOp = (op: MathOp, value: boolean) => {
    let mutOps = ops;
    mutOps.set(op, value);
    setOps(mutOps);
  };

  return (
    <>
      <FormGroup>
        {opLabels.map(({ label, op }) => (
          <FormControlLabel
            key={label}
            control={
              <Checkbox
                value={ops.get(op) ? "on" : "off"}
                onChange={(e) => setOp(op, e.target.checked)}
              />
            }
            label={label}
          />
        ))}
      </FormGroup>
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
}

export default App;
