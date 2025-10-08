import { defineConfig } from 'tsup';
export default defineConfig({
    entry: {
        index: 'index.ts',
        'components/index': 'src/components/index.ts',
        'views/index': 'src/views/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    outDir: 'dist',
    target: 'es2020',
    platform: 'browser',
    minify: false,
    external: [
        'vue',
        'element-plus',
        '@smartabp/lowcode-shared',
        '@smartabp/lowcode-core',
        '@vue-flow/core',
        '@vue-flow/minimap',
        '@vue-flow/controls',
        '@vue-flow/background',
    ],
});
