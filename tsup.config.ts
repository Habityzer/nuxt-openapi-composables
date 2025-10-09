import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'cli/index': 'src/cli/index.ts',
    'module/nuxt': 'src/module/nuxt.ts',
    'runtime/useApi': 'src/runtime/useApi.ts'
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  shims: true,
  splitting: false,
  treeshake: true,
  external: [
    'nuxt',
    '@nuxt/kit',
    '#app',
    'pathe',
    'commander',
    'consola',
    'openapi-typescript'
  ]
})

