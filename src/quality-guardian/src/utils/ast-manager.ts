import { TSESTree } from '@typescript-eslint/typescript-estree';
import fs from 'fs/promises';
import { parse } from '@typescript-eslint/typescript-estree';

interface CacheEntry {
    content: string;
    ast: TSESTree.Program;
    timestamp: number;
}

export class ASTManager {
    private static instance: ASTManager;
    private readonly cache: Map<string, CacheEntry> = new Map();
    private readonly ttl: number = 30 * 60 * 1000; // 30 minutes

    private constructor() {}

    public static getInstance(): ASTManager {
        if (!ASTManager.instance) {
            ASTManager.instance = new ASTManager();
        }
        return ASTManager.instance;
    }

    public async getAST(filePath: string): Promise<{ content: string; ast: TSESTree.Program }> {
        const stats = await fs.stat(filePath).catch(() => null);
        if (!stats) {
            throw new Error(`File not found: ${filePath}`);
        }

        const cached = this.cache.get(filePath);
        if (cached && cached.timestamp >= stats.mtimeMs) {
            return { content: cached.content, ast: cached.ast };
        }

        const content = await fs.readFile(filePath, 'utf8');
        const ast = parse(content, {
            loc: true,
            comment: true,
            errorOnUnknownASTType: false,
            useJSXTextNode: true,
        });

        this.cache.set(filePath, { content, ast, timestamp: stats.mtimeMs });

        // Invalidate old entries
        this.pruneCache();

        return { content, ast };
    }

    private pruneCache(): void {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.ttl) {
                this.cache.delete(key);
            }
        }
    }

    public clearCache(): void {
        this.cache.clear();
    }
}
