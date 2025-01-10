use rand::seq::SliceRandom;
use wasm_bindgen::prelude::*;

#[derive(Clone, Copy)]
struct EngineFlags {
    allow_powers_of_2: bool,
    allow_powers_in_roots: bool,
    allow_stacked_division: bool,
    division_parent: bool,
    sqrt_parent: bool,
}

impl EngineFlags {
    fn new() -> EngineFlags {
        EngineFlags {
            allow_powers_of_2: false,
            allow_powers_in_roots: false,
            allow_stacked_division: false,
            division_parent: false,
            sqrt_parent: false,
        }
    }
}

#[derive(PartialEq, Clone, Copy, Debug)]
enum MathOp {
    Null,
    Const,
    Add,
    Sub,
    Mul,
    Div,
    Pow2,
    Sqrt,
}

impl MathOp {
    // Higher value => lower precedence
    fn precedence(&self) -> i32 {
        match self {
            MathOp::Const => 0,
            MathOp::Pow2 | MathOp::Sqrt => 1,
            MathOp::Div => 2,
            MathOp::Mul => 3,
            MathOp::Add | MathOp::Sub => 4,
            MathOp::Null => panic!("{self:?} has no precedence"),
        }
    }

    fn symbol(&self) -> Result<String, String> {
        match self {
            MathOp::Add => Ok("+".to_string()),
            MathOp::Sub => Ok("-".to_string()),
            MathOp::Mul => Ok("\\times".to_string()),
            _ => Err(format!("The op {:?} has no associated symbol", self)),
        }
    }
}

#[derive(Debug)]
struct MathNode {
    op: MathOp,
    value: i32,
    children: Vec<MathNode>,
    depth: i32,
}

impl MathNode {
    fn new(op: MathOp, value: i32, depth: i32) -> MathNode {
        MathNode {
            op,
            value,
            children: Vec::new(),
            depth,
        }
    }
}

fn is_perfect_square(n: i32) -> bool {
    (n as f64).sqrt().fract() <= f64::EPSILON
}

fn expand_node(node: &mut MathNode, max_depth: i32, ops: &[MathOp], mut settings: EngineFlags) {
    if node.depth == max_depth {
        return;
    }

    let mut filtered_ops: Vec<MathOp> = ops
        .iter()
        .filter_map(|&op| {
            if op == MathOp::Div && settings.division_parent && !settings.allow_stacked_division {
                return None;
            }

            if op == MathOp::Sqrt && settings.sqrt_parent {
                return None;
            }

            if op == MathOp::Pow2 && settings.sqrt_parent && !settings.allow_powers_in_roots {
                return None;
            }

            Some(op)
        })
        .collect();

    if settings.allow_powers_of_2 && is_perfect_square(node.value) {
        filtered_ops.push(MathOp::Pow2)
    }

    if filtered_ops.len() > 0 {
        node.op = *filtered_ops.choose(&mut rand::thread_rng()).unwrap();
    } else {
        node.op = MathOp::Const;
        return;
    }

    settings.division_parent = node.op == MathOp::Div;
    settings.sqrt_parent = node.op == MathOp::Sqrt;

    let mut create_child = |value: i32| {
        let mut child = MathNode::new(MathOp::Null, value, node.depth + 1);

        if rand::random::<bool>() {
            expand_node(&mut child, max_depth, &ops, settings);
        }

        if child.op == MathOp::Null {
            child.op = MathOp::Const;
        }

        node.children.push(child);
    };

    match node.op {
        MathOp::Add => {
            if node.value > 1 {
                let left = 1 + rand::random::<i32>().abs() % (node.value - 1);
                let right = node.value - left;

                create_child(left);
                create_child(right);
            } else {
                node.op = MathOp::Const;
                node.value = 1;
            }
        }
        MathOp::Sub => {
            let left = node.value + 1 + rand::random::<i32>().abs() % node.value;
            let right = left - node.value;

            create_child(left);
            create_child(right);
        }
        MathOp::Mul => {
            let divisors = (2..node.value)
                .filter(|i| node.value % i == 0)
                .collect::<Vec<i32>>();

            if let Some(&left) = divisors.choose(&mut rand::thread_rng()) {
                let right = node.value / left;

                create_child(left);
                create_child(right);
            } else {
                node.op = MathOp::Const;
            }
        }
        MathOp::Pow2 => {
            create_child((node.value as f64).sqrt() as i32);
        }
        MathOp::Sqrt => {
            create_child(node.value * node.value);
        }
        MathOp::Div => {
            let bottom = ((node.value as f64).sqrt().ceil() as i32) + 1;
            let top = node.value * bottom;

            create_child(top);
            create_child(bottom);
        }
        MathOp::Null | MathOp::Const => {}
    }
}

fn format_node(node: &MathNode) -> Result<String, String> {
    let this_prec = node.op.precedence();

    let format_child = |index: usize, prec: i32| -> Result<String, String> {
        let formatted = format_node(&node.children[index])?;

        if node.children[index].op.precedence() > prec {
            Ok(format!("({})", formatted))
        } else {
            Ok(formatted)
        }
    };

    match node.op {
        MathOp::Const => Ok(node.value.to_string()),
        MathOp::Add | MathOp::Mul => {
            let left = format_child(0, this_prec)?;
            let right = format_child(1, this_prec)?;

            Ok(format!("{} {} {}", left, node.op.symbol()?, right))
        }
        MathOp::Sub => {
            let left = format_child(0, this_prec)?;
            let right = format_child(1, 0)?;

            Ok(format!("{} {} {}", left, node.op.symbol()?, right))
        }
        MathOp::Div => {
            let left = format_child(0, 10000)?;
            let right = format_child(1, 10000)?;

            Ok(format!("\\frac{{{left}}}{{{right}}}"))
        }
        MathOp::Pow2 => {
            let inner = format_child(0, this_prec)?;
            Ok(format!("{{{inner}}}^2"))
        }
        MathOp::Sqrt => {
            let inner = format_child(0, 10000)?;
            Ok(format!("\\sqrt{{{inner}}}"))
        }
        _ => Ok(format!("{:?}", node.op)),
    }
}

#[wasm_bindgen]
pub fn get_equation(answer: i32, depth: i32, toggles: Vec<String>) -> String {
    let mut ops = Vec::new();
    let mut flags = EngineFlags::new();

    for toggle in toggles {
        match toggle.as_str() {
            "allowAdd" => ops.push(MathOp::Add),
            "allowSub" => ops.push(MathOp::Sub),
            "allowMul" => ops.push(MathOp::Mul),
            "allowDiv" => ops.push(MathOp::Div),
            "allowPow2" => flags.allow_powers_of_2 = true,
            "allowPowersInRoots" => flags.allow_powers_in_roots = true,
            "allowSquareRoots" => ops.push(MathOp::Sqrt),
            "allowStackedDiv" => flags.allow_stacked_division = true,
            _ => println!("Unknown toggle '{}'", toggle),
        }
    }

    let mut root = MathNode::new(MathOp::Null, answer, 1);

    expand_node(&mut root, depth, &ops, flags);

    match format_node(&root) {
        Ok(tex) => tex,
        Err(msg) => msg,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_equation() {
        let answer = 42;
        let depth = 3;
        let toggles = vec!["allowAdd", "allowSub", "allowMul", "allowDiv", "allowPow2"];

        println!(
            "{}",
            get_equation(
                answer,
                depth,
                toggles.into_iter().map(|s| s.to_string()).collect()
            )
        )
    }
}
