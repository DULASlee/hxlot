import type { ModuleNode } from './dependency-graph.js';

export class Tarjan {
  private readonly graph: Map<string, ModuleNode>;
  private index: number = 0;
  private readonly stack: ModuleNode[] = [];
  private readonly onStack: Map<string, boolean> = new Map();
  private readonly indices: Map<string, number> = new Map();
  private readonly lowLink: Map<string, number> = new Map();
  private readonly sccs: ModuleNode[][] = [];

  constructor(graph: Map<string, ModuleNode>) {
    this.graph = graph;
  }

  public findSCCs(): ModuleNode[][] {
    for (const node of this.graph.values()) {
      if (!this.indices.has(node.id)) {
        this.strongConnect(node);
      }
    }
    return this.sccs.filter(scc => scc.length > 1); // Only return cycles
  }

  private strongConnect(node: ModuleNode): void {
    this.indices.set(node.id, this.index);
    this.lowLink.set(node.id, this.index);
    this.index++;
    this.stack.push(node);
    this.onStack.set(node.id, true);

    for (const depId of node.dependencies) {
      const successor = this.graph.get(depId);
      if (!successor || successor.isExternal) continue;

      if (!this.indices.has(successor.id)) {
        this.strongConnect(successor);
        this.lowLink.set(node.id, Math.min(this.lowLink.get(node.id)!, this.lowLink.get(successor.id)!));
      } else if (this.onStack.get(successor.id)) {
        this.lowLink.set(node.id, Math.min(this.lowLink.get(node.id)!, this.indices.get(successor.id)!));
      }
    }

    if (this.lowLink.get(node.id) === this.indices.get(node.id)) {
      const scc: ModuleNode[] = [];
      let w: ModuleNode;
      do {
        w = this.stack.pop()!;
        this.onStack.set(w.id, false);
        scc.push(w);
      } while (node.id !== w.id);
      
      if (scc.length > 1 || this.hasSelfReference(scc[0])) {
        this.sccs.push(scc);
      }
    }
  }

  private hasSelfReference(node: ModuleNode): boolean {
    return node.dependencies.has(node.id);
  }
}
