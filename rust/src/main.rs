use std::fmt::Display;

#[derive(Clone, Copy)]
struct EngineFlags {
    allow_stacked_division: bool,
    division_parent: bool,
}

impl EngineFlags {
    fn new() -> EngineFlags {
        EngineFlags {
            allow_stacked_division: false,
            division_parent: false,
        }
    }
}

#[derive(PartialEq, Clone, Copy)]
enum MathOp {
    Const(Option<i32>), // If a constant is None, it has not yet been assigned a value
    Add,
    Sub,
    Mul,
    Div,
    Sin,
    Cos,
}

impl Display for MathOp {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if let MathOp::Const(Some(value)) = self {
            f.write_str(value.to_string().as_str())
        } else {
            f.write_str(match self {
                MathOp::Add => "+",
                MathOp::Sub => "-",
                MathOp::Mul => "\\times",
                MathOp::Sin => "sin",
                MathOp::Cos => "cos",
                _ => panic!("{} should not be represented as a string", self),
            })
        }
    }
}

struct MathNode {
    op: MathOp,
    children: Vec<MathNode>,
    depth: i32,
}

impl MathNode {
    fn new(depth: i32) -> MathNode {
        MathNode {
            op: MathOp::Const(None),
            children: Vec::new(),
            depth,
        }
    }
}

// Higher value => lower precedence
fn precedence(op: &MathOp) -> i32 {
    match op {
        MathOp::Const(_) | MathOp::Sin | MathOp::Cos | MathOp::Div => 0,
        MathOp::Mul => 1,
        MathOp::Add | MathOp::Sub => 2,
    }
}

fn choose<'a, T>(choices: &'a Vec<T>) -> &'a T {
    let index = rand::random::<usize>() % choices.len();
    &choices[index]
}

fn expand_node(node: &mut MathNode, max_depth: i32, ops: &Vec<MathOp>, mut settings: EngineFlags) {
    if node.depth == max_depth {
        return;
    }

    let filtered_ops: Vec<MathOp> = ops
        .iter()
        .filter(|op| {
            if **op == MathOp::Div && settings.division_parent && !settings.allow_stacked_division {
                return false;
            }

            true
        })
        .map(|&op| op)
        .collect();

    node.op = *choose(&filtered_ops);

    settings.division_parent = node.op == MathOp::Div;

    let child_count = match node.op {
        MathOp::Sin | MathOp::Cos => 1,
        MathOp::Add | MathOp::Sub | MathOp::Mul | MathOp::Div => 2,
        _ => 0,
    };

    for _ in 0..child_count {
        let mut child = MathNode::new(node.depth + 1);

        if rand::random::<bool>() {
            expand_node(&mut child, max_depth, &ops, settings);
        }

        node.children.push(child);
    }
}

fn evaluate_node(node: &mut MathNode, value: i32) {
    match node.op {
        MathOp::Add => {
            if value > 1 {
                let left = 1 + rand::random::<i32>().abs() % (value - 1);
                let right = value - left;

                evaluate_node(&mut node.children[0], left);
                evaluate_node(&mut node.children[1], right);
            } else {
                node.op = MathOp::Const(Some(1));
            }
        }
        MathOp::Sub => {
            let left = value + 1 + rand::random::<i32>().abs() % value;
            let right = left - value;

            evaluate_node(&mut node.children[0], left);
            evaluate_node(&mut node.children[1], right);
        }
        MathOp::Mul => {
            let divisors: Vec<i32> = (2..value).filter(|i| value % i == 0).collect();

            if divisors.len() > 1 {
                let left = *choose(&divisors);
                let right = value / left;

                evaluate_node(&mut node.children[0], left);
                evaluate_node(&mut node.children[1], right);
            } else {
                node.op = MathOp::Const(Some(value));
            }
        }
        MathOp::Div => {
            let bottom = ((value as f64).sqrt().ceil() as i32) + 1;
            let top = value * bottom;

            evaluate_node(&mut node.children[0], top);
            evaluate_node(&mut node.children[1], bottom);
        }
        MathOp::Sin => {
            let inner = 0;
            evaluate_node(&mut node.children[0], inner);
        }
        MathOp::Cos => {
            let inner = 0;
            evaluate_node(&mut node.children[0], inner);
        }
        MathOp::Const(None) => {
            node.op = MathOp::Const(Some(value));
        }
        MathOp::Const(Some(_)) => {
            panic!("Constant nodes with vaules should not be evaluated")
        }
    }
}

fn format_node(node: &MathNode) -> String {
    let this_prec = precedence(&node.op);

    let format_child = |index: usize, prec: i32| {
        let formatted = format_node(&node.children[index]);

        if precedence(&node.children[index].op) > prec {
            format!("({})", formatted)
        } else {
            formatted
        }
    };

    match node.op {
        MathOp::Const(None) => panic!("Cannot format empy constant"),
        MathOp::Const(Some(value)) => value.to_string(),
        MathOp::Add | MathOp::Mul => {
            let left = format_child(0, this_prec);
            let right = format_child(1, this_prec);

            format!("{} {} {}", left, node.op, right)
        }
        MathOp::Sub => {
            let left = format_child(0, this_prec);
            let right = format_child(1, 0);

            format!("{} {} {}", left, node.op, right)
        }
        MathOp::Sin | MathOp::Cos => {
            let inner = format_child(0, 10000);

            format!("\\{}({})", node.op, inner)
        }
        MathOp::Div => {
            let left = format_child(0, 10000);
            let right = format_child(1, 10000);

            format!("\\frac{{{}}}{{{}}}", left, right)
        }
    }
}

fn get_equation(answer: i32, depth: i32, toggles: Vec<&str>) -> String {
    let mut ops = Vec::new();
    let mut flags = EngineFlags::new();

    for toggle in toggles {
        match toggle {
            "allowAdd" => ops.push(MathOp::Add),
            "allowSub" => ops.push(MathOp::Sub),
            "allowMul" => ops.push(MathOp::Mul),
            "allowDiv" => ops.push(MathOp::Div),
            "allowSin" => ops.push(MathOp::Sin),
            "allowCos" => ops.push(MathOp::Cos),
            "allowStackedDiv" => flags.allow_stacked_division = true,
            _ => println!("Unknown toggle "),
        }
    }

    let mut root = MathNode::new(1);

    expand_node(&mut root, depth, &ops, flags);
    evaluate_node(&mut root, answer);
    return format_node(&root);
}

fn main() {
    let args: Vec<Option<i32>> = std::env::args().map(|s| s.parse::<i32>().ok()).collect();
    let get_arg =
        |index: usize, default| args.get(index).unwrap_or(&Some(default)).unwrap_or(default);

    let answer = get_arg(0, 42);
    let depth = get_arg(1, 3);

    let toggles: Vec<&str> = vec!["allowAdd", "allowSin"];

    let tex = get_equation(answer, depth, toggles);

    println!("{}", tex);
}
