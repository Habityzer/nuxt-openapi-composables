import { describe, it, expect } from 'vitest'
import { toPascalCase, getResourceName, generateMethodName } from '../../src/core/naming'
import type { OpenAPISchema } from '../../src/core/types'

describe('Naming Utilities', () => {
  describe('toPascalCase', () => {
    it('converts kebab-case to PascalCase', () => {
      expect(toPascalCase('user-limits')).toBe('UserLimits')
      expect(toPascalCase('task-statuses')).toBe('TaskStatuses')
      expect(toPascalCase('goal-stats')).toBe('GoalStats')
    })

    it('converts snake_case to PascalCase', () => {
      expect(toPascalCase('user_limits')).toBe('UserLimits')
      expect(toPascalCase('task_statuses')).toBe('TaskStatuses')
      expect(toPascalCase('habit_entries')).toBe('HabitEntries')
    })

    it('converts camelCase to PascalCase', () => {
      expect(toPascalCase('userLimits')).toBe('UserLimits')
      expect(toPascalCase('taskStatuses')).toBe('TaskStatuses')
      expect(toPascalCase('habitEntries')).toBe('HabitEntries')
    })

    it('handles single words', () => {
      expect(toPascalCase('tasks')).toBe('Tasks')
      expect(toPascalCase('goals')).toBe('Goals')
      expect(toPascalCase('habits')).toBe('Habits')
    })

    it('handles multiple separators', () => {
      expect(toPascalCase('user-api_token')).toBe('UserApiToken')
      expect(toPascalCase('my_super-cool_name')).toBe('MySuperCoolName')
    })

    it('handles spaces', () => {
      expect(toPascalCase('user limits')).toBe('UserLimits')
      expect(toPascalCase('task statuses')).toBe('TaskStatuses')
    })
  })

  describe('getResourceName', () => {
    const createMockSchema = (path: string, tag?: string): OpenAPISchema => ({
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        [path]: {
          get: {
            ...(tag && { tags: [tag] })
          }
        }
      }
    })

    it('extracts resource name from standard API paths', () => {
      const schema = createMockSchema('/api/tasks')
      expect(getResourceName('/api/tasks', schema)).toBe('tasks')
    })

    it('extracts resource name with multiple segments', () => {
      const schema = createMockSchema('/api/habit-entries')
      expect(getResourceName('/api/habit-entries', schema)).toBe('habit-entries')
    })

    it('handles auth endpoints specially', () => {
      const schema1 = createMockSchema('/auth/login')
      expect(getResourceName('/auth/login', schema1)).toBe('authentication')

      const schema2 = createMockSchema('/api/auth/token')
      expect(getResourceName('/api/auth/token', schema2)).toBe('authentication')
    })

    it('falls back to OpenAPI tags when path extraction fails', () => {
      const schema: OpenAPISchema = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/custom/path': {
            get: {
              tags: ['UserLimits']
            }
          }
        }
      }
      expect(getResourceName('/custom/path', schema)).toBe('user-limits')
    })

    it('handles tags with spaces', () => {
      const schema: OpenAPISchema = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/custom/path': {
            get: {
              tags: ['Login Check']
            }
          }
        }
      }
      expect(getResourceName('/custom/path', schema)).toBe('login-check')
    })
  })

  describe('generateMethodName', () => {
    const createMockSchema = (path: string): OpenAPISchema => ({
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        [path]: {
          get: {}
        }
      }
    })

    describe('collection endpoints', () => {
      it('generates correct name for GET collection', () => {
        const schema = createMockSchema('/api/tasks')
        expect(generateMethodName('/api/tasks', 'get', schema)).toBe('getTasks')
      })

      it('generates correct name for POST collection', () => {
        const schema = createMockSchema('/api/tasks')
        expect(generateMethodName('/api/tasks', 'post', schema)).toBe('postTasks')
      })
    })

    describe('single item endpoints', () => {
      it('generates correct name for GET item', () => {
        const schema = createMockSchema('/api/tasks/{id}')
        expect(generateMethodName('/api/tasks/{id}', 'get', schema)).toBe('getTask')
      })

      it('generates correct name for PATCH item', () => {
        const schema = createMockSchema('/api/tasks/{id}')
        expect(generateMethodName('/api/tasks/{id}', 'patch', schema)).toBe('patchTask')
      })

      it('generates correct name for DELETE item', () => {
        const schema = createMockSchema('/api/tasks/{id}')
        expect(generateMethodName('/api/tasks/{id}', 'delete', schema)).toBe('deleteTask')
      })
    })

    describe('custom parameter endpoints', () => {
      it('generates correct name for custom parameter', () => {
        const schema = createMockSchema('/api/tasks/{entityType}')
        expect(generateMethodName('/api/tasks/{entityType}', 'get', schema)).toBe(
          'getTasksByEntityType'
        )
      })
    })

    describe('action endpoints', () => {
      it('generates correct name for action endpoints', () => {
        const schema = createMockSchema('/api/habits/{id}/streak')
        expect(generateMethodName('/api/habits/{id}/streak', 'get', schema)).toBe(
          'getHabitStreak'
        )
      })
    })

    describe('multi-word resources', () => {
      it('handles kebab-case resource names', () => {
        const schema = createMockSchema('/api/habit-entries')
        expect(generateMethodName('/api/habit-entries', 'get', schema)).toBe(
          'getHabitEntries'
        )
      })

      it('handles snake_case resource names', () => {
        const schema = createMockSchema('/api/user_limits')
        expect(generateMethodName('/api/user_limits', 'get', schema)).toBe(
          'getUserLimits'
        )
      })
    })
  })
})

