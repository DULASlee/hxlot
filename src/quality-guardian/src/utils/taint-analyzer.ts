import type { Identifier, Node } from '@babel/types';
import type { CfgNode, ControlFlowGraph } from './control-flow-graph.js';

interface TaintSource {
  type: 'source';
  api: string; // e.g., 'setInterval'
  resourceVar: string; // The variable holding the resource
}

interface TaintSink {
  type: 'sink';
  api: string; // e.g., 'clearInterval'
  resourceVar: string; // The variable being cleaned
}

type TaintFact = TaintSource | TaintSink;

// A map from a variable name to its tainted state (true if tainted)
type TaintState = Map<string, boolean>;

export interface Leak {
  variable: string;
  sourceApi: string;
  node: CfgNode;
}

export class TaintAnalyzer {
  private readonly cfg: ControlFlowGraph;
  private readonly worklist: CfgNode[];
  private readonly inStates: Map<number, TaintState> = new Map();
  private readonly outStates: Map<number, TaintState> = new Map();

  constructor(cfg: ControlFlowGraph) {
    this.cfg = cfg;
    this.worklist = [...this.cfg.getAllNodes()].reverse(); // Post-order traversal
  }

  public analyze(): Leak[] {
    // Initialize states
    for (const node of this.cfg.getAllNodes()) {
      this.inStates.set(node.id, new Map());
      this.outStates.set(node.id, new Map());
    }

    let changed = true;
    while (changed) {
      changed = false;
      for (const node of this.worklist) {
        const oldOut = new Map(this.outStates.get(node.id)!);

        // Merge predecessors' out-states to get current in-state
        const inState: TaintState = new Map();
        for (const pred of node.predecessors) {
          this.outStates.get(pred.id)!.forEach((value, key) => {
            if (!inState.has(key)) inState.set(key, value);
          });
        }
        this.inStates.set(node.id, inState);

        // Apply transfer function
        const outState = this.transfer(node, inState);
        this.outStates.set(node.id, outState);

        // Check if state changed
        if (!this.areMapsEqual(oldOut, outState)) {
          changed = true;
        }
      }
    }

    // Check for leaks at the exit node
    const exitInState = this.inStates.get(this.cfg.getExitNode().id)!;
    const leaks: Leak[] = [];
    exitInState.forEach((isTainted, variable) => {
      if (isTainted) {
        // This is a simplified leak report. A real one would trace back to the source.
        leaks.push({ variable, sourceApi: 'unknown', node: this.cfg.getExitNode() });
      }
    });

    return leaks;
  }

  private transfer(node: CfgNode, inState: TaintState): TaintState {
    const outState = new Map(inState);
    const fact = this.extractTaintFact(node.astNode);

    if (fact?.type === 'source') {
      outState.set(fact.resourceVar, true); // Mark as tainted
    } else if (fact?.type === 'sink') {
      outState.set(fact.resourceVar, false); // Mark as cleansed
    }

    return outState;
  }

  private extractTaintFact(astNode?: Node): TaintFact | null {
    // Highly simplified pattern matching for demonstration
    if (astNode?.type === 'VariableDeclaration') {
      const decl = astNode.declarations[0];
      if (decl.init?.type === 'CallExpression') {
        const callee = decl.init.callee;
        let calleeName = '';
        if (callee.type === 'Identifier') {
          calleeName = callee.name;
        } else if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
          calleeName = `${(callee.object as Identifier).name}.${callee.property.name}`;
        }

        const sourceApiMap: Record<string, string> = {
          'setInterval': 'timer',
          'setTimeout': 'timer',
          'addEventListener': 'event',
          'document.addEventListener': 'event',
          'window.addEventListener': 'event',
          'watch': 'watch',
          'watchEffect': 'watch',
        };

        if (Object.keys(sourceApiMap).includes(calleeName)) {
          if (decl.id.type === 'Identifier') {
            return { type: 'source', api: calleeName, resourceVar: decl.id.name };
          }
        }
      }
    } else if (astNode?.type === 'ExpressionStatement' && astNode.expression.type === 'CallExpression') {
      const callee = astNode.expression.callee;
      let calleeName = '';
      if (callee.type === 'Identifier') {
        calleeName = callee.name;
      } else if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
        calleeName = `${(callee.object as Identifier).name}.${callee.property.name}`;
      }

      if (['clearInterval', 'clearTimeout', 'removeEventListener', 'document.removeEventListener', 'window.removeEventListener'].includes(calleeName)) {
        const resourceVar = astNode.expression.arguments[0];
        if (resourceVar?.type === 'Identifier') {
          return { type: 'sink', api: calleeName, resourceVar: resourceVar.name };
        }
      } else if (calleeName === 'onBeforeUnmount' && astNode.expression.arguments[0]?.type === 'ArrowFunctionExpression') {
        // Simplistic: assume any cleanup happens inside onBeforeUnmount
        const body = astNode.expression.arguments[0].body;
        if (body.type === 'BlockStatement') {
          for (const stmt of body.body) {
            if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'CallExpression') {
              const cleanupCallee = stmt.expression.callee;
              let cleanupCalleeName = '';
              if (cleanupCallee.type === 'Identifier') {
                cleanupCalleeName = cleanupCallee.name;
              }
              const arg = stmt.expression.arguments[0];
              if (arg?.type === 'Identifier') {
                return { type: 'sink', api: cleanupCalleeName, resourceVar: arg.name };
              }
            }
          }
        }
      }
    }
    return null;
  }

  private areMapsEqual(map1: TaintState, map2: TaintState): boolean {
    if (map1.size !== map2.size) return false;
    for (const [key, value] of map1) {
      if (map2.get(key) !== value) return false;
    }
    return true;
  }
}
