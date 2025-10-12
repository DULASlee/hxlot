const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let started = false;
let statusItem;
let output;

function log(msg) {
    if (!output) { output = vscode.window.createOutputChannel('AI Guardian'); }
    const line = `[${new Date().toISOString()}] ${msg}`;
    output.appendLine(line);
}

function updateStatus(text, tooltip) {
    if (!statusItem) {
        statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
        statusItem.command = 'ai-guardian.start';
        statusItem.show();
    }
    statusItem.text = text;
    statusItem.tooltip = tooltip || text;
}

function startGuardian(context) {
    if (started) return;
    started = true;
    try {
        const root = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || process.cwd();
        const script = path.join(root, 'tools', 'ai-guardian', 'mcp-script-executor.js');
        updateStatus('$(run) AI Guardian: starting...', 'Starting AI Guardian');
        log('Starting guardian script: ' + script);
        const child = spawn(process.platform === 'win32' ? 'node.exe' : 'node', [script], {
            cwd: root,
            env: { ...process.env },
            stdio: 'ignore',
            detached: true,
        });
        child.unref();
        updateStatus('$(check) AI Guardian: running', 'AI Guardian is running');
        log('Guardian started.');
        // Basic health check: session-state exists
        const stateFile = path.join(root, 'tools', 'ai-guardian', 'session-state.json');
        setTimeout(() => {
            const ok = fs.existsSync(stateFile);
            log('Health check session-state.json exists=' + ok);
            if (!ok) { updateStatus('$(warning) AI Guardian: no state', 'No session-state.json found yet'); }
        }, 1500);
    } catch (e) {
        started = false;
        updateStatus('$(error) AI Guardian: failed', e.message);
        log('Auto-start failed: ' + e.message);
        vscode.window.showErrorMessage(`AI Guardian auto-start failed: ${e.message}`);
    }
}

function activate(context) {
    log('Extension activated');
    // Auto start when extension activates (onStartupFinished / workspaceContains)
    startGuardian(context);

    // Manual command to restart
    const disposable = vscode.commands.registerCommand('ai-guardian.start', () => {
        started = false;
        startGuardian(context);
        vscode.window.showInformationMessage('AI Guardian started.');
    });
    context.subscriptions.push(disposable);
}

function deactivate() {
    updateStatus('$(circle-slash) AI Guardian: inactive');
    log('Extension deactivated');
}

module.exports = { activate, deactivate };

