import Latex from "react-latex-next";
import { useState } from "react";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { getEquation, MathOp } from "./unsolver";
import "./App.css";
import "../node_modules/katex/dist/katex.css";

const opLabels: [string, MathOp][] = [
  ["Addition", MathOp.Add],
  ["Subtraction", MathOp.Sub],
  ["Multiplication", MathOp.Mul],
  ["Division", MathOp.Div],
];

const useOpToggles = (): [
  (op: MathOp) => boolean,
  (op: MathOp, value: boolean) => void,
  () => MathOp[]
] => {
  const generateOpMap = () => {
    let map: any = {};
    opLabels.forEach(([_, op]) => {
      map[op] = true;
    });
    return map as Record<MathOp, boolean>;
  };

  const [ops, setOps] = useState(generateOpMap());

  const getOpToggle = (op: MathOp) => ops[op];

  const setOp = (op: MathOp, value: boolean) => {
    setOps({
      ...ops,
      [op]: value,
    });
  };

  const getOpList = () => opLabels.map(([_, op]) => op).filter((op) => ops[op]);

  return [getOpToggle, setOp, getOpList];
};

function App() {
  const [answer, setAnswer] = useState(42);
  const [depth, setDepth] = useState(3);
  const [getOpToggle, setOpToggle, getOpList] = useOpToggles();

  const newEquation = () => getEquation(answer, depth, getOpList());
  const [equation, setEquation] = useState(newEquation());
  const rerollEquation = () => {
    setEquation(newEquation());
  };

  return (
    <>
      <FormGroup>
        {opLabels.map(([label, op]) => (
          <FormControlLabel
            key={label}
            control={
              <Checkbox
                checked={getOpToggle(op)}
                onChange={(e) => setOpToggle(op, e.target.checked)}
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
        <button onClick={rerollEquation}>New Equation</button>
      </div>
    </>
  );
}

export default App;
