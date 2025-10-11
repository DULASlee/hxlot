import chalk from 'chalk';
import { execa } from 'execa';

export async function runCommand(
    command: string,
    args: string[],
    cwd: string,
    options: {
        errorMessage: string,
        isP0Check: boolean,
        ignoreExitCode?: boolean
    }
): Promise<boolean> {
    const { errorMessage, isP0Check, ignoreExitCode } = options;
    try {
        const subprocess = execa(command, args, { cwd });
        // subprocess.stdout?.pipe(process.stdout);
        // subprocess.stderr?.pipe(process.stderr);
        await subprocess;
        return true;
    } catch (error: any) {
        if (ignoreExitCode && error.exitCode === 1 && !error.stdout) {
            return true; // For commands like grep that exit 1 on no match
        }

        console.error(chalk.red(`❌ ${errorMessage}`));
        if (isP0Check || !ignoreExitCode) {
            console.error(chalk.red(error.shortMessage));
            if (error.stdout) console.error(chalk.gray(error.stdout));
            if (error.stderr) console.error(chalk.gray(error.stderr));
        }
        return false;
    }
}
