const random = (a: number, b: number) => {
  return a + Math.floor(Math.random() * (b - a + 1));
};

const choose = (choices: any[]) => {
  const index = random(0, choices.length - 1);
  return choices[index];
};

const getDivisors = (n: number) => {
  let divisors = [];

  for (let i = 2; i < n; i++) {
    if (n % i == 0) {
      divisors.push(i);
    }
  }

  return divisors;
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

interface MathNode {
  op: MathOp;
  value?: number;
  children: MathNode[];
  depth: number;
}

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
  const divisors = getDivisors(value);

  console.log(value, divisors);

  if (divisors.length > 1) {
    const left = choose(divisors);
    const right = value / left;

    evaluateNode(node.children[0], left);
    evaluateNode(node.children[1], right);
  } else {
    node.op = MathOp.Const;
    node.value = value;
  }
});

evals.set(MathOp.Div, (node: MathNode, value: number) => {
  const bottom = Math.ceil(Math.sqrt(value)) + 1;
  const top = value * bottom;

  evaluateNode(node.children[0], top);
  evaluateNode(node.children[1], bottom);
});

evals.set(MathOp.Sin, (node: MathNode, value: number) => {
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

// Higher number => lower precedence
const precedence = (op: MathOp) => {
  switch (op) {
    case MathOp.Const:
    case MathOp.Sin:
    case MathOp.Cos:
    case MathOp.Div:
      return 0;
    case MathOp.Mul:
      return 1;
    case MathOp.Add:
    case MathOp.Sub:
      return 2;
    default:
      return 3;
  }
};

const formatNode = (node: MathNode, depth: number = 1): string => {
  const formatChild = (index: number, prec: number = precedence(node.op)) => {
    let formatted = formatNode(node.children[index], depth + 1);

    if (precedence(node.children[index].op) > prec) {
      return `(${formatted})`;
    } else {
      return formatted;
    }
  };

  switch (node.op) {
    case MathOp.Const:
      return `${node.value}`;
    case MathOp.Add: {
      const left = formatChild(0);
      const right = formatChild(0);

      return `${left} ${node.op} ${right}`;
    }
    case MathOp.Sub: {
      const left = formatChild(0);
      const right = formatChild(1, 0);

      return `${left} ${node.op} ${right}`;
    }
    case MathOp.Mul: {
      let left = formatChild(0);
      let right = formatChild(1);

      return `${left} ${node.op} ${right}`;
    }
    case MathOp.Sin:
    case MathOp.Cos: {
      const inner = formatChild(0, 10000);
      return `\\${node.op}(${inner})`;
    }
    case MathOp.Div: {
      const left = formatChild(0, 10000);
      const right = formatChild(1, 10000);
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
