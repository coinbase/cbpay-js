import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/internal.ts'],
  splitting: true,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  target: 'es5',
});
