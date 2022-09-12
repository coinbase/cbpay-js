import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/internal.ts'],
  splitting: true,
  sourcemap: true,
  clean: true,
  dts: {
    resolve: true,
  },
  format: ['cjs', 'esm'],
  target: 'es5',
});
