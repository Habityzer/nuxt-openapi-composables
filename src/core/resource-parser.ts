import type { OpenAPISchema, PathItem, Operation } from './types'
import { getResourceName } from './naming'

/**
 * Get content type for a path and method from the OpenAPI schema
 */
export function getContentType(
  path: string,
  method: string,
  schema: OpenAPISchema
): string {
  const pathItem = schema.paths[path]
  if (!pathItem || !pathItem[method as keyof PathItem]) {
    return 'application/json' // Default to JSON
  }

  const operation = pathItem[method as keyof PathItem] as Operation
  const isCollection = !path.includes('{id}')

  // Check request body content type first (for POST/PUT/PATCH)
  if (operation.requestBody?.content) {
    const contentTypes = Object.keys(operation.requestBody.content)
    // Use merge-patch for PATCH operations
    if (method === 'patch' && contentTypes.includes('application/merge-patch+json')) {
      return 'application/merge-patch+json'
    }
    // For other operations, prefer simple JSON
    if (contentTypes.includes('application/json')) return 'application/json'
    if (contentTypes.includes('application/ld+json')) return 'application/ld+json'
    return contentTypes[0] // Return first available content type
  }

  // Check response content type (for GET operations)
  if (operation.responses?.['200']?.content) {
    const contentTypes = Object.keys(operation.responses['200'].content)

    // For collection GET endpoints, prefer JSON-LD (pagination, filtering)
    if (method === 'get' && isCollection) {
      if (contentTypes.includes('application/ld+json')) return 'application/ld+json'
      if (contentTypes.includes('application/json')) return 'application/json'
    }

    // For single item operations, prefer simple JSON
    if (contentTypes.includes('application/json')) return 'application/json'
    if (contentTypes.includes('application/ld+json')) return 'application/ld+json'
    return contentTypes[0] // Return first available content type
  }

  return 'application/json' // Default to JSON
}

/**
 * Extract all unique resources from OpenAPI paths
 */
export function extractResources(schema: OpenAPISchema): Set<string> {
  const resources = new Set<string>()
  const paths = schema.paths || {}

  Object.entries(paths).forEach(([path]) => {
    const resource = getResourceName(path, schema)
    if (resource) resources.add(resource)
  })

  return resources
}

/**
 * Get all paths that belong to a specific resource
 */
export function getResourcePaths(
  resourceName: string,
  schema: OpenAPISchema
): Array<{ path: string; pathItem: PathItem }> {
  const paths = schema.paths || {}

  return Object.entries(paths)
    .filter(([path]) => {
      const pathResourceName = getResourceName(path, schema)
      return pathResourceName === resourceName
    })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, pathItem]) => ({ path, pathItem }))
}

/**
 * Get HTTP methods for a path item
 */
export function getHttpMethods(pathItem: PathItem): string[] {
  return Object.keys(pathItem).filter(key =>
    ['get', 'post', 'put', 'patch', 'delete'].includes(key)
  )
}

