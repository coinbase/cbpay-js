import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/onramp/es5/initOnRamp.ts',
    'src/utils/postMessage.ts',
    'src/utils/CBPayInstance.ts',
  ],
  splitting: true,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  target: 'es5',
});
