import random

TECHNIQUES = {
    "addition": True,
    "subtraction": True,
    "multiplication": True,
    "division": False,
}

DEPTH = 3


class Node:
    def __init__(self, depth=1):
        self.left = None
        self.right = None
        self.depth = depth


while True:
    x = input("Please enter a number: ")

    try:
        x = int(x)
        break
    except:
        print("That's not a number!")

ROOT = Node()
DEPTH = x
NEEDS_CHILD = [ROOT]


def expand_node(node):
    if node.depth == DEPTH:
        return

    if random.randint(0, node.depth) != 0:
        node.left = Node(node.depth + 1)
        expand_node(node.left)

    if random.randint(0, node.depth) != 0:
        node.right = Node(node.depth + 1)
        expand_node(node.right)


def print_node(node, depth=1):
    for _ in range(depth - 1):
        print("  ", end="")

    if node == None:
        print("C")
    else:
        print(depth)
        print_node(node.left, depth + 1)
        print_node(node.right, depth + 1)


expand_node(ROOT)
print_node(ROOT)

print(f"Your number is {x}")
