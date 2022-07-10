import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/utils/postMessage.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  target: ['chrome64', 'firefox62', 'safari11.1', 'edge79'],
});
