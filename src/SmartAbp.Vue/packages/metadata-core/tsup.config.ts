import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'validators/index': 'src/validators/index.ts',
    'types/index': 'src/types/index.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  outDir: 'dist',
  external: [],
  noExternal: ['zod', 'nanoid'],
  platform: 'neutral',
  target: 'es2020'
})
