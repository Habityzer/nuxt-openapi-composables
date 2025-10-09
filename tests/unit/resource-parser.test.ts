import { describe, it, expect } from 'vitest'
import {
  getContentType,
  extractResources,
  getResourcePaths,
  getHttpMethods
} from '../../src/core/resource-parser'
import type { OpenAPISchema, PathItem } from '../../src/core/types'

describe('Resource Parser', () => {
  describe('getContentType', () => {
    it('returns application/json by default', () => {
      const schema: OpenAPISchema = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {}
      }
      expect(getContentType('/api/tasks', 'get', schema)).toBe('application/json')
    })

    it('detects merge-patch for PATCH operations', () => {
      const schema: OpenAPISchema = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/api/tasks/{id}': {
            patch: {
              requestBody: {
                content: {
                  'application/merge-patch+json': {
                    schema: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
      expect(getContentType('/api/tasks/{id}', 'patch', schema)).toBe(
        'application/merge-patch+json'
      )
    })

    it('prefers application/json over application/ld+json for request body', () => {
      const schema: OpenAPISchema = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/api/tasks': {
            post: {
              requestBody: {
                content: {
                  'application/ld+json': { schema: { type: 'object' } },
                  'application/json': { schema: { type: 'object' } }
                }
              }
            }
          }
        }
      }
      expect(getContentType('/api/tasks', 'post', schema)).toBe('application/json')
    })

    it('prefers application/ld+json for collection GET responses', () => {
      const schema: OpenAPISchema = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/api/tasks': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/ld+json': { schema: { type: 'object' } },
                    'application/json': { schema: { type: 'object' } }
                  }
                }
              }
            }
          }
        }
      }
      expect(getContentType('/api/tasks', 'get', schema)).toBe('application/ld+json')
    })

    it('prefers application/json for single item GET responses', () => {
      const schema: OpenAPISchema = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/api/tasks/{id}': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/ld+json': { schema: { type: 'object' } },
                    'application/json': { schema: { type: 'object' } }
                  }
                }
              }
            }
          }
        }
      }
      expect(getContentType('/api/tasks/{id}', 'get', schema)).toBe('application/json')
    })
  })

  describe('extractResources', () => {
    it('extracts unique resources from paths', () => {
      const schema: OpenAPISchema = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/api/tasks': { get: {} },
          '/api/tasks/{id}': { get: {} },
          '/api/goals': { get: {} },
          '/api/habits': { get: {} }
        }
      }

      const resources = extractResources(schema)
      expect(resources.size).toBe(3)
      expect(resources.has('tasks')).toBe(true)
      expect(resources.has('goals')).toBe(true)
      expect(resources.has('habits')).toBe(true)
    })

    it('handles empty paths', () => {
      const schema: OpenAPISchema = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {}
      }

      const resources = extractResources(schema)
      expect(resources.size).toBe(0)
    })
  })

  describe('getResourcePaths', () => {
    it('returns all paths for a resource', () => {
      const schema: OpenAPISchema = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/api/tasks': { get: {}, post: {} },
          '/api/tasks/{id}': { get: {}, patch: {}, delete: {} },
          '/api/goals': { get: {} }
        }
      }

      const taskPaths = getResourcePaths('tasks', schema)
      expect(taskPaths).toHaveLength(2)
      expect(taskPaths[0].path).toBe('/api/tasks')
      expect(taskPaths[1].path).toBe('/api/tasks/{id}')
    })

    it('sorts paths alphabetically', () => {
      const schema: OpenAPISchema = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/api/tasks/{id}/complete': { post: {} },
          '/api/tasks': { get: {} },
          '/api/tasks/{id}': { get: {} }
        }
      }

      const taskPaths = getResourcePaths('tasks', schema)
      expect(taskPaths[0].path).toBe('/api/tasks')
      expect(taskPaths[1].path).toBe('/api/tasks/{id}')
      expect(taskPaths[2].path).toBe('/api/tasks/{id}/complete')
    })
  })

  describe('getHttpMethods', () => {
    it('returns HTTP methods from path item', () => {
      const pathItem: PathItem = {
        get: {},
        post: {},
        patch: {}
      }

      const methods = getHttpMethods(pathItem)
      expect(methods).toEqual(['get', 'post', 'patch'])
    })

    it('filters out non-HTTP method keys', () => {
      const pathItem: PathItem = {
        get: {},
        post: {},
        parameters: []
      }

      const methods = getHttpMethods(pathItem)
      expect(methods).toEqual(['get', 'post'])
    })
  })
})

