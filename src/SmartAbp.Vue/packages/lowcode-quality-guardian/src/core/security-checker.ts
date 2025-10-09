import chalk from 'chalk';
import path from 'path';
import { runCommand } from './executor.js';

const rootDir = path.resolve(process.cwd(), '../../..');

export async function checkSecurity(strict: boolean): Promise<boolean> {
    console.log(chalk.blue('\n🔐 Starting security checks...'));

    const sensitiveDataPattern = "password\\|secret\\|api[_-]key\\|token";
    const sensitiveDataCheck = await runCommand('grep', ['-r', '-i', sensitiveDataPattern, 'src'], rootDir, {
        errorMessage: 'Potential sensitive data found.',
        isP0Check: !strict,
        ignoreExitCode: true
    });
    if (!sensitiveDataCheck && strict) return false;

    const sqlInjectionPattern = "select\\|insert\\|update\\|delete.*\\+.*";
    const sqlInjectionCheck = await runCommand('grep', ['-r', '-i', sqlInjectionPattern, 'src'], rootDir, {
        errorMessage: 'Potential SQL injection risk found.',
        isP0Check: !strict,
        ignoreExitCode: true
    });
    if (!sqlInjectionCheck && strict) return false;

    if (sensitiveDataCheck && sqlInjectionCheck) {
        console.log(chalk.green('✅ Security scan passed.'));
    } else {
        console.log(chalk.yellow('⚠️ Security scan found potential issues.'));
    }

    return true;
}
