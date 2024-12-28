const random = (a: number, b: number) => {
  return a + Math.floor(Math.random() * (b - a + 1));
};

const choose = (choices: any[]) => {
  const index = random(0, choices.length - 1);
  return choices[index];
};

export enum MathOp {
  Const = "",
  Add = "+",
  Sub = "-",
  Mul = "\\times",
  Div = "frac",
  Sin = "sin",
  Cos = "cos",
}

type MathNode = {
  op: MathOp;
  value?: number;
  children: MathNode[];
  depth: number;
};

const newNode = (depth: number = 1) => {
  return { children: [], depth, op: MathOp.Const };
};

const expandNode = (node: MathNode, max_depth: number, ops: MathOp[]) => {
  if (node.depth == max_depth) {
    return;
  }

  node.op = choose(ops);

  let child_count = 0;

  switch (node.op) {
    case MathOp.Sin:
    case MathOp.Cos: {
      child_count = 1;
      break;
    }
    case MathOp.Add:
    case MathOp.Sub:
    case MathOp.Mul:
    case MathOp.Div: {
      child_count = 2;
      break;
    }
  }

  for (let i = 0; i < child_count; i++) {
    node.children[i] = newNode(node.depth + 1);
    if (random(0, 1) == 1) {
      expandNode(node.children[i], max_depth, ops);
    }
  }
};

let evals = new Map<MathOp, (node: MathNode, value: number) => void>();

evals.set(MathOp.Add, (node: MathNode, value: number) => {
  if (value > 1) {
    const left = random(1, value - 1);
    const right = value - left;

    evaluateNode(node.children[0], left);
    evaluateNode(node.children[1], right);
  } else {
    node.op = MathOp.Const;
    node.value = 1;
  }
});

evals.set(MathOp.Sub, (node: MathNode, value: number) => {
  const left = random(value + 1, value * 2);
  const right = left - value;

  evaluateNode(node.children[0], left);
  evaluateNode(node.children[1], right);
});

evals.set(MathOp.Mul, (node: MathNode, value: number) => {
  const left = value;
  const right = 1;

  evaluateNode(node.children[0], left);
  evaluateNode(node.children[1], right);
});

evals.set(MathOp.Div, (node: MathNode, value: number) => {
  const left = value;
  const right = 1;

  evaluateNode(node.children[0], left);
  evaluateNode(node.children[1], right);
});

evals.set(MathOp.Sin, (node: MathNode, value: number) => {
  console.log(value);
  const inner = Math.asin(value);
  evaluateNode(node.children[0], inner);
});

evals.set(MathOp.Cos, (node: MathNode, value: number) => {
  const inner = Math.acos(value);
  evaluateNode(node.children[0], inner);
});

evals.set(MathOp.Const, (node: MathNode, value: number) => {
  node.value = value;
});

const evaluateNode = (node: MathNode, value: number) => {
  evals.get(node.op!)!(node, value);
};

const formatNode = (node: MathNode, depth: number = 1): string => {
  switch (node.op) {
    case MathOp.Const:
      return `${node.value}`;
    case MathOp.Add:
    case MathOp.Sub:
    case MathOp.Mul: {
      const left = formatNode(node.children[0], depth + 1);
      const right = formatNode(node.children[1], depth + 1);
      return `(${left} ${node.op} ${right})`;
    }
    case MathOp.Sin:
    case MathOp.Cos: {
      const inner = formatNode(node.children[0], depth + 1);
      return `\\${node.op}(${inner})`;
    }
    case MathOp.Div: {
      const left = formatNode(node.children[0], depth + 1);
      const right = formatNode(node.children[1], depth + 1);
      return `\\frac{${left}}{${right}}`;
    }
  }
};

export const getEquation = (answer: number, depth: number, ops: MathOp[]) => {
  let root = newNode();
  expandNode(root, depth, ops);
  evaluateNode(root, answer);
  return formatNode(root, depth);
};
