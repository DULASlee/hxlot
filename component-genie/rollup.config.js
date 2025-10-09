// ComponentGenie 根级别 Rollup 配置
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

const isProduction = process.env.NODE_ENV === 'production';

// 构建配置工厂函数
export function createRollupConfig(pkg, input, external = []) {
  const configs = [];
  
  // ESM + CJS 构建
  configs.push({
    input,
    external: [
      ...external,
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    output: [
      {
        file: pkg.exports?.['.']?.import || pkg.module,
        format: 'es',
        sourcemap: !isProduction,
      },
      {
        file: pkg.exports?.['.']?.require || pkg.main,
        format: 'cjs',
        sourcemap: !isProduction,
        exports: 'named',
      },
    ],
    plugins: [
      resolve({
        preferBuiltins: true,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false, // 类型声明单独处理
        sourceMap: !isProduction,
      }),
      ...(isProduction ? [terser({
        compress: {
          drop_console: true,
        },
      })] : []),
    ],
  });

  // 类型声明构建
  configs.push({
    input,
    output: {
      file: pkg.exports?.['.']?.types || pkg.types,
      format: 'es',
    },
    plugins: [
      dts({
        respectExternal: true,
      }),
    ],
    external: [
      ...external,
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
  });

  return configs;
}

export default [];
