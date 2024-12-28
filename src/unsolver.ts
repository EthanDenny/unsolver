const random = (a: number, b: number) => {
  return a + Math.floor(Math.random() * (b - a + 1));
};

const choose = (choices: any[]) => {
  const index = random(0, choices.length - 1);
  return choices[index];
};

type MathNode = {
  op?: string;
  value?: number;
  left?: MathNode;
  right?: MathNode;
  depth: number;
};

const newNode = (depth: number = 1) => {
  return { depth };
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

const evaluateNode = (node: MathNode, value: number) => {
  switch (node.op) {
    case "+": {
      if (value > 1) {
        const left = random(1, value - 1);
        const right = value - left;

        evaluateNode(node.left!, left);
        evaluateNode(node.right!, right);
      } else {
        node.op = undefined;
        node.value = 1;
      }

      break;
    }
    case "-": {
      const left = random(value + 1, value * 2);
      const right = left - value;

      evaluateNode(node.left!, left);
      evaluateNode(node.right!, right);

      break;
    }
    case "*": {
      const left = value;
      const right = 1;

      evaluateNode(node.left!, left);
      evaluateNode(node.right!, right);

      break;
    }
    default: {
      node.value = value;
      break;
    }
  }
};

const renderOp = (op: string) => {
  switch (op) {
    case "*":
      return "\\times";
    default:
      return op;
  }
};

const formatNode = (node: MathNode, depth: number = 1): string => {
  if (node.op === undefined) {
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
