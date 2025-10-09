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
      expect(result).toContain("import { useApi } from '~/composables/useApi'")
      expect(result).toContain('export const useTasksApi = () => {')
      expect(result).toContain("const { createApiMethod } = useApi()")
    })

    it('generates correct method definitions', () => {
      const schema = createMockSchema()
      const result = generateComposable('tasks', schema)

      expect(result).toContain('getTasksCollectionApi')
      expect(result).toContain('createTasksItemApi')
      expect(result).toContain('getTasksItemApi')
      expect(result).toContain('patchTasksItemApi')
      expect(result).toContain('deleteTasksItemApi')
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
      expect(result).toMatch(/return\s*\{[\s\S]*getTasksCollectionApi/)
      expect(result).toMatch(/return\s*\{[\s\S]*createTasksItemApi/)
      expect(result).toMatch(/return\s*\{[\s\S]*getTasksItemApi/)
      expect(result).toMatch(/return\s*\{[\s\S]*patchTasksItemApi/)
      expect(result).toMatch(/return\s*\{[\s\S]*deleteTasksItemApi/)
    })

    it('uses custom useApi import path when provided', () => {
      const schema = createMockSchema()
      const result = generateComposable('tasks', schema, '#app/composables/useApi')

      expect(result).toContain("import { useApi } from '#app/composables/useApi'")
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
        'getTasksCollectionApi',
        'createTasksItemApi',
        'getTasksItemApi',
        'patchTasksItemApi',
        'deleteTasksItemApi'
      ])
    })

    it('includes correct method details', () => {
      const schema = createMockSchema()
      const methods = getGeneratedMethods('tasks', schema)

      const getCollection = methods.find(m => m.name === 'getTasksCollectionApi')
      expect(getCollection).toEqual({
        name: 'getTasksCollectionApi',
        path: '/api/tasks',
        httpMethod: 'get',
        contentType: 'application/json'
      })

      const patchItem = methods.find(m => m.name === 'patchTasksItemApi')
      expect(patchItem).toEqual({
        name: 'patchTasksItemApi',
        path: '/api/tasks/{id}',
        httpMethod: 'patch',
        contentType: 'application/merge-patch+json'
      })
    })
  })
})

