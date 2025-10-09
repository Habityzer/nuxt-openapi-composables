#!/usr/bin/env node

import { Command } from 'commander'
import { consola } from 'consola'
import { resolve } from 'pathe'
import { existsSync } from 'node:fs'
import { generateComposablesWithErrorHandling } from '../core/generator'
import type { GeneratorConfig } from '../core/types'

const program = new Command()

program
  .name('nuxt-openapi-composables')
  .description('Generate type-safe Nuxt composables from OpenAPI schemas')
  .version('0.1.0')

program
  .command('generate')
  .description('Generate composables from OpenAPI schema')
  .option(
    '-s, --schema <path>',
    'Path to OpenAPI schema file',
    './schema/api.json'
  )
  .option(
    '-o, --output <dir>',
    'Output directory for composables',
    './app/composables/api'
  )
  .option(
    '-c, --cookie <name>',
    'Cookie name for authentication',
    'authToken'
  )
  .option(
    '-t, --types',
    'Generate TypeScript types using openapi-typescript',
    false
  )
  .option(
    '--types-output <path>',
    'Output path for TypeScript types',
    './app/types/api.ts'
  )
  .option(
    '--base-api-path <path>',
    'Base API path',
    '/api'
  )
  .option(
    '--use-api-import <path>',
    'Custom useApi import path (default: ~/composables/useApi)'
  )
  .action(async (options) => {
    try {
      // Resolve paths relative to current working directory
      const schemaPath = resolve(process.cwd(), options.schema)
      const outputDir = resolve(process.cwd(), options.output)
      const typesOutputPath = options.typesOutput
        ? resolve(process.cwd(), options.typesOutput)
        : undefined

      // Validate schema file exists
      if (!existsSync(schemaPath)) {
        consola.error(`Schema file not found at: ${schemaPath}`)
        process.exit(1)
      }

      // Build config
      const config: GeneratorConfig = {
        schemaPath,
        outputDir,
        cookieName: options.cookie,
        baseApiPath: options.baseApiPath,
        useApiImportPath: options.useApiImport,
        generateTypes: options.types,
        typesOutputPath
      }

      // Display configuration
      consola.box({
        title: '🚀 Nuxt OpenAPI Composables Generator',
        message: [
          `Schema: ${schemaPath}`,
          `Output: ${outputDir}`,
          `Cookie: ${config.cookieName}`,
          `Types: ${config.generateTypes ? 'Yes' : 'No'}`,
          config.generateTypes && typesOutputPath
            ? `Types Output: ${typesOutputPath}`
            : null,
          config.useApiImportPath
            ? `useApi Import: ${config.useApiImportPath}`
            : null
        ]
          .filter(Boolean)
          .join('\n')
      })

      // Generate composables
      await generateComposablesWithErrorHandling(config)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      consola.error('Failed to generate composables:', errorMessage)
      process.exit(1)
    }
  })

program
  .command('init')
  .description('Initialize nuxt-openapi-composables in your project')
  .action(() => {
    consola.info('Creating default configuration...')
    consola.info('To generate composables, run:')
    consola.info('  nuxt-openapi-composables generate --schema ./schema/api.json')
    consola.success('Setup complete!')
  })

// Handle unknown commands
program.on('command:*', () => {
  consola.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '))
  process.exit(1)
})

// Parse command line arguments
program.parse()

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
}

