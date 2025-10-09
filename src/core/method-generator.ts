import type { OpenAPISchema, GeneratedMethod } from './types'
import { toPascalCase, generateMethodName, ensureUniqueMethodNames } from './naming'
import { getResourcePaths, getHttpMethods, getContentType } from './resource-parser'

/**
 * Generate a composable file for a specific resource
 */
export function generateComposable(
  resourceName: string,
  schema: OpenAPISchema,
  useApiImportPath?: string
): string {
  const resourcePaths = getResourcePaths(resourceName, schema)

  if (resourcePaths.length === 0) return ''

  // First pass: generate initial method names and detect duplicates
  const methodNames = new Map<string, string>()

  resourcePaths.forEach(({ path, pathItem }) => {
    const httpMethods = getHttpMethods(pathItem)

    httpMethods.forEach((method) => {
      const methodName = generateMethodName(path, method, schema)
      methodNames.set(`${path}:${method}`, methodName)
    })
  })

  // Second pass: ensure all method names are unique
  const finalMethodNames = ensureUniqueMethodNames(methodNames)

  // Generate method definitions
  const methods = resourcePaths
    .map(({ path, pathItem }) => {
      const httpMethods = getHttpMethods(pathItem)

      return httpMethods
        .map((method) => {
          const methodName = finalMethodNames.get(`${path}:${method}`)
          const contentType = getContentType(path, method, schema)
          return `  const ${methodName} = createApiMethod({
    path: '${path}',
    method: '${method}',
    contentType: '${contentType}'
  })`
        })
        .join('\n\n')
    })
    .filter(Boolean)
    .join('\n\n')

  // Generate return statement
  const returnMethods = Array.from(finalMethodNames.values())
    .map(methodName => `    ${methodName}`)
    .join(',\n')

  // Use resource name as-is from the API
  const composableName = toPascalCase(resourceName)

  // Determine import path for useApi
  const importPath = useApiImportPath || '~/composables/useApi'

  return `import { useApi } from '${importPath}'

export const use${composableName}Api = () => {
  const { createApiMethod } = useApi()

${methods}

  return {
${returnMethods}
  }
}
`
}

/**
 * Get all generated methods for a resource (useful for documentation/testing)
 */
export function getGeneratedMethods(
  resourceName: string,
  schema: OpenAPISchema
): GeneratedMethod[] {
  const resourcePaths = getResourcePaths(resourceName, schema)
  const methodNames = new Map<string, string>()

  // Generate method names
  resourcePaths.forEach(({ path, pathItem }) => {
    const httpMethods = getHttpMethods(pathItem)

    httpMethods.forEach((method) => {
      const methodName = generateMethodName(path, method, schema)
      methodNames.set(`${path}:${method}`, methodName)
    })
  })

  // Ensure unique names
  const finalMethodNames = ensureUniqueMethodNames(methodNames)

  // Build result array
  const result: GeneratedMethod[] = []

  resourcePaths.forEach(({ path, pathItem }) => {
    const httpMethods = getHttpMethods(pathItem)

    httpMethods.forEach((method) => {
      const name = finalMethodNames.get(`${path}:${method}`)
      const contentType = getContentType(path, method, schema)

      if (name) {
        result.push({
          name,
          path,
          httpMethod: method,
          contentType
        })
      }
    })
  })

  return result
}

