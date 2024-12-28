const ops = ["+", "-", "*"];

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

let answer = 42;
let depth = 3;

let root = newNode();

const expandNode = (node: MathNode) => {
  if (node.depth == depth) {
    return;
  }

  node.op = choose(ops);

  node.left = newNode(node.depth + 1);
  if (random(0, 1) == 1) {
    expandNode(node.left);
  }

  node.right = newNode(node.depth + 1);
  if (random(0, 1) == 1) {
    expandNode(node.right);
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

const formatNode = (node: MathNode, depth: number = 1) => {
  if (node.op === undefined) {
    return node.value;
  } else {
    return `(${formatNode(node.left!, depth + 1)} ${renderOp(
      node.op
    )} ${formatNode(node.right!, depth + 1)})`;
  }
};

expandNode(root);
evaluateNode(root, answer);
console.log(formatNode(root));
