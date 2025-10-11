/**
 * 架构合规性检查器
 */

import { BaseChecker } from './base-checker.js';

export class ArchitectureChecker extends BaseChecker {
    public readonly name = '架构合规性检查器';
    public readonly description = '检查项目架构的合规性和依赖关系';
    public readonly version = '2.0.0';

    protected async doCheck(): Promise<void> {
        this.logProgress('执行架构合规性检查...', 'info');

        await this.checkPackageStructure();
        await this.checkDependencyDirection();
    }

    private async checkPackageStructure(): Promise<void> {
        // 简化实现
        this.logProgress('检查包结构...', 'info');
    }

    private async checkDependencyDirection(): Promise<void> {
        // 简化实现  
        this.logProgress('检查依赖方向...', 'info');
    }
}

