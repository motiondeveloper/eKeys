import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import afterEffectJsx from './rollup-plugin-ae';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.jsx',
    format: 'cjs',
  },
  plugins: [
    typescript({
      module: 'esnext',
      target: 'esnext',
      noImplicitAny: true,
      moduleResolution: 'node',
      strict: true,
      lib: ['esnext'],
    }),
    afterEffectJsx(),
  ],
};
