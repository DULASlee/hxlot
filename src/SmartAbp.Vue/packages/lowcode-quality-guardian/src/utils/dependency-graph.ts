import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import type { Node } from '@babel/types';
import path from 'path';

// @babel/traverse类型兼容性修复
const babelTraverse = typeof traverse === 'function' ? traverse : (traverse as any).default;

export interface ModuleNode {
  id: string; // File path relative to project root
  dependencies: Set<string>;
  dependents: Set<string>;
  isExternal: boolean;
}

export class DependencyGraph {
  private nodes: Map<string, ModuleNode> = new Map();
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  public async addFile(filePath: string, fileContent: string): Promise<void> {
    const relativePath = path.relative(this.projectRoot, filePath);
    const node = this.getOrCreateNode(relativePath);

    try {
      const ast = parser.parse(fileContent, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
        errorRecovery: true,
      });

      traverse(ast, {
        ImportDeclaration: ({ node }) => {
          this.addDependency(node, relativePath);
        },
        CallExpression: ({ node }) => {
          if (
            (node.callee.type === 'Identifier' && node.callee.name === 'require') ||
            (node.callee.type === 'Import') // Dynamic import()
          ) {
            this.addDependency(node, relativePath);
          }
        },
      });
    } catch (error) {
      // Ignore parsing errors for now
    }
  }

  public getGraph(): Map<string, ModuleNode> {
    return this.nodes;
  }

  private addDependency(importNode: Node, sourcePath: string): void {
    if (importNode.type === 'ImportDeclaration' && importNode.source.type === 'StringLiteral') {
      const targetPath = this.resolvePath(importNode.source.value, sourcePath);
      this.linkNodes(sourcePath, targetPath);
    } else if (importNode.type === 'CallExpression' && importNode.arguments[0]?.type === 'StringLiteral') {
      const targetPath = this.resolvePath(importNode.arguments[0].value, sourcePath);
      this.linkNodes(sourcePath, targetPath);
    }
  }

  private linkNodes(source: string, target: string): void {
    if (source === target) return;

    const sourceNode = this.getOrCreateNode(source);
    const targetNode = this.getOrCreateNode(target);

    sourceNode.dependencies.add(target);
    targetNode.dependents.add(source);
  }

  private getOrCreateNode(id: string): ModuleNode {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, {
        id,
        dependencies: new Set(),
        dependents: new Set(),
        isExternal: this.isExternal(id),
      });
    }
    return this.nodes.get(id)!;
  }

  private resolvePath(importPath: string, sourceFile: string): string {
    if (importPath.startsWith('.') || importPath.startsWith('/')) {
      // It's a relative or absolute path
      const resolved = path.resolve(path.dirname(sourceFile), importPath);
      let relative = path.relative(this.projectRoot, resolved);

      // Attempt to resolve extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.vue'];
      for (const ext of extensions) {
        // This is a simplified resolution, a real one would check fs.existsSync
        if (relative.endsWith(ext)) return relative;
      }
      // A more robust resolver would be needed for production
      return `${relative}.ts`; // Assume .ts for simplicity
    }
    // It's a package/alias, treat it as an external dependency for now
    return importPath;
  }

  private isExternal(id: string): boolean {
    return !id.startsWith('.') && !path.isAbsolute(id);
  }
}
