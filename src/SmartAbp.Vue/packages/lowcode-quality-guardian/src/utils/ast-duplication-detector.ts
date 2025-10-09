import * as parser from '@babel/parser';
import traverse, { type NodePath } from '@babel/traverse';
import type { Function as BabelFunction, Node } from '@babel/types';
import { parse as parseSfc } from '@vue/compiler-sfc';
import { simhash as localSimhash } from '../utils/simhash.js';

/**
 * 代码指纹，用于唯一标识一个代码块的逻辑结构
 */
export interface CodeFingerprint {
    hash: string;
    filePath: string;
    startLine: number;
    endLine: number;
    codeSnippet: string;
}

/**
 * 重复代码对
 */
export interface CodeDuplicate {
    a: CodeFingerprint;
    b: CodeFingerprint;
    distance: number; // Simhash's Hamming distance
}

/**
 * AST驱动的重复代码检测器配置
 */
export interface AstDuplicationDetectorConfig {
    minTokens?: number; // 生成指纹所需的最小代码Token数
    maxDistance?: number; // 判断为重复的最大汉明距离
}

type SimhashFn = (tokens: string[]) => BigInt;

function processNode(
    node: BabelFunction,
    filePath: string,
    fingerprints: CodeFingerprint[],
    simhash: SimhashFn,
    config: Required<AstDuplicationDetectorConfig>
): void {
    if (!node.loc || !node.body) {
        return;
    }

    const tokens = getTokensFromNode(node);
    if (tokens.length < config.minTokens) {
        return;
    }

    const hash = simhash(tokens);
    const codeSnippet = getSourceFromNode(node);

    fingerprints.push({
        hash: (hash as any).toString(16).padStart(16, '0'),
        filePath,
        startLine: node.loc.start.line,
        endLine: node.loc.end.line,
        codeSnippet,
    });
}

function getTokensFromNode(node: Node): string[] {
    const tokens: string[] = [];
    (traverse as any).default(node, {
        noScope: true,
        enter(path: NodePath) {
            tokens.push(path.node.type);
        },
    });
    return tokens;
}

function getSourceFromNode(node: Node): string {
    if (node.loc) {
        return `Code block at lines ${node.loc.start.line}-${node.loc.end.line}`;
    }
    return 'Unknown code snippet';
}

/**
 * 智能重复代码分析引擎
 * 使用AST + Simhash算法，识别逻辑重复而非文本重复
 */
export class AstDuplicationDetector {
    private config: Required<AstDuplicationDetectorConfig>;
    private simhash: SimhashFn;

    constructor(config: AstDuplicationDetectorConfig = {}) {
        this.simhash = localSimhash;
        this.config = {
            minTokens: 50,
            maxDistance: 3,
            ...config,
        };
    }

    /**
     * 分析源代码并返回所有代码块的指纹
     * @param sourceCode 源代码字符串
     * @param filePath 文件路径
     * @returns 代码指纹数组
     */
    public generateFingerprints(sourceCode: string, filePath: string): CodeFingerprint[] {
        const fingerprints: CodeFingerprint[] = [];
        let scriptContent = sourceCode;

        if (filePath.endsWith('.vue')) {
            try {
                const sfc = parseSfc(sourceCode, { pad: 'space' });
                scriptContent = sfc.descriptor.script?.content ?? sfc.descriptor.scriptSetup?.content ?? '';
                if (!scriptContent) {
                    return []; // No script content in .vue file
                }
            } catch (error) {
                console.error(`[Error] Failed to parse Vue SFC: ${filePath}`, error);
                return [];
            }
        }

        try {
            const ast = parser.parse(scriptContent, {
                sourceType: 'module',
                plugins: ['typescript', 'jsx'],
                errorRecovery: true,
            });

            // Capture the function and config to avoid 'this' context issues in the callback.
            const simhashFn = this.simhash;
            const currentConfig = this.config;

            (traverse as any).default(ast, {
                enter: (path: NodePath) => {
                    if (
                        path.isFunctionDeclaration() ||
                        path.isFunctionExpression() ||
                        path.isArrowFunctionExpression() ||
                        path.isClassMethod()
                    ) {
                        processNode(
                            path.node,
                            filePath,
                            fingerprints,
                            simhashFn,
                            currentConfig
                        );
                    }
                }
            });
        } catch (error) {
            console.error(`[Error] Failed to parse or traverse AST for ${filePath}:`, error);
        }

        return fingerprints;
    }

    /**
     * 比较指纹列表，找出重复的代码对 (优化版)
     * 使用分块/分桶策略避免O(n^2)的比较
     * @param fingerprints 代码指纹数组
     * @returns 重复代码对数组
     */
    public findDuplicates(fingerprints: CodeFingerprint[]): CodeDuplicate[] {
        const duplicates: CodeDuplicate[] = [];
        const seenPairs = new Set<string>();

        if (fingerprints.length < 2) {
          return [];
        }

        const bands = 4;
        const rows = 16;
        const buckets: Record<string, CodeFingerprint[]> = {};

        for (let b = 0; b < bands; b++) {
          for (const f of fingerprints) {
            const bandValue = this.getBand(f.hash, b, rows);
            const bucketKey = `${b}-${bandValue}`;
            if (!buckets[bucketKey]) {
              buckets[bucketKey] = [];
            }
            buckets[bucketKey].push(f);
          }
        }
        
        for (const bucketKey in buckets) {
          const bucket = buckets[bucketKey];
          if (bucket.length > 1) {
            for (let i = 0; i < bucket.length; i++) {
              for (let j = i + 1; j < bucket.length; j++) {
                const f1 = bucket[i];
                const f2 = bucket[j];

                // Ensure we don't compare the same pair twice
                const pairKey = [f1.hash, f2.hash].sort().join('-');
                if (seenPairs.has(pairKey)) {
                  continue;
                }
                seenPairs.add(pairKey);

                const distance = this.calculateHammingDistance(f1.hash, f2.hash);
                if (distance <= this.config.maxDistance) {
                  duplicates.push({ a: f1, b: f2, distance });
                }
              }
            }
          }
        }
        
        return duplicates;
      }

      /**
       * 从哈希中提取特定频带的值
       */
      private getBand(hash: string, bandIndex: number, rows: number): string {
        return hash.substring(bandIndex * rows, (bandIndex + 1) * rows);
      }

    /**
     * 计算两个Simhash指纹之间的汉明距离
     */
    private calculateHammingDistance(hash1: string, hash2: string): number {
        let distance = 0;
        const bigHash1 = BigInt(`0x${hash1}`);
        const bigHash2 = BigInt(`0x${hash2}`);
        let xor = bigHash1 ^ bigHash2;

        while (xor > 0) {
            distance += 1;
            xor &= xor - 1n;
        }

        return distance;
    }
}
