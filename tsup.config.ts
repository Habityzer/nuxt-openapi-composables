import { defineConfig } from 'tsup'
import { copyFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

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
  ],
  async onSuccess() {
    // Copy useOpenApi.ts template to dist/templates/
    const templateDir = join(process.cwd(), 'dist', 'templates')
    const sourceFile = join(process.cwd(), 'templates', 'useOpenApi.ts')
    const destFile = join(templateDir, 'useOpenApi.ts')
    
    mkdirSync(templateDir, { recursive: true })
    copyFileSync(sourceFile, destFile)
    console.log('✓ Copied useOpenApi.ts template to dist/templates/')
  }
})

