import Latex from "react-latex-next";
import { useState } from "react";
import { useEquation, useToggles } from "./hooks";
import "./App.css";
import "../node_modules/katex/dist/katex.css";

// Label, toggle, default value, enabled if
const toggleLabels: [string, string, boolean, string?][] = [
  ["Addition", "allowAdd", true],
  ["Subtraction", "allowSub", true],
  ["Multiplication", "allowMul", true],
  ["Division", "allowDiv", true],
  ["Square roots", "allowSquareRoots", true],
  ["Powers of 2", "allowPow2", true],
  ["Allow stacked division", "allowStackedDiv", false, "allowDiv"],
  ["Allow powers in roots", "allowPowersInRoots", false, "allowPow2"],
];

function App() {
  const [answer, setAnswer] = useState(100 + Math.floor(Math.random() * 900));
  const [depth, setDepth] = useState(3);
  const [activeToggles, togglesMap, setToggle] = useToggles(
    toggleLabels.map(([_, key, defaultValue]) => [key, defaultValue])
  );
  const [equation, rerollEquation] = useEquation(answer, depth, activeToggles);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col gap-4">
        {toggleLabels.map(([label, key, _, enabledIf]) => (
          <div key={label} className="flex gap-2">
            <input
              disabled={enabledIf ? !togglesMap[enabledIf] : false}
              type="checkbox"
              id={label}
              checked={togglesMap[key]}
              onChange={(e) => setToggle(key, e.target.checked)}
            />
            <label htmlFor={label}>{label}</label>
          </div>
        ))}
      </div>
      <h1 className="text-5xl h-[82px]">
        <Latex>{"$" + equation + "$"}</Latex>
      </h1>
      <div className="flex gap-4">
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
      <div className="flex gap-4">
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
      <div className="flex gap-4">
        <button onClick={rerollEquation}>New Equation</button>
      </div>
    </div>
  );
}

export default App;
