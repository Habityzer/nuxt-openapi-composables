/**
 * Main entry point for nuxt-openapi-composables
 */

// Export core functionality
export { generateComposables, generateComposablesWithErrorHandling } from './core/generator'
export { toPascalCase, getResourceName, generateMethodName } from './core/naming'
export {
  extractResources,
  getResourcePaths,
  getHttpMethods,
  getContentType
} from './core/resource-parser'
export { generateComposable, getGeneratedMethods } from './core/method-generator'

// Export types
export type {
  GeneratorConfig,
  OpenAPISchema,
  PathItem,
  Operation,
  Parameter,
  RequestBody,
  Response,
  MediaType,
  SchemaObject,
  GeneratedMethod,
  ResourceInfo
} from './core/types'

// Export runtime
export { createUseApi, useApi } from './runtime/useApi'
export type { UseApiConfig, ApiMethodOptions, ApiMethodParams } from './runtime/useApi'

// Export Nuxt module
export { default as NuxtModule } from './module/nuxt'

