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

export const useEquation = (
  answer: number,
  depth: number,
  toggles: string[]
): [string, () => void] => {
  const [equation, setEquation] = useState(" ");
  const [equationId, setEquationId] = useState(0);

  useEffect(() => {
    init().then(() => {
      setEquation(get_equation(answer, depth, toggles));
    });
  }, [equationId]);

  const rerollEquation = () => {
    setEquationId(equationId == 0 ? 1 : 0);
  };

  return [equation, rerollEquation];
};
