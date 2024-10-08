import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import clear from 'rollup-plugin-clear'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace';

export default defineConfig({
  input: 'lib/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    chunkFileNames: '[name].js'
  },
  external: ['ts-morph'],
  plugins: [
    json(),
    nodeResolve(),
    commonjs(),
    clear({ targets: ['dist'] }),
    typescript({
      tsconfig: 'tsconfig.json',
    }),
    replace({
      preventAssignment: true,
      "process.env.BUILD": true,
    }),
  ],
})