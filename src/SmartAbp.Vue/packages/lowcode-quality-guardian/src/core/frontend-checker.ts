import chalk from 'chalk';
import path from 'path';
import { runCommand } from './executor.js';

const frontendDir = path.resolve(process.cwd(), '../');
const packagesDir = path.resolve(frontendDir, 'packages');

export async function checkFrontendQuality(strict: boolean): Promise<boolean> {
    console.log(chalk.blue('\n🎨 Starting frontend quality checks...'));

    const typeCheckPassed = await runCommand('vue-tsc', ['--noEmit', '-p', 'tsconfig.app.json', '--compositeFalse'], frontendDir, {
        errorMessage: 'TypeScript type check failed.',
        isP0Check: true
    });
    if (!typeCheckPassed) return false;
    console.log(chalk.green('✅ TypeScript type check passed.'));

    const lintCheckPassed = await runCommand('npm', ['run', 'lint'], frontendDir, {
        errorMessage: 'ESLint check found issues.',
        isP0Check: !strict
    });
    if (!lintCheckPassed && strict) return false;
    console.log(chalk.green('✅ ESLint check passed.'));

    console.log(chalk.blue('🏗️ Running architecture checks...'));

    const relativePathCheck = await runCommand('grep', ['-r', "'../'"], packagesDir, {
        errorMessage: 'Found relative path violations in packages.',
        isP0Check: true,
        ignoreExitCode: true
    });
    if (!relativePathCheck) return false;
    console.log(chalk.green('✅ No relative path violations found.'));

    const mainAppRefCheck = await runCommand('grep', ['-r', "'@/'"], packagesDir, {
        errorMessage: 'Found main app references (@/) in packages.',
        isP0Check: true,
        ignoreExitCode: true
    });
    if (!mainAppRefCheck) return false;
    console.log(chalk.green('✅ No main app references found in packages.'));

    const typeBypassCheck = await runCommand('grep', ['-r', "as any\\|@ts-ignore"], frontendDir, {
        errorMessage: 'Found type bypasses (as any / @ts-ignore).',
        isP0Check: true,
        ignoreExitCode: true
    });
    if (!typeBypassCheck) return false;
    console.log(chalk.green('✅ No type bypasses found.'));

    console.log(chalk.green('✅ Frontend quality checks completed.'));
    return true;
}
