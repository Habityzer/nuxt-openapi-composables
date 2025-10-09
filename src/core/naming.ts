import type { OpenAPISchema, PathItem, Operation } from './types'

/**
 * Convert a string to PascalCase
 * Examples: 
 * - 'user-limits' -> 'UserLimits'
 * - 'task_statuses' -> 'TaskStatuses'
 * - 'habitEntries' -> 'HabitEntries'
 */
export function toPascalCase(str: string): string {
  // First handle camelCase by splitting at capital letters
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Insert dash before capital letters
    .split(/[-_\s]/) // Split on dash, underscore, and spaces
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * Extract resource name from API path and schema
 * Examples:
 * - '/api/tasks' -> 'tasks'
 * - '/api/goal-stats' -> 'goal-stats'
 * - '/auth/login' -> 'authentication'
 */
export function getResourceName(path: string, schema: OpenAPISchema): string {
  // Handle special auth endpoints first
  if (path.includes('/auth/') || path.includes('/login') || path.includes('/token')) {
    return 'authentication'
  }

  // Primary approach: Extract resource name directly from path
  const match = path.match(/\/api\/([^/]+)/)
  const pathResourceName = match?.[1] ?? ''

  // If we have a clear path-based resource name, use it
  if (pathResourceName) {
    return pathResourceName
  }

  // Fallback: Try to get the resource name from OpenAPI tags
  const pathItem = schema?.paths?.[path]
  if (pathItem) {
    // Look for the first HTTP method and get its tags
    const methods = ['get', 'post', 'put', 'patch', 'delete']
    for (const method of methods) {
      const operation = pathItem[method as keyof PathItem] as Operation | undefined
      if (operation?.tags?.[0]) {
        const tag = operation.tags[0]
        // Convert tag to lowercase with dashes (e.g., "UserLimits" -> "user-limits", "Login Check" -> "login-check")
        return tag
          .replace(/([a-z])([A-Z])/g, '$1-$2') // Split camelCase
          .replace(/\s+/g, '-') // Replace spaces with dashes
          .toLowerCase()
      }
    }
  }

  return ''
}

/**
 * Generate descriptive method name for an API endpoint
 * Examples:
 * - GET /api/tasks -> getTasksCollectionApi
 * - POST /api/tasks -> createTasksItemApi
 * - GET /api/tasks/{id} -> getTasksItemApi
 * - PATCH /api/tasks/{id} -> patchTasksItemApi
 * - DELETE /api/tasks/{id} -> deleteTasksItemApi
 */
export function generateMethodName(
  path: string,
  method: string,
  schema: OpenAPISchema
): string {
  const resourceName = getResourceName(path, schema)
  if (!resourceName) return method

  // Extract action from path if it exists (e.g., /api/resource/{id}/action)
  // But ignore path parameters (things in curly braces)
  const actionMatch = path.match(/\/api\/[^/]+\/[^/]+\/([^/]+)$/)
  if (actionMatch && !actionMatch[1].includes('{')) {
    const action = actionMatch[1]
    return `${action}${toPascalCase(resourceName)}Api`
  }

  // Handle paths with custom parameters (not just {id})
  const hasPathParams = path.includes('{')
  const isStandardIdPath = path.includes('{id}')
  const isCollection = !hasPathParams // Collection if no path parameters at all

  const baseName = toPascalCase(resourceName)

  // Handle collection endpoints (without any path parameters)
  if (isCollection) {
    if (method === 'get') return `get${baseName}CollectionApi` // Explicit: getTasksCollectionApi
    if (method === 'post') return `create${baseName}ItemApi` // Explicit: createTasksItemApi
  }

  // Handle single resource endpoints (with {id})
  if (isStandardIdPath) {
    if (method === 'get') return `get${baseName}ItemApi` // Explicit: getTasksItemApi
    if (method === 'patch') return `patch${baseName}ItemApi` // Explicit: patchTasksItemApi
    if (method === 'delete') return `delete${baseName}ItemApi` // Explicit: deleteTasksItemApi
  }

  // Handle endpoints with custom path parameters (like {entityType})
  if (hasPathParams && !isStandardIdPath) {
    // Extract the parameter name from the path
    const paramMatch = path.match(/\{([^}]+)\}/)
    if (paramMatch) {
      const paramName = paramMatch[1]
      const paramNamePascal = toPascalCase(paramName)

      if (method === 'get') return `get${baseName}ItemBy${paramNamePascal}Api`
      if (method === 'post') return `create${baseName}ItemBy${paramNamePascal}Api`
      if (method === 'patch') return `patch${baseName}ItemBy${paramNamePascal}Api`
      if (method === 'delete') return `delete${baseName}ItemBy${paramNamePascal}Api`
    }
  }

  return `${method}${baseName}Api`
}

/**
 * Ensure method names are unique by adding distinguishing path segments
 */
export function ensureUniqueMethodNames(
  methodNames: Map<string, string>
): Map<string, string> {
  const finalMethodNames = new Map<string, string>()
  const usedNames = new Set<string>()
  const methodNameCounts = new Map<string, number>()

  // Count occurrences of each method name
  methodNames.forEach((methodName) => {
    const count = methodNameCounts.get(methodName) || 0
    methodNameCounts.set(methodName, count + 1)
  })

  // Make duplicate names unique
  methodNames.forEach((methodName, key) => {
    const count = methodNameCounts.get(methodName) || 0
    const path = key.split(':')[0]

    // If this method name appears more than once OR already used, make it unique
    if (count > 1 || usedNames.has(methodName)) {
      // Extract a distinguishing part of the path
      const pathSegments = path.split('/').filter(Boolean)
      let uniqueName = methodName
      let foundUnique = false

      // Try to find a unique segment (skip 'api' and path parameters)
      for (let i = pathSegments.length - 1; i >= 0; i--) {
        const segment = pathSegments[i]
        if (segment !== 'api' && !segment.includes('{')) {
          // Convert segment to PascalCase and insert it
          const segmentPascal = toPascalCase(segment)
          // Insert the segment after the method verb (get, create, etc.)
          const methodVerbs = ['get', 'create', 'delete', 'patch', 'put']
          let inserted = false
          for (const verb of methodVerbs) {
            const verbCapitalized = verb.charAt(0).toUpperCase() + verb.slice(1)
            if (uniqueName.startsWith(verb)) {
              uniqueName = uniqueName.replace(
                verbCapitalized,
                `${verbCapitalized}${segmentPascal}`
              )
              inserted = true
              break
            }
          }

          // Check if this unique name is truly unique
          if (inserted && !usedNames.has(uniqueName)) {
            finalMethodNames.set(key, uniqueName)
            usedNames.add(uniqueName)
            foundUnique = true
            break
          }
          // Reset uniqueName for next iteration
          uniqueName = methodName
        }
      }

      // If we still don't have a unique name, fallback to adding a number
      if (!foundUnique) {
        let counter = 1
        let attemptName = `${methodName}${counter}`
        while (usedNames.has(attemptName)) {
          counter++
          attemptName = `${methodName}${counter}`
        }
        finalMethodNames.set(key, attemptName)
        usedNames.add(attemptName)
      }
    } else {
      finalMethodNames.set(key, methodName)
      usedNames.add(methodName)
    }
  })

  return finalMethodNames
}

