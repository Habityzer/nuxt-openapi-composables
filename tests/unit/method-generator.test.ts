import { describe, it, expect } from 'vitest'
import { generateComposable, getGeneratedMethods } from '../../src/core/method-generator'
import type { OpenAPISchema } from '../../src/core/types'

describe('Method Generator', () => {
  const createMockSchema = (): OpenAPISchema => ({
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/api/tasks': {
        get: {
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': { schema: { type: 'array' } }
              }
            }
          }
        },
        post: {
          requestBody: {
            content: {
              'application/json': { schema: { type: 'object' } }
            }
          },
          responses: {
            '201': { description: 'Created' }
          }
        }
      },
      '/api/tasks/{id}': {
        get: {
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': { schema: { type: 'object' } }
              }
            }
          }
        },
        patch: {
          requestBody: {
            content: {
              'application/merge-patch+json': { schema: { type: 'object' } }
            }
          },
          responses: {
            '200': { description: 'Updated' }
          }
        },
        delete: {
          responses: {
            '204': { description: 'Deleted' }
          }
        }
      }
    }
  })

  describe('generateComposable', () => {
    it('generates a complete composable file', () => {
      const schema = createMockSchema()
      const result = generateComposable('tasks', schema)

      expect(result).toBeTruthy()
      expect(result).toContain("import { useOpenApi } from './useOpenApi'")
      expect(result).toContain('export const useTasksApi = () => {')
      expect(result).toContain("const { createApiMethod } = useOpenApi()")
    })

    it('generates correct method definitions', () => {
      const schema = createMockSchema()
      const result = generateComposable('tasks', schema)

      expect(result).toContain('getTasksApi')
      expect(result).toContain('postTasksApi')
      expect(result).toContain('getTaskApi')
      expect(result).toContain('patchTaskApi')
      expect(result).toContain('deleteTaskApi')
    })

    it('includes correct paths and methods', () => {
      const schema = createMockSchema()
      const result = generateComposable('tasks', schema)

      expect(result).toContain("path: '/api/tasks'")
      expect(result).toContain("method: 'get'")
      expect(result).toContain("method: 'post'")
      expect(result).toContain("path: '/api/tasks/{id}'")
      expect(result).toContain("method: 'patch'")
      expect(result).toContain("method: 'delete'")
    })

    it('includes correct content types', () => {
      const schema = createMockSchema()
      const result = generateComposable('tasks', schema)

      expect(result).toContain("contentType: 'application/json'")
      expect(result).toContain("contentType: 'application/merge-patch+json'")
    })

    it('returns all methods in the return statement', () => {
      const schema = createMockSchema()
      const result = generateComposable('tasks', schema)

      expect(result).toContain('return {')
      expect(result).toMatch(/return\s*\{[\s\S]*getTasksApi/)
      expect(result).toMatch(/return\s*\{[\s\S]*postTasksApi/)
      expect(result).toMatch(/return\s*\{[\s\S]*getTaskApi/)
      expect(result).toMatch(/return\s*\{[\s\S]*patchTaskApi/)
      expect(result).toMatch(/return\s*\{[\s\S]*deleteTaskApi/)
    })

    it('uses local useOpenApi import', () => {
      const schema = createMockSchema()
      const result = generateComposable('tasks', schema)

      expect(result).toContain("import { useOpenApi } from './useOpenApi'")
    })

    it('returns empty string for non-existent resource', () => {
      const schema = createMockSchema()
      const result = generateComposable('nonexistent', schema)

      expect(result).toBe('')
    })
  })

  describe('getGeneratedMethods', () => {
    it('returns all generated methods for a resource', () => {
      const schema = createMockSchema()
      const methods = getGeneratedMethods('tasks', schema)

      expect(methods).toHaveLength(5)
      expect(methods.map(m => m.name)).toEqual([
        'getTasksApi',
        'postTasksApi',
        'getTaskApi',
        'patchTaskApi',
        'deleteTaskApi'
      ])
    })

    it('includes correct method details', () => {
      const schema = createMockSchema()
      const methods = getGeneratedMethods('tasks', schema)

      const getCollection = methods.find(m => m.name === 'getTasksApi')
      expect(getCollection).toEqual({
        name: 'getTasksApi',
        path: '/api/tasks',
        httpMethod: 'get',
        contentType: 'application/json'
      })

      const patchItem = methods.find(m => m.name === 'patchTaskApi')
      expect(patchItem).toEqual({
        name: 'patchTaskApi',
        path: '/api/tasks/{id}',
        httpMethod: 'patch',
        contentType: 'application/merge-patch+json'
      })
    })
  })
})

