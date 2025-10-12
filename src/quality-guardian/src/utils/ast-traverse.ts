import { TSESTree } from '@typescript-eslint/typescript-estree';

type Visitor = {
    [key in TSESTree.AST_NODE_TYPES]?: (node: TSESTree.Node, context: TraversalContext) => void;
};

export interface TraversalContext {
    depth: number;
    parent: TSESTree.Node | null;
}

export function visitorTraverse(node: TSESTree.Node, visitor: Visitor, parent: TSESTree.Node | null = null, depth = 0): void {
    if (!node) return;

    const context: TraversalContext = { parent, depth };

    if (visitor[node.type]) {
        visitor[node.type]!(node, context);
    }

    const nextDepth = isNestingNode(node) ? depth + 1 : depth;

    for (const key in node) {
        if (key === 'parent' || !Object.prototype.hasOwnProperty.call(node, key)) {
            continue;
        }

        const child = (node as any)[key];
        if (typeof child === 'object' && child !== null) {
            if (Array.isArray(child)) {
                child.forEach(item => {
                    if (item && typeof item.type === 'string') {
                        visitorTraverse(item, visitor, node, nextDepth);
                    }
                });
            } else if (typeof child.type === 'string') {
                visitorTraverse(child, visitor, node, nextDepth);
            }
        }
    }
}

function isNestingNode(node: TSESTree.Node): boolean {
    return (
        node.type === TSESTree.AST_NODE_TYPES.IfStatement ||
        node.type === TSESTree.AST_NODE_TYPES.ForStatement ||
        node.type === TSESTree.AST_NODE_TYPES.ForInStatement ||
        node.type === TSESTree.AST_NODE_TYPES.ForOfStatement ||
        node.type === TSESTree.AST_NODE_TYPES.WhileStatement ||
        node.type === TSESTree.AST_NODE_TYPES.SwitchStatement
    );
}
