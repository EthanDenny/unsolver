import random


ops = ["+", "-"]


class Node:
    def __init__(self, depth=1):
        self.op = None
        self.value = None
        self.left = None
        self.right = None
        self.depth = depth


while True:
    ANSWER = input("Please enter an answer: ")

    try:
        ANSWER = int(ANSWER)
        break
    except:
        print("That's not a number!")

while True:
    DEPTH = input("Please enter a max depth: ")

    try:
        DEPTH = int(DEPTH)
        break
    except:
        print("That's not a number!")


ROOT = Node()


def expand_node(node):
    if node.depth == DEPTH:
        return

    node.op = random.choice(ops)

    node.left = Node(node.depth + 1)
    if random.randint(1, 10) >= node.depth:
        expand_node(node.left)

    node.right = Node(node.depth + 1)
    if random.randint(1, 10) >= node.depth:
        expand_node(node.right)


def evaluate_node(node, value):
    if node.op == "+":
        if value > 1:
            left = random.randint(1, value - 1)
            right = value - left

            evaluate_node(node.left, left)
            evaluate_node(node.right, right)
        else:
            node.op = None
            node.value = 1
    elif node.op == "-":
        left = random.randint(value + 1, value * 2)
        right = left - value

        evaluate_node(node.left, left)
        evaluate_node(node.right, right)
    else:
        node.value = value


def print_node(node, depth=1):
    if node.op == None:
        s = node.value
    else:
        s = f"({print_node(node.left, depth + 1)} {node.op} {print_node(node.right, depth + 1)})"

    if depth == 1:
        print(s)
    else:
        return s


expand_node(ROOT)
evaluate_node(ROOT, ANSWER)
print_node(ROOT)
