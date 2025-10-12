// AI Guardian MCP Script Executor - Full Implementation
// Usage:
//   node tools/ai-guardian/mcp-script-executor.js
// Interact by sending JSON lines to stdin, e.g.:
//   {"tool":"mcp_get_session_state","params":{}}
//   {"tool":"mcp_record_code_lines","params":{"lines":50,"context":"impl"}}
// Env:
//   AI_GUARDIAN_DRYRUN=1  // Skip heavy external checks for quick validation
//   AI_GUARDIAN_ONESHOT=1 // Exit after first call
//   AI_GUARDIAN_CALL='{"tool":"..."}' // Direct CLI call

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const STATE_FILE = path.join(__dirname, 'session-state.json');
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'ai-guardian.log');
const DRYRUN = process.env.AI_GUARDIAN_DRYRUN === '1' || process.argv.includes('--test');
let ONESHOT = process.env.AI_GUARDIAN_ONESHOT === '1' || process.argv.includes('--oneshot');
let CALL_JSON = process.env.AI_GUARDIAN_CALL || null;
const callIdx = process.argv.indexOf('--call');
if (!CALL_JSON && callIdx >= 0 && process.argv[callIdx + 1]) {
    CALL_JSON = process.argv[callIdx + 1];
}

const RULE_FILES = [
    path.join(ROOT, '.cursor', 'rules', '00_核心原则.mdc'),
    path.join(ROOT, '.cursor', 'rules', '00_执行引擎.mdc'),
    path.join(ROOT, 'docs', '项目开发规范总览.md'),
];

ensureDir(LOG_DIR);

function ensureDir(dir) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (_) { }
}

function log(message) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, entry);
    try { process.stdout.write(entry); } catch (_) { }
}

function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const s = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
            return s;
        }
    } catch (e) {
        log(`State load error: ${e.message}`);
    }
    return {
        sessionId: `${Date.now()}`,
        currentLines: 0,
        checkpoints: [],
        date: today(),
        lastRuleReloadAt: null,
    };
}

function saveState(state) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (e) {
        log(`State save error: ${e.message}`);
    }
}

function resetDailyIfNeeded(state) {
    const nowDay = today();
    if (state.date !== nowDay) {
        state.date = nowDay;
        state.sessionId = `${Date.now()}`;
        state.currentLines = 0;
        state.checkpoints = [];
        saveState(state);
        log('Daily reset applied: new session started.');
    }
}

function nodeCmd() {
    return process.platform === 'win32' ? 'node.exe' : 'node';
}

