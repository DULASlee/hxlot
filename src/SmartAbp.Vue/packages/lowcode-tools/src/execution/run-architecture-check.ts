#!/usr/bin/env node
import { validateCheckpoint, updateCheckpoint } from './checkpoint';
import * as fs from 'fs/promises';
import { glob } from 'glob';

const CHECKPOINT_NAME = 'architecture-integrity';
const PACKAGES_PATH = 'src/SmartAbp.Vue/packages/';
const SRC_PATH = 'src/';

interface IntegrityResult {
  relativePaths: number;
  mainAppImports: number;
  typeSafetyBypasses: number;
  passed: boolean;
}

async function findViolations(globPattern: string, regex: RegExp): Promise<number> {
  const files = await glob(globPattern, { nodir: true });
  let violationCount = 0;
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const matches = content.match(regex);
    if (matches) {
      violationCount += matches.length;
    }
  }
  return violationCount;
}

async function runIntegrityCheck(): Promise<IntegrityResult> {
  console.log('🏗️ Running Architecture Integrity Check (Cross-Platform)...');

  try {
    const [relativePaths, mainAppImports, typeSafetyBypasses] = await Promise.all([
      findViolations(`${PACKAGES_PATH}**/*.{ts,vue}`, /from\s+['"]\.\.\//),
      findViolations(`${PACKAGES_PATH}**/*.{ts,vue}`, /from\s+['"]@\//),
      findViolations(`${SRC_PATH}**/*.{ts,vue}`, /as\s+any|@ts-ignore/),
    ]);
    
    const passed = relativePaths === 0 && mainAppImports === 0 && typeSafetyBypasses === 0;

    return { relativePaths, mainAppImports, typeSafetyBypasses, passed };
  } catch (error) {
    console.error('An error occurred during cross-platform integrity check:', error);
    return { relativePaths: -1, mainAppImports: -1, typeSafetyBypasses: -1, passed: false };
  }
}

async function main() {
  const pathsToCheck = [PACKAGES_PATH, SRC_PATH];
  const cachedResult = await validateCheckpoint(CHECKPOINT_NAME, pathsToCheck);

  if (cachedResult && cachedResult.result === 'passed') {
    console.log('✅ Architecture Integrity Check (Cached)');
    console.log(`  • Relative Path Violations: ${cachedResult.details.relativePaths} ✅`);
    console.log(`  • Main App Import Violations: ${cachedResult.details.mainAppImports} ✅`);
    console.log(`  • Type Safety Bypasses: ${cachedResult.details.typeSafetyBypasses} ✅`);
    return;
  }

  const result = await runIntegrityCheck();
  const status = result.passed ? 'passed' : 'failed';

  await updateCheckpoint(CHECKPOINT_NAME, status, pathsToCheck, result);

  if (result.passed) {
    console.log('✅ Architecture Integrity Check Passed');
  } else {
    console.error('❌ Architecture Integrity Check Failed');
  }
  
  console.log(`  • Relative Path Violations: ${result.relativePaths}`);
  console.log(`  • Main App Import Violations: ${result.mainAppImports}`);
  console.log(`  • Type Safety Bypasses: ${result.typeSafetyBypasses}`);
  
  if (!result.passed) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
});
