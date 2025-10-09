import { defineNuxtModule, createResolver, addImportsDir, addTemplate } from '@nuxt/kit'
import type { GeneratorConfig } from '../core/types'

export interface ModuleOptions extends Partial<GeneratorConfig> {
  /**
   * Enable auto-import of generated composables
   * @default true
   */
  autoImport?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-openapi-composables',
    configKey: 'openapiComposables',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    schemaPath: './schema/api.json',
    outputDir: './app/composables/api',
    cookieName: 'authToken',
    baseApiPath: '/api',
    generateTypes: false,
    typesOutputPath: './app/types/api.ts',
    autoImport: true
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add runtime directory to Nuxt
    nuxt.options.alias['#nuxt-openapi-composables'] = resolver.resolve('../runtime')

    // Auto-import the runtime useApi composable
    addTemplate({
      filename: 'nuxt-openapi-composables-runtime.mjs',
      getContents: () => {
        return `
import { createUseApi } from '#nuxt-openapi-composables/useApi'

export const useApi = createUseApi({
  cookieName: '${options.cookieName}',
  baseURL: '${options.baseApiPath}'
})
`
      }
    })

    // Auto-import generated composables if enabled
    if (options.autoImport && options.outputDir) {
      try {
        addImportsDir(resolver.resolve(nuxt.options.rootDir, options.outputDir))
      } catch (error) {
        // Directory might not exist yet - that's okay
        // Users need to run the generator first
      }
    }

    // Log setup info
    if (nuxt.options.dev) {
      console.log('🚀 Nuxt OpenAPI Composables module loaded')
      console.log(`   Schema: ${options.schemaPath}`)
      console.log(`   Output: ${options.outputDir}`)
      console.log(`   Auto-import: ${options.autoImport}`)
      console.log('')
      console.log('   Run "nuxt-openapi-composables generate" to create composables')
    }
  }
})

// Export types
export type { GeneratorConfig }

