use rand::seq::SliceRandom;
use std::fmt::{Display, Error};
use wasm_bindgen::prelude::*;

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
}

impl MathOp {
    // Higher value => lower precedence
    fn precedence(&self) -> i32 {
        match self {
            MathOp::Const(_) | MathOp::Div => 0,
            MathOp::Mul => 1,
            MathOp::Add | MathOp::Sub => 2,
        }
    }
}

impl Display for MathOp {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MathOp::Const(Some(value)) => f.write_str(value.to_string().as_str()),
            MathOp::Add => f.write_str("+"),
            MathOp::Sub => f.write_str("-"),
            MathOp::Mul => f.write_str("\\times"),
            _ => Err(Error),
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

fn expand_node(node: &mut MathNode, max_depth: i32, ops: &[MathOp], mut settings: EngineFlags) {
    if node.depth == max_depth {
        return;
    }

    let filtered_ops: Vec<MathOp> = ops
        .iter()
        .filter_map(|&op| {
            if op == MathOp::Div && settings.division_parent && !settings.allow_stacked_division {
                return None;
            }

            Some(op)
        })
        .collect();

    node.op = *filtered_ops
        .choose(&mut rand::thread_rng())
        .unwrap_or(&MathOp::Const(None));

    settings.division_parent = node.op == MathOp::Div;

    let child_count = match node.op {
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

fn evaluate_node(node: &mut MathNode, value: i32) -> Result<(), String> {
    match node.op {
        MathOp::Add => {
            if value > 1 {
                let left = 1 + rand::random::<i32>().abs() % (value - 1);
                let right = value - left;

                evaluate_node(&mut node.children[0], left)?;
                evaluate_node(&mut node.children[1], right)?;
            } else {
                node.op = MathOp::Const(Some(1));
            }
        }
        MathOp::Sub => {
            let left = value + 1 + rand::random::<i32>().abs() % value;
            let right = left - value;

            evaluate_node(&mut node.children[0], left)?;
            evaluate_node(&mut node.children[1], right)?;
        }
        MathOp::Mul => {
            let divisors = (2..value).filter(|i| value % i == 0).collect::<Vec<i32>>();

            if let Some(&left) = divisors.choose(&mut rand::thread_rng()) {
                let right = value / left;

                evaluate_node(&mut node.children[0], left)?;
                evaluate_node(&mut node.children[1], right)?;
            } else {
                node.op = MathOp::Const(Some(value));
            }
        }
        MathOp::Div => {
            let bottom = ((value as f64).sqrt().ceil() as i32) + 1;
            let top = value * bottom;

            evaluate_node(&mut node.children[0], top)?;
            evaluate_node(&mut node.children[1], bottom)?;
        }
        MathOp::Const(None) => {
            node.op = MathOp::Const(Some(value));
        }
        MathOp::Const(Some(_)) => {
            return Err("Constant nodes with vaules should not be evaluated".to_string());
        }
    }

    Ok(())
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
        MathOp::Const(Some(value)) => Ok(value.to_string()),
        MathOp::Add | MathOp::Mul => {
            let left = format_child(0, this_prec)?;
            let right = format_child(1, this_prec)?;

            Ok(format!("{} {} {}", left, node.op, right))
        }
        MathOp::Sub => {
            let left = format_child(0, this_prec)?;
            let right = format_child(1, 0)?;

            Ok(format!("{} {} {}", left, node.op, right))
        }
        MathOp::Div => {
            let left = format_child(0, 10000)?;
            let right = format_child(1, 10000)?;

            Ok(format!("\\frac{{{}}}{{{}}}", left, right))
        }
        MathOp::Const(None) => Err("Cannot format empy constant".to_string()),
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
            "allowStackedDiv" => flags.allow_stacked_division = true,
            _ => println!("Unknown toggle '{}'", toggle),
        }
    }

    let mut root = MathNode::new(1);

    expand_node(&mut root, depth, &ops, flags);

    if let Err(msg) = evaluate_node(&mut root, answer) {
        return msg;
    }

    match format_node(&root) {
        Ok(tex) => tex,
        Err(msg) => msg,
    }
}
