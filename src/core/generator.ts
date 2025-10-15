import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { consola } from 'consola'
import type { GeneratorConfig, OpenAPISchema } from './types'
import { toPascalCase } from './naming'
import { extractResources } from './resource-parser'
import { generateComposable } from './method-generator'

/**
 * Generate TypeScript types using openapi-typescript
 */
async function generateTypes(
  schemaPath: string,
  outputPath: string
): Promise<void> {
  try {
    const openapiTS = await import('openapi-typescript')
    
    // Read and parse the schema first to handle OpenAPI 3.1
    const schemaContent = readFileSync(schemaPath, 'utf-8')
    const schema = JSON.parse(schemaContent)
    
    // Generate types directly from the parsed schema object
    const output = await openapiTS.default(schema, {
      defaultNonNullable: false
    })

    // Ensure output directory exists
    const outputDir = dirname(outputPath)
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }

    // Convert output to string if it's not already
    const outputString = typeof output === 'string' ? output : String(output)
    writeFileSync(outputPath, outputString, 'utf-8')
    consola.success(`Generated TypeScript types at ${outputPath}`)
  } catch (error) {
    consola.error('Failed to generate TypeScript types:', error)
    throw error
  }
}

/**
 * Validate OpenAPI schema
 */
function validateSchema(schema: OpenAPISchema): void {
  if (!schema.openapi) {
    throw new Error('Invalid OpenAPI schema: missing "openapi" field')
  }

  if (!schema.paths || Object.keys(schema.paths).length === 0) {
    throw new Error('Invalid OpenAPI schema: no paths defined')
  }

  consola.info(`OpenAPI version: ${schema.openapi}`)
  consola.info(`API title: ${schema.info?.title || 'Unknown'}`)
  consola.info(`API version: ${schema.info?.version || 'Unknown'}`)
}

/**
 * Copy useOpenApi.ts to output directory with correct types path and optional default prefix
 */
function copyUseOpenApi(
  outputDir: string,
  typesImportPath?: string,
  defaultApiPrefix?: string
): void {
  try {
    // Try to read from dist/templates (when running from built package)
    // or from templates/ (when running from source during tests)
    let sourceFile = join(__dirname, '../templates/useOpenApi.ts')
    if (!existsSync(sourceFile)) {
      sourceFile = join(__dirname, '../../templates/useOpenApi.ts')
    }
    
    let content = readFileSync(sourceFile, 'utf-8')
    
    // Replace the types import path if provided
    if (typesImportPath) {
      content = content.replace(
        /import type { paths } from '~\/types\/api'/,
        `import type { paths } from '${typesImportPath}'`
      )
    }
    
    // Replace the default API prefix if provided
    if (defaultApiPrefix !== undefined) {
      content = content.replace(
        /return config\.public\.apiPrefix \|\| ''/,
        `return config.public.apiPrefix || '${defaultApiPrefix}'`
      )
    }
    
    // Add configuration comment at the top
    const configComment = `/**
 * API Configuration:
 * 
 * To configure the API prefix in your Nuxt project, add this to your nuxt.config.ts:
 * 
 * export default defineNuxtConfig({
 *   runtimeConfig: {
 *     public: {
 *       apiPrefix: '/api/symfony' // or your custom prefix
 *     }
 *   }
 * })
 * 
 * Or use environment variable: NUXT_PUBLIC_API_PREFIX=/api/symfony
 * 
 * If not configured, defaults to: '${defaultApiPrefix || ''}'
 * 
 * Error Handling:
 * All API errors are thrown and can be caught by your application.
 * Errors include statusCode and statusMessage properties.
 * 
 * Example:
 * try {
 *   await getUserWords()
 * } catch (error) {
 *   if (error.statusCode === 401) {
 *     // Handle authentication error (redirect to login, etc.)
 *   }
 * }
 */

`
    content = configComment + content
    
    // Write to output directory
    const outputPath = join(outputDir, 'useOpenApi.ts')
    writeFileSync(outputPath, content, 'utf-8')
    consola.success('✓ useOpenApi.ts')
  } catch (error) {
    consola.warn('✗ Failed to copy useOpenApi.ts:', error)
  }
}

/**
 * Main function to generate composables from OpenAPI schema
 */
export async function generateComposables(
  config: GeneratorConfig
): Promise<void> {
  try {
    consola.start('Starting composables generation...')

    // Validate config
    if (!config.schemaPath) {
      throw new Error('Schema path is required')
    }

    if (!config.outputDir) {
      throw new Error('Output directory is required')
    }

    // Read the OpenAPI schema
    consola.info(`Reading OpenAPI schema from: ${config.schemaPath}`)

    if (!existsSync(config.schemaPath)) {
      throw new Error(`OpenAPI schema file not found at ${config.schemaPath}`)
    }

    const schemaContent = readFileSync(config.schemaPath, 'utf-8')
    const schema: OpenAPISchema = JSON.parse(schemaContent)

    // Validate schema
    validateSchema(schema)

    // Generate TypeScript types if requested
    if (config.generateTypes && config.typesOutputPath) {
      consola.start('Generating TypeScript types...')
      await generateTypes(config.schemaPath, config.typesOutputPath)
    }

    // Extract unique resources
    const resources = extractResources(schema)

    if (resources.size === 0) {
      throw new Error('No API resources found in the schema')
    }

    consola.info(`Found ${resources.size} resources: ${Array.from(resources).join(', ')}`)

    // Create composables directory if it doesn't exist
    if (!existsSync(config.outputDir)) {
      mkdirSync(config.outputDir, { recursive: true })
      consola.info(`Created output directory: ${config.outputDir}`)
    }

    // Copy useOpenApi.ts to output directory
    copyUseOpenApi(config.outputDir, config.typesImportPath, config.apiPrefix)

    // Generate composables for each resource
    let generatedCount = 0
    const totalResources = resources.size
    let currentIndex = 0
    
    for (const resource of resources) {
      currentIndex++
      
      const composable = generateComposable(
        resource,
        schema,
        config.useApiImportPath
      )

      if (composable) {
        const fileName = `use${toPascalCase(resource)}Api.ts`
        const filePath = join(config.outputDir, fileName)
        
        writeFileSync(filePath, composable, { flag: 'w' }) // Force overwrite
        consola.success(`[${currentIndex}/${totalResources}] ✓ ${fileName}`)
        generatedCount++
      } else {
        consola.warn(`[${currentIndex}/${totalResources}] ✗ No composable generated for ${resource}`)
      }
    }

    consola.success(`Successfully generated ${generatedCount} composables`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    consola.error('Error generating composables:', errorMessage)
    throw error
  }
}

/**
 * Generate composables with default error handling
 */
export async function generateComposablesWithErrorHandling(
  config: GeneratorConfig
): Promise<void> {
  try {
    await generateComposables(config)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    consola.error('Fatal error:', errorMessage)
    process.exit(1)
  }
}

