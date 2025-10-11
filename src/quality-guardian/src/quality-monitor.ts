import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';
import { checkBackendQuality } from './core/backend-checker.js';
import { checkFrontendQuality } from './core/frontend-checker.js';
import { checkPerformance } from './core/performance-checker.js';
import { checkSecurity } from './core/security-checker.js';

export class QualityMonitor {
    private projectRoot: string;
    private reportDir: string;

    constructor(projectRoot: string = process.cwd()) {
        this.projectRoot = projectRoot;
        this.reportDir = path.join(this.projectRoot, 'reports', 'quality');
        fs.ensureDirSync(this.reportDir);
    }

    public async run(strict: boolean): Promise<boolean> {
        console.log(chalk.blue('🚀 Starting enterprise quality monitoring...'));

        const frontendResult = await checkFrontendQuality(strict);
        const backendResult = await checkBackendQuality(strict);
        const securityResult = await checkSecurity(strict);
        await checkPerformance();

        // This is a simplified result aggregation. A more detailed report generator will be built later.
        const overallPassed = frontendResult && backendResult && (securityResult || !strict);

        if (overallPassed) {
            console.log(chalk.green('🎉 All quality checks passed!'));
        } else {
            console.error(chalk.red('❌ Some quality checks failed.'));
        }

        return overallPassed;
    }
}
