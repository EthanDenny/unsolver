const random = (a: number, b: number) => {
  return a + Math.floor(Math.random() * (b - a + 1));
};

const choose = (choices: any[]) => {
  const index = random(0, choices.length - 1);
  return choices[index];
};

enum MathOp {
  Add = "+",
  Sub = "-",
  Mul = "*",
  Const = "",
}

type MathNode = {
  op: MathOp;
  value?: number;
  left?: MathNode;
  right?: MathNode;
  depth: number;
};

const newNode = (depth: number = 1) => {
  return { depth, op: MathOp.Const };
};

const expandNode = (node: MathNode, max_depth: number, ops: string[]) => {
  if (node.depth == max_depth) {
    return;
  }

  node.op = choose(ops);

  node.left = newNode(node.depth + 1);
  if (random(0, 1) == 1) {
    expandNode(node.left, max_depth, ops);
  }

  node.right = newNode(node.depth + 1);
  if (random(0, 1) == 1) {
    expandNode(node.right, max_depth, ops);
  }
};

let evals = new Map<MathOp, (node: MathNode, value: number) => void>();

evals.set(MathOp.Add, (node: MathNode, value: number) => {
  if (value > 1) {
    const left = random(1, value - 1);
    const right = value - left;

    evaluateNode(node.left!, left);
    evaluateNode(node.right!, right);
  } else {
    node.op = MathOp.Const;
    node.value = 1;
  }
});

evals.set(MathOp.Sub, (node: MathNode, value: number) => {
  const left = random(value + 1, value * 2);
  const right = left - value;

  evaluateNode(node.left!, left);
  evaluateNode(node.right!, right);
});

evals.set(MathOp.Mul, (node: MathNode, value: number) => {
  const left = value;
  const right = 1;

  evaluateNode(node.left!, left);
  evaluateNode(node.right!, right);
});

evals.set(MathOp.Const, (node: MathNode, value: number) => {
  node.value = value;
});

const evaluateNode = (node: MathNode, value: number) => {
  evals.get(node.op!)!(node, value);
};

const renderOp = (op: MathOp) => {
  if (op == MathOp.Mul) {
    return "\\times";
  } else {
    return op;
  }
};

const formatNode = (node: MathNode, depth: number = 1): string => {
  if (node.op == MathOp.Const) {
    return `${node.value}`;
  } else {
    return `(${formatNode(node.left!, depth + 1)} ${renderOp(
      node.op
    )} ${formatNode(node.right!, depth + 1)})`;
  }
};

export const getEquation = (answer: number, depth: number, ops: string[]) => {
  let root = newNode();
  expandNode(root, depth, ops);
  evaluateNode(root, answer);
  return formatNode(root, depth);
};
