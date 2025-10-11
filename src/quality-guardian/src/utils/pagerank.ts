import type { ModuleNode } from './dependency-graph.js';

export interface PageRankOptions {
  alpha?: number; // Damping factor
  epsilon?: number; // Convergence tolerance
  maxIterations?: number;
}

export class PageRank {
  private readonly graph: Map<string, ModuleNode>;
  private readonly alpha: number;
  private readonly epsilon: number;
  private readonly maxIterations: number;
  private readonly nodeIds: string[];
  private ranks: Map<string, number>;

  constructor(graph: Map<string, ModuleNode>, options: PageRankOptions = {}) {
    this.graph = graph;
    this.alpha = options.alpha ?? 0.85;
    this.epsilon = options.epsilon ?? 0.00001;
    this.maxIterations = options.maxIterations ?? 100;
    this.nodeIds = Array.from(this.graph.keys()).filter(id => !this.graph.get(id)?.isExternal);
    this.ranks = new Map();
  }

  public run(): Map<string, number> {
    const numNodes = this.nodeIds.length;
    if (numNodes === 0) return this.ranks;

    // Initialize ranks
    const initialRank = 1 / numNodes;
    for (const id of this.nodeIds) {
      this.ranks.set(id, initialRank);
    }

    let iteration = 0;
    let delta = Infinity;

    while (delta > this.epsilon && iteration < this.maxIterations) {
      const newRanks = new Map<string, number>();
      let danglingSum = 0;
      delta = 0;

      // Calculate dangling sum
      for (const id of this.nodeIds) {
        const node = this.graph.get(id)!;
        if (this.getInternalDependencies(node).length === 0) {
          danglingSum += this.ranks.get(id)!;
        }
      }

      // Distribute ranks
      for (const id of this.nodeIds) {
        let newRank = (1 - this.alpha) / numNodes + (this.alpha * danglingSum) / numNodes;
        
        const dependents = this.graph.get(id)!.dependents;
        for (const dependentId of dependents) {
          const dependentNode = this.graph.get(dependentId);
          if (dependentNode && !dependentNode.isExternal) {
            const internalDeps = this.getInternalDependencies(dependentNode);
            if (internalDeps.length > 0) {
              newRank += this.alpha * (this.ranks.get(dependentId)! / internalDeps.length);
            }
          }
        }
        newRanks.set(id, newRank);
        delta += Math.abs(newRank - this.ranks.get(id)!);
      }
      
      this.ranks = newRanks;
      iteration++;
    }

    return this.ranks;
  }

  private getInternalDependencies(node: ModuleNode): string[] {
    return Array.from(node.dependencies).filter(depId => {
        const depNode = this.graph.get(depId);
        return depNode && !depNode.isExternal;
    });
  }
}
