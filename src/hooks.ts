import { useState, useEffect } from "react";
import init, { get_equation } from "unsolver-rs";

export const useToggles = (
  toggleDefaults: [string, boolean][]
): [
  string[],
  Record<string, boolean>,
  (key: string, value: boolean) => void
] => {
  const [togglesMap, setTogglesMap] = useState<Record<string, boolean>>(
    Object.fromEntries(toggleDefaults)
  );

  const setToggle = (key: string, value: boolean) => {
    setTogglesMap((prev) => ({ ...prev, [key]: value }));
  };

  const activeToggles = Object.keys(togglesMap).filter(
    (key) => togglesMap[key]
  );

  return [activeToggles, togglesMap, setToggle];
};

const wasmPath = new URL(
  "../node_modules/unsolver-rs/unsolver_rs_bg.wasm",
  import.meta.url
);

export const useEquation = (
  answer: number,
  depth: number,
  toggles: string[]
): [string, () => void] => {
  const [equation, setEquation] = useState(" ");
  const [equationId, setEquationId] = useState(0);

  useEffect(() => {
    init({ module_or_path: wasmPath }).then(() => {
      setEquation(get_equation(answer, depth, toggles));
    });
  }, [equationId]);

  const rerollEquation = () => {
    setEquationId(equationId == 0 ? 1 : 0);
  };

  return [equation, rerollEquation];
};
