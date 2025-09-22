import { promises as fs } from "fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { ManifestSchema } from "./schema";
async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (!args.input) {
        console.error("用法: tsx src/tools/add-module.ts --input <manifest.json> [--codegen]");
        process.exit(1);
    }
    const inputPath = path.resolve(process.cwd(), args.input);
    const content = await fs.readFile(inputPath, "utf-8");
    let manifest;
    try {
        manifest = ManifestSchema.parse(JSON.parse(content));
    }
    catch (err) {
        console.error("❌ Manifest 校验失败:", err);
        process.exit(1);
        return;
    }
    const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
    const modulesDir = path.join(rootDir, "modules", manifest.name);
    await fs.mkdir(modulesDir, { recursive: true });
    const outPath = path.join(modulesDir, "abp.module.json");
    await fs.writeFile(outPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log(`✅ 已写入模块清单: ${path.relative(rootDir, outPath)}`);
    if (args.codegen) {
        console.log("🚀 触发代码生成...");
        const { spawn } = await import("node:child_process");
        await new Promise((resolve, reject) => {
            const p = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "codegen"], {
                cwd: rootDir,
                stdio: "inherit",
            });
            p.on("close", (code) => {
                if (code === 0)
                    resolve();
                else
                    reject(new Error(`codegen 失败 (exit ${code})`));
            });
        });
        console.log("✅ 代码生成完成");
    }
}
function parseArgs(argv) {
    const res = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--input")
            res.input = argv[++i];
        else if (a === "--codegen")
            res.codegen = true;
    }
    return res;
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
