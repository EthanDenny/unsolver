import Latex from "react-latex-next";
import { useState } from "react";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
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

const useOpToggles = (): [
  Record<MathOp, boolean>,
  (op: MathOp, value: boolean) => void
] => {
  const generateOpMap = () => {
    let map: any = {};
    opLabels.forEach(({ op }) => {
      map[op] = true;
    });
    return map as Record<MathOp, boolean>;
  };

  const [ops, setOps] = useState(generateOpMap());

  const setOp = (op: MathOp, value: boolean) => {
    setOps({
      ...ops,
      [op]: value,
    });
  };

  return [ops, setOp];
};

function App() {
  const [answer, setAnswer] = useState(42);
  const [depth, setDepth] = useState(3);

  const [opToggles, setOpToggle] = useOpToggles();

  const getOpList = () =>
    opLabels.filter(({ op }) => opToggles[op]).map(({ op }) => op);

  const [equation, setEquation] = useState(
    getEquation(answer, depth, getOpList())
  );
  const newEquation = () => {
    setEquation(getEquation(answer, depth, getOpList()));
  };

  return (
    <>
      <FormGroup>
        {opLabels.map(({ label, op }) => (
          <FormControlLabel
            key={label}
            control={
              <Checkbox
                checked={opToggles[op]}
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
        <button onClick={newEquation}>New Equation</button>
      </div>
    </>
  );
}

export default App;
