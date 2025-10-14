import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdirSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { generateComposables } from '../../src/core/generator'
import type { GeneratorConfig } from '../../src/core/types'

describe('Full Generation Integration', () => {
  const tempDir = join(process.cwd(), 'tests', 'temp')
  const outputDir = join(tempDir, 'composables')
  const schemaPath = join(process.cwd(), 'tests', 'fixtures', 'sample-api.json')

  beforeAll(() => {
    // Create temp directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true })
    }
    mkdirSync(tempDir, { recursive: true })
  })

  afterAll(() => {
    // Cleanup
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true })
    }
  })

  it('generates composables from OpenAPI schema', async () => {
    const config: GeneratorConfig = {
      schemaPath,
      outputDir,
      cookieName: 'testToken',
      generateTypes: false
    }

    await generateComposables(config)

    // Check that files were created
    expect(existsSync(join(outputDir, 'useTasksApi.ts'))).toBe(true)
    expect(existsSync(join(outputDir, 'useGoalsApi.ts'))).toBe(true)
    expect(existsSync(join(outputDir, 'useHabitsApi.ts'))).toBe(true)
  })

  it('generates correct content in composable files', async () => {
    const config: GeneratorConfig = {
      schemaPath,
      outputDir,
      generateTypes: false
    }

    await generateComposables(config)

    const tasksContent = readFileSync(join(outputDir, 'useTasksApi.ts'), 'utf-8')

    // Check imports
    expect(tasksContent).toContain("import { useApi } from '~/composables/useApi'")

    // Check composable name
    expect(tasksContent).toContain('export const useTasksApi')

    // Check method names
    expect(tasksContent).toContain('getTasks')
    expect(tasksContent).toContain('postTasks')
    expect(tasksContent).toContain('getTask')
    expect(tasksContent).toContain('patchTask')
    expect(tasksContent).toContain('deleteTask')

    // Check paths
    expect(tasksContent).toContain("path: '/api/tasks'")
    expect(tasksContent).toContain("path: '/api/tasks/{id}'")

    // Check methods
    expect(tasksContent).toContain("method: 'get'")
    expect(tasksContent).toContain("method: 'post'")
    expect(tasksContent).toContain("method: 'patch'")
    expect(tasksContent).toContain("method: 'delete'")
  })

  it('generates composable with custom useApi import path', async () => {
    const customOutputDir = join(tempDir, 'custom-composables')
    const config: GeneratorConfig = {
      schemaPath,
      outputDir: customOutputDir,
      useApiImportPath: '#app/composables/useApi',
      generateTypes: false
    }

    await generateComposables(config)

    const tasksContent = readFileSync(join(customOutputDir, 'useTasksApi.ts'), 'utf-8')
    expect(tasksContent).toContain("import { useApi } from '#app/composables/useApi'")
  })

  it('handles action endpoints correctly', async () => {
    const config: GeneratorConfig = {
      schemaPath,
      outputDir,
      generateTypes: false
    }

    await generateComposables(config)

    const habitsContent = readFileSync(join(outputDir, 'useHabitsApi.ts'), 'utf-8')
    expect(habitsContent).toContain('getHabitStreak')
    expect(habitsContent).toContain("path: '/api/habits/{id}/streak'")
  })

  it('throws error for non-existent schema file', async () => {
    const config: GeneratorConfig = {
      schemaPath: './non-existent-schema.json',
      outputDir,
      generateTypes: false
    }

    await expect(generateComposables(config)).rejects.toThrow()
  })

  it('throws error for missing required config', async () => {
    const config: any = {
      outputDir
      // Missing schemaPath
    }

    await expect(generateComposables(config)).rejects.toThrow('Schema path is required')
  })
})

