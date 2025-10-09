import chalk from 'chalk';
import { runCommand } from './executor.js';

export async function checkDependencies(): Promise<void> {
    console.log(chalk.blue('🔧 Checking dependencies...'));

    const tools = ['node', 'npm', 'dotnet', 'git'];
    const missingTools: string[] = [];

    for (const tool of tools) {
        const passed = await runCommand('command', ['-v', tool], process.cwd(), {
            errorMessage: '',
            isP0Check: true,
            ignoreExitCode: true
        });
        if (!passed) {
            missingTools.push(tool);
        }
    }

    if (missingTools.length > 0) {
        console.error(chalk.red(`❌ Missing required tools: ${missingTools.join(', ')}`));
        process.exit(1);
    }

    console.log(chalk.green('✅ All dependencies are installed.'));
}
