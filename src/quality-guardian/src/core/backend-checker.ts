import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';
import { runCommand } from './executor.js';

const rootDir = path.resolve(process.cwd(), '../../..');
const slnPath = path.resolve(rootDir, 'src/SmartAbp.sln');

export async function checkBackendQuality(strict: boolean): Promise<boolean> {
    console.log(chalk.blue('\n🔨 Starting backend quality checks...'));

    if (!await fs.pathExists(slnPath)) {
        console.log(chalk.yellow('⚠️ Solution file not found, skipping backend checks.'));
        return true;
    }

    const buildPassed = await runCommand('dotnet',
        ['build', 'src/SmartAbp.sln', '--verbosity', 'minimal', '--no-incremental'],
        rootDir,
        { errorMessage: '"dotnet build" failed.', isP0Check: true }
    );
    if (!buildPassed) return false;

    const formatPassed = await runCommand('dotnet',
        ['format', 'src/SmartAbp.sln', '--verify-no-changes', '--verbosity', 'diagnostic'],
        rootDir,
        { errorMessage: '"dotnet format" found issues.', isP0Check: !strict }
    );
    if (!formatPassed && strict) return false;

    const testPassed = await runCommand('dotnet',
        ['test', 'src/SmartAbp.sln', '--logger', 'console;verbosity=minimal'],
        rootDir,
        { errorMessage: '"dotnet test" failed.', isP0Check: !strict }
    );
    if (!testPassed && strict) return false;

    console.log(chalk.green('✅ Backend quality checks completed.'));
    return true;
}
