import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CHECKPOINT_FILE = path.resolve(process.cwd(), '.ai-engine', 'checkpoint.json');
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export interface Checkpoint {
  timestamp: number;
  result: 'passed' | 'failed' | 'skipped';
  hash: string;
  details?: any;
}

export interface CheckpointData {
  [key: string]: Checkpoint;
}

/**
 * 获取指定目录内容的 SHA256 哈希值
 * @param directoryPath 目录路径
 * @returns 哈希值
 */
async function getDirectoryHash(directoryPath: string): Promise<string> {
  try {
    // 使用git hash-object来高效计算哈希，这能自动处理.gitignore
    const { stdout } = await execAsync(`git ls-files -s ${directoryPath} | git hash-object --stdin`);
    return stdout.trim();
  } catch (error) {
    console.error(`Error getting hash for directory ${directoryPath}:`, error);
    return '';
  }
}


/**
 * 读取检查点文件
 */
async function readCheckpoints(): Promise<CheckpointData> {
  try {
    await fs.access(CHECKPOINT_FILE);
    const content = await fs.readFile(CHECKPOINT_FILE, 'utf-8');
    return JSON.parse(content) as CheckpointData;
  } catch (error) {
    // 如果文件不存在或无法解析，返回空对象
    return {};
  }
}

/**
 * 写入检查点文件
 * @param data 检查点数据
 */
async function writeCheckpoints(data: CheckpointData): Promise<void> {
  try {
    await fs.writeFile(CHECKPOINT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write checkpoint file:', error);
  }
}

/**
 * 验证检查点是否仍然有效
 * @param checkpointName 检查点名称
 * @param pathsToCheck 要检查的文件/目录路径数组
 * @returns 如果有效则返回之前的检查点，否则返回null
 */
export async function validateCheckpoint(
  checkpointName: string,
  pathsToCheck: string[]
): Promise<Checkpoint | null> {
  const checkpoints = await readCheckpoints();
  const lastCheckpoint = checkpoints[checkpointName];

  if (!lastCheckpoint) {
    console.log(`[Checkpoint] No previous checkpoint found for '${checkpointName}'.`);
    return null;
  }

  const now = Date.now();
  if (now - lastCheckpoint.timestamp > CACHE_DURATION) {
    console.log(`[Checkpoint] Checkpoint for '${checkpointName}' has expired.`);
    return null;
  }

  // 计算当前路径集合的哈希
  const currentHashes = await Promise.all(pathsToCheck.map(p => getDirectoryHash(p)));
  const currentHash = currentHashes.join('-'); // 使用-连接多个路径的哈希

  if (lastCheckpoint.hash !== currentHash) {
    console.log(`[Checkpoint] Content has changed for '${checkpointName}'. Invalidating checkpoint.`);
    return null;
  }
  
  console.log(`[Checkpoint] Using cached result for '${checkpointName}'.`);
  return lastCheckpoint;
}

/**
 * 更新或创建一个检查点
 * @param checkpointName 检查点名称
 * @param result 检查结果
 * @param pathsToCheck 用于计算哈希的文件/目录路径数组
 * @param details 额外信息
 */
export async function updateCheckpoint(
  checkpointName: string,
  result: 'passed' | 'failed',
  pathsToCheck: string[],
  details?: any
): Promise<void> {
  const checkpoints = await readCheckpoints();
  const currentHashes = await Promise.all(pathsToCheck.map(p => getDirectoryHash(p)));
  const currentHash = currentHashes.join('-');

  checkpoints[checkpointName] = {
    timestamp: Date.now(),
    result,
    hash: currentHash,
    details,
  };

  await writeCheckpoints(checkpoints);
  console.log(`[Checkpoint] Checkpoint for '${checkpointName}' has been updated.`);
}
