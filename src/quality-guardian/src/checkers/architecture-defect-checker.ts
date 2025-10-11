import { DependencyGraph } from '../utils/dependency-graph.js';
import { PageRank } from '../utils/pagerank.js';
import { Tarjan } from '../utils/tarjan.js';
import { BaseChecker } from './base-checker.js';

export class ArchitectureDefectChecker extends BaseChecker {
  public readonly name = 'ArchitectureDefectChecker';
  public readonly description = '检测架构缺陷，如循环依赖、高耦合模块，并提供优化建议';
  public readonly version = '1.0.0';

  protected async doCheck(): Promise<void> {
    this.logProgress('开始构建项目依赖图...', 'info');
    const files = await this.findFiles(['**/*.ts', '**/*.tsx', '**/*.vue', '**/*.js']);
    const graph = new DependencyGraph(this.config.projectRoot);

    for (const file of files) {
      const content = await this.readFile(file);
      if (content) {
        await graph.addFile(file, content);
      }
    }
    this.logProgress(`依赖图构建完成，包含 ${graph.getGraph().size} 个模块。`, 'success');

    // 1. 使用 Tarjan 算法检测循环依赖
    this.logProgress('使用 Tarjan 算法检测循环依赖...', 'info');
    const tarjan = new Tarjan(graph.getGraph());
    const sccs = tarjan.findSCCs();
    this.logProgress(`发现 ${sccs.length} 个循环依赖组。`, sccs.length > 0 ? 'warning' : 'success');

    // 2. 使用 PageRank 算法计算模块影响力
    this.logProgress('使用 PageRank 算法计算模块影响力...', 'info');
    const pageRank = new PageRank(graph.getGraph());
    const ranks = pageRank.run();
    this.logProgress('模块影响力计算完成。', 'success');

    // 3. 报告违规
    for (const scc of sccs) {
      // 找出循环依赖组中 PageRank 最高的模块作为“核心”
      const coreNode = scc.sort((a, b) => (ranks.get(b.id) ?? 0) - (ranks.get(a.id) ?? 0))[0];

      if (!coreNode) continue;

      const cyclePath = scc.map(n => n.id).join(' -> ') + ` -> ${scc[0].id}`;
      const coreRank = ranks.get(coreNode.id) ?? 0;
      const normalizedRank = (coreRank * 1000).toFixed(2);

      this.addViolation({
        rule: 'architecture.circular-dependency',
        level: 'P1',
        message: `检测到 ${scc.length} 个模块之间的循环依赖，核心模块影响力评分为 ${normalizedRank}。`,
        file: coreNode.id,
        suggestion: `核心模块 '${coreNode.id}' 是解决此循环依赖的关键。请审查以下依赖链并重构：${cyclePath}`,
      });
    }

    // 可以在此添加其他基于PageRank的检查，例如找出排名最高但非循环的“上帝模块”
    const topRanked = [...ranks.entries()]
      .sort(([, rankA], [, rankB]) => rankB - rankA)
      .slice(0, 5);

    for (const [id, rank] of topRanked) {
      const node = graph.getGraph().get(id);
      if (node && !sccs.flat().some(sccNode => sccNode.id === id)) {
        this.addViolation({
          rule: 'architecture.god-module',
          level: 'P2',
          message: `模块 '${id}' 具有极高的影响力 (${(rank * 1000).toFixed(2)})，可能成为“上帝模块”，请审查其职责是否过于集中。`,
          file: id,
          suggestion: '请考虑将此模块的功能拆分到更小的、单一职责的模块中，以降低耦合度。'
        });
      }
    }
  }
}

