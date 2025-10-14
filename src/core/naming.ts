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
 * Convert resource name to singular form (basic implementation)
 */
function toSingular(str: string): string {
  // Handle common patterns
  if (str.endsWith('ies')) {
    return str.slice(0, -3) + 'y' // entries -> entry
  }
  if (str.endsWith('sses')) {
    return str.slice(0, -2) // classes -> class
  }
  if (str.endsWith('s') && !str.endsWith('ss')) {
    return str.slice(0, -1) // users -> user
  }
  return str
}

/**
 * Generate descriptive method name for an API endpoint
 * Examples:
 * - GET /api/user-words/user-words -> getUserWords
 * - POST /api/user-words/batch -> postUserWordsBatch
 * - GET /api/user-words/random -> getRandomUserWords
 * - GET /api/user-words/user-words/{id} -> getUserWord
 * - DELETE /api/user-words/user-words/{id} -> deleteUserWord
 * - GET /api/habits/{id}/streak -> getHabitStreak
 */
export function generateMethodName(
  path: string,
  method: string,
  schema: OpenAPISchema
): string {
  const resourceName = getResourceName(path, schema)
  if (!resourceName) return method

  const baseName = toPascalCase(resourceName)
  
  // Split the path into segments
  const pathSegments = path.split('/').filter(seg => seg && seg !== 'api')
  
  // Check if path has parameters
  const hasPathParams = path.includes('{')
  const hasIdParam = path.includes('{id}')
  
  // Find path modifiers (segments after the base resource that aren't parameters)
  // For example: /api/user-words/batch -> 'batch' is the modifier
  // /api/user-words/random -> 'random' is the modifier
  // /api/habits/{id}/streak -> 'streak' is the modifier (action after ID)
  const baseResourceSegment = pathSegments[0] // e.g., 'user-words'
  const pathModifiers: string[] = []
  
  for (let i = 1; i < pathSegments.length; i++) {
    const segment = pathSegments[i]
    // Skip if it's a parameter or if it's the same as the base resource
    if (!segment.includes('{') && segment !== baseResourceSegment) {
      pathModifiers.push(segment)
    }
  }
  
  // Handle endpoints with {id} parameter (single resource operations)
  // Check if there are modifiers after the {id} (like /api/habits/{id}/streak)
  if (hasIdParam) {
    const singularName = toSingular(baseName)
    
    // If there are modifiers after {id}, it's an action on the resource
    if (pathModifiers.length > 0) {
      const modifierPascal = pathModifiers.map(m => toPascalCase(m)).join('')
      return `${method}${singularName}${modifierPascal}`
    }
    
    // Otherwise, it's a standard single resource operation
    return `${method}${singularName}`
  }
  
  // Handle endpoints with custom parameters (not {id})
  if (hasPathParams) {
    // Extract the parameter name from the path
    const paramMatch = path.match(/\{([^}]+)\}/)
    if (paramMatch) {
      const paramName = paramMatch[1]
      const paramNamePascal = toPascalCase(paramName)
      return `${method}${baseName}By${paramNamePascal}`
    }
  }
  
  // Handle endpoints with path modifiers (like /batch, /random)
  if (pathModifiers.length > 0) {
    const modifierPascal = pathModifiers.map(m => toPascalCase(m)).join('')
    
    // For GET requests with modifiers, you can put modifier first or last
    // e.g., getRandomUserWords or getUserWordsRandom
    // Let's use: get + Modifier + ResourceName pattern for GET
    // and: method + ResourceName + Modifier for others
    if (method === 'get') {
      return `${method}${modifierPascal}${baseName}`
    } else {
      return `${method}${baseName}${modifierPascal}`
    }
  }
  
  // Handle collection endpoints (no params, no modifiers)
  // These are base resource endpoints
  return `${method}${baseName}`
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

