import Latex from "react-latex-next";
import { useState } from "react";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { useEquation, useToggles } from "./hooks";
import "./App.css";
import "../node_modules/katex/dist/katex.css";

const toggleLabels: [string, string, boolean][] = [
  ["Addition", "allowAdd", true],
  ["Subtraction", "allowSub", true],
  ["Multiplication", "allowMul", true],
  ["Division", "allowDiv", true],
  ["Allow stacked division", "allowStackedDiv", false],
];

function App() {
  const [answer, setAnswer] = useState(100 + Math.floor(Math.random() * 900));
  const [depth, setDepth] = useState(3);
  const [activeToggles, togglesMap, setToggle] = useToggles(
    toggleLabels.map(([_, key, defaultValue]) => [key, defaultValue])
  );
  const [equation, rerollEquation] = useEquation(answer, depth, activeToggles);

  return (
    <>
      <FormGroup>
        {toggleLabels.map(([label, key, _]) => (
          <FormControlLabel
            key={label}
            control={
              <Checkbox
                checked={togglesMap[key]}
                onChange={(e) => setToggle(key, e.target.checked)}
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
            rerollEquation();
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
            rerollEquation();
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
