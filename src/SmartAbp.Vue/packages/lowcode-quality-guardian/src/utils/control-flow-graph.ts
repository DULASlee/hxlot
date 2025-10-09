import type { Node, Function } from '@babel/types';

export enum CfgNodeType {
  Entry,
  Exit,
  Statement,
  Branch,
}

export interface CfgNode {
  id: number;
  type: CfgNodeType;
  astNode?: Node;
  successors: CfgNode[];
  predecessors: CfgNode[];
  text?: string;
}

export class ControlFlowGraph {
  private nodes: CfgNode[] = [];
  private entry: CfgNode;
  private exit: CfgNode;
  private nextId = 0;

  constructor(private funcAstNode: Function) {
    this.entry = this.createNode(CfgNodeType.Entry, undefined, 'Entry');
    this.exit = this.createNode(CfgNodeType.Exit, undefined, 'Exit');
    this.build();
  }
  
  public getEntryNode(): CfgNode {
    return this.entry;
  }
  
  public getExitNode(): CfgNode {
    return this.exit;
  }
  
  public getAllNodes(): CfgNode[] {
    return this.nodes;
  }

  private createNode(type: CfgNodeType, astNode?: Node, text?: string): CfgNode {
    const node: CfgNode = {
      id: this.nextId++,
      type,
      astNode,
      successors: [],
      predecessors: [],
      text
    };
    this.nodes.push(node);
    return node;
  }

  private link(from: CfgNode, to: CfgNode): void {
    if (!from.successors.includes(to)) {
      from.successors.push(to);
    }
    if (!to.predecessors.includes(from)) {
      to.predecessors.push(from);
    }
  }

  private build(): void {
    if (this.funcAstNode.body.type !== 'BlockStatement') {
      // Handle arrow functions with implicit return
      const stmtNode = this.createNode(CfgNodeType.Statement, this.funcAstNode.body);
      this.link(this.entry, stmtNode);
      this.link(stmtNode, this.exit);
      return;
    }
    
    const finalNodes = this.buildStatements(this.funcAstNode.body.body, [this.entry]);

    for (const node of finalNodes) {
        if(node.type !== CfgNodeType.Exit) {
            this.link(node, this.exit);
        }
    }
  }

  private buildStatements(statements: any[], currentNodes: CfgNode[]): CfgNode[] {
    let activeNodes = [...currentNodes];
    for (const stmt of statements) {
      activeNodes = this.buildStatement(stmt, activeNodes);
    }
    return activeNodes;
  }
  
  private buildStatement(stmt: any, currentNodes: CfgNode[]): CfgNode[] {
    // This is a highly simplified CFG builder. A real implementation would handle all statement types.
    if (stmt.type === 'IfStatement') {
      const branchNode = this.createNode(CfgNodeType.Branch, stmt.test, 'if');
      currentNodes.forEach(n => this.link(n, branchNode));

      const thenNodes = this.buildStatements(
        stmt.consequent.type === 'BlockStatement' ? stmt.consequent.body : [stmt.consequent],
        [branchNode]
      );

      let elseNodes: CfgNode[] = [branchNode];
      if (stmt.alternate) {
        elseNodes = this.buildStatements(
          stmt.alternate.type === 'BlockStatement' ? stmt.alternate.body : [stmt.alternate],
          [branchNode]
        );
      }
      return [...thenNodes, ...elseNodes];

    } else if (stmt.type === 'ReturnStatement') {
        const returnNode = this.createNode(CfgNodeType.Statement, stmt);
        currentNodes.forEach(n => this.link(n, returnNode));
        this.link(returnNode, this.exit);
        return [this.exit]; // No further statements will be reached
    } else {
      const stmtNode = this.createNode(CfgNodeType.Statement, stmt);
      currentNodes.forEach(n => this.link(n, stmtNode));
      return [stmtNode];
    }
  }
}
