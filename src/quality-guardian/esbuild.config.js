import esbuild from 'esbuild';
import pkg from './package.json' assert { type: 'json' };

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

esbuild.build({
  entryPoints: ['src/cli.ts'],
  bundle: true,
  platform: 'node',
  outfile: 'dist/cli.js',
  format: 'esm',
  external: external,
}).catch(() => process.exit(1));