function npmCmd() {
    return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function pwshCmd() {
    if (process.platform === 'win32') return 'pwsh';
    return 'pwsh';
}

function runCommand(cmd, args, options = {}) {
    return new Promise((resolve) => {
        const child = spawn(cmd, args, {
            cwd: options.cwd || ROOT,
            env: { ...process.env, ...(options.env || {}) },
            stdio: options.stdio || 'ignore',
            shell: false,
        });
        let stdout = '';
        let stderr = '';
        if (options.capture) {
            child.stdout?.on('data', (d) => (stdout += d.toString()));
            child.stderr?.on('data', (d) => (stderr += d.toString()));
        }
        child.on('error', (err) => {
            resolve({ code: -1, error: err.message, stdout, stderr });
        });
        child.on('close', (code) => {
            resolve({ code, stdout, stderr });
        });
    });
}

async function runLightCheck() {
    log(`Running light check${DRYRUN ? ' [DRYRUN]' : ''}...`);
    if (DRYRUN) {
        await delay(300);
        return { success: true };
    }
    const vueRoot = path.join(ROOT, 'src', 'SmartAbp.Vue');
    const typeCheck = await runCommand(npmCmd(), ['run', 'type-check', '--silent'], { cwd: vueRoot });
    const lint = await runCommand(npmCmd(), ['run', 'lint', '--silent'], { cwd: vueRoot });
    const ok = typeCheck.code === 0 && lint.code === 0;
    if (!ok) {
        log(`Light check failed. type-check=${typeCheck.code}, lint=${lint.code}`);
    }
    return { success: ok, details: { typeCheck: typeCheck.code, lint: lint.code } };
}

async function runQualityGate() {
    log(`Running quality gate (expert-mode nine layers)${DRYRUN ? ' [DRYRUN]' : ''}...`);
    const args = ['-File', path.join(ROOT, 'scripts', 'quality', 'expert-mode-nine-layers.ps1'), '-SkipGitSync'];
    if (DRYRUN) args.push('-DryRun');
    const res = await runCommand(pwshCmd(), args, { capture: true });
    const ok = res.code === 0;
    if (!ok) {
        log(`Quality gate failed. code=${res.code}`);
    }
    return { success: ok };
}

async function runGitCommit(message) {
    log(`Running Git safe sync: ${message}`);
    const args = ['-File', path.join(ROOT, 'scripts', 'git', 'git-safe-sync.ps1'), '-AutoCommit', '-NonInteractive'];
    const res = await runCommand(pwshCmd(), args, { capture: true });
    const ok = res.code === 0;
    if (!ok) log(`Git safe sync failed. code=${res.code}`);
    return { success: ok };
}

function reloadRules(state) {
    let loaded = 0;
    RULE_FILES.forEach((f) => {
        try {
            if (fs.existsSync(f)) {
                fs.readFileSync(f, 'utf8');
                loaded += 1;
            }
        } catch (e) {
            // ignore
        }
    });
    state.lastRuleReloadAt = new Date().toISOString();
    saveState(state);
    log(`Rules reloaded: ${loaded}/${RULE_FILES.length}`);
    return { loaded, at: state.lastRuleReloadAt };
}

function scheduleRuleReload(state) {
    const intervalMs = 30 * 60 * 1000; // 30 minutes
    setInterval(() => {
        try {
            reloadRules(state);
        } catch (e) {
            log(`Rule reload error: ${e.message}`);
        }
    }, intervalMs);
}

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

function safeReply(obj) {
    try {
        process.stdout.write(JSON.stringify(obj) + '\n');
    } catch (_) { }
}

async function handleCall(tool, params) {
    const state = loadState();
    resetDailyIfNeeded(state);
    let response = { success: true, data: {} };

    switch (tool) {
        case 'mcp_record_code_lines': {
            const lines = Number(params.lines || 0);
            if (!Number.isFinite(lines)) {
                response = { success: false, error: 'Invalid lines' };
                break;
            }
            state.currentLines = Math.max(0, state.currentLines + lines);
            if (params.context) state.context = params.context;
            saveState(state);
            log(`Recorded ${lines} lines. Total: ${state.currentLines}/300`);

            let pending = null;
            let checkpoint = null;
            if (state.currentLines >= 280 && state.currentLines < 300) {
                checkpoint = 280;
                pending = runLightCheck().then((r) => {
                    if (r.success) log('280 checkpoint passed. Continue.');
                    else log('280 checkpoint failed.');
                    return r;
                }).catch((e) => { log(`280 checkpoint error: ${e.message}`); return { success: false }; });
            }
            if (state.currentLines >= 300) {
                checkpoint = 300;
                pending = runQualityGate().then((r) => {
                    if (r.success) {
                        state.currentLines = 0;
                        saveState(state);
                        log('300 quality gate passed. Counter reset.');
                    } else {
                        log('300 quality gate failed.');
                    }
                    return r;
                }).catch((e) => { log(`300 gate error: ${e.message}`); return { success: false }; });
            }

            if (ONESHOT && pending) {
                try {
                    await Promise.race([
                        pending,
                        new Promise((_, rej) => setTimeout(() => rej(new Error('checkpoint timeout')), 120000)),
                    ]);
                } catch (e) {
                    log(`Checkpoint wait timeout or error: ${e.message}`);
                }
            }

            response.data = { currentLines: state.currentLines, sessionId: state.sessionId };
            break;
        }
        case 'mcp_get_session_state': {
            response.data = state;
            break;
        }
        case 'mcp_git_commit_all': {
            const msg = params.message || 'feat: auto commit by AI Guardian';
            const r = await runGitCommit(msg);
            if (r.success) {
                state.currentLines = 0;
                state.checkpoints = [];
                saveState(state);
            }
            response = { success: r.success, data: { sessionReset: r.success } };
            break;
        }
        case 'mcp_reload_rules': {
            const info = reloadRules(state);
            response.data = info;
            break;
        }
        default: {
            response = { success: false, error: `Unknown tool: ${tool}` };
        }
    }

    safeReply(response);
    if (ONESHOT) {
        log('ONESHOT mode: exiting after first call.');
        process.exit(0);
    }
}

// Boot logs & schedulers
log(`MCP Script Executor started. Listening for calls...${DRYRUN ? ' [DRYRUN]' : ''}`);
// One-time immediate rules load
try { const st = loadState(); reloadRules(st); scheduleRuleReload(st); } catch (e) { log(`Initial rule reload error: ${e.message}`); }

// If CALL_JSON provided, handle once and exit
if (CALL_JSON) {
    try {
        const call = JSON.parse(CALL_JSON);
        ONESHOT = true;
        handleCall(call.tool, call.params || {});
    } catch (e) {
        safeReply({ success: false, error: `Invalid CALL JSON: ${e.message}` });
        process.exit(1);
    }
}

// JSON-RPC-like handling via stdin lines
process.stdin.setEncoding('utf8');
let buffer = '';
process.stdin.on('data', (data) => {
    buffer += data;
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line) continue;
        try {
            const call = JSON.parse(line);
            handleCall(call.tool, call.params || {});
        } catch (e) {
            log(`Parse error: ${e.message}`);
            safeReply({ success: false, error: 'Invalid JSON' });
        }
    }
});

// Graceful shutdown
process.on('SIGINT', () => { log('Shutting down (SIGINT).'); process.exit(0); });
process.on('SIGTERM', () => { log('Shutting down (SIGTERM).'); process.exit(0); });

