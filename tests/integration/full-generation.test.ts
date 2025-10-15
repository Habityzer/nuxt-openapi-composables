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
    expect(tasksContent).toContain("import { useOpenApi } from './useOpenApi'")

    // Check composable name
    expect(tasksContent).toContain('export const useTasksApi')

    // Check method names
    expect(tasksContent).toContain('getTasksApi')
    expect(tasksContent).toContain('postTasksApi')
    expect(tasksContent).toContain('getTaskApi')
    expect(tasksContent).toContain('patchTaskApi')
    expect(tasksContent).toContain('deleteTaskApi')

    // Check paths
    expect(tasksContent).toContain("path: '/api/tasks'")
    expect(tasksContent).toContain("path: '/api/tasks/{id}'")

    // Check methods
    expect(tasksContent).toContain("method: 'get'")
    expect(tasksContent).toContain("method: 'post'")
    expect(tasksContent).toContain("method: 'patch'")
    expect(tasksContent).toContain("method: 'delete'")
  })

  it('copies useOpenApi.ts to output directory', async () => {
    const config: GeneratorConfig = {
      schemaPath,
      outputDir,
      generateTypes: false
    }

    await generateComposables(config)

    // Check that useOpenApi.ts was copied
    expect(existsSync(join(outputDir, 'useOpenApi.ts'))).toBe(true)
    
    const useOpenApiContent = readFileSync(join(outputDir, 'useOpenApi.ts'), 'utf-8')
    expect(useOpenApiContent).toContain('export const useOpenApi')
  })

  it('handles action endpoints correctly', async () => {
    const config: GeneratorConfig = {
      schemaPath,
      outputDir,
      generateTypes: false
    }

    await generateComposables(config)

    const habitsContent = readFileSync(join(outputDir, 'useHabitsApi.ts'), 'utf-8')
    expect(habitsContent).toContain('getHabitStreakApi')
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

