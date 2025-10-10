# Nuxt OpenAPI Composables

[![npm version](https://img.shields.io/npm/v/nuxt-openapi-composables.svg)](https://npmjs.com/package/nuxt-openapi-composables)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Generate type-safe Nuxt composables from OpenAPI schemas. Perfect for consuming REST APIs in your Nuxt 3 & 4 applications with full TypeScript support and auto-completion.

## Features

- 🚀 **Automatic Generation**: Generate composables from OpenAPI 3.x schemas
- 🎯 **Type-Safe**: Full TypeScript support with optional type generation
- 🔧 **Configurable**: Customize naming, imports, and authentication
- 📦 **Multiple Modes**: Use as CLI tool or Nuxt module
- 🔐 **Auth Ready**: Built-in support for cookie-based authentication
- 🎨 **Clean API**: Intuitive method names following REST conventions
- 🧪 **Well Tested**: Comprehensive test coverage

## Installation

```bash
# Using pnpm (recommended)
pnpm add -D nuxt-openapi-composables

# Using npm
npm install -D nuxt-openapi-composables

# Using yarn
yarn add -D nuxt-openapi-composables
```

## Quick Start

### 1. CLI Usage (Recommended)

Generate composables from your OpenAPI schema:

```bash
npx nuxt-openapi-composables generate \
  --schema ./schema/api.json \
  --output ./app/composables/api \
  --cookie authToken \
  --types
```

Add to your `package.json`:

```json
{
  "scripts": {
    "generate:api": "nuxt-openapi-composables generate -s ./schema/api.json -o ./app/composables/api --types"
  }
}
```

### 2. Use Generated Composables

```typescript
// pages/tasks.vue
<script setup lang="ts">
const { getTasksCollectionApi, createTasksItemApi } = useTasksApi()

// Fetch all tasks
const { data: tasks } = await getTasksCollectionApi()

// Create a new task
await createTasksItemApi({
  body: {
    title: 'New Task',
    description: 'Task description'
  }
})
</script>
```

### 3. Setup useApi Composable

Create `composables/useApi.ts`:

```typescript
import { createUseApi } from 'nuxt-openapi-composables/runtime'

// Option 1: Use default configuration
export { useApi } from 'nuxt-openapi-composables/runtime'

// Option 2: Customize configuration
export const useApi = createUseApi({
  cookieName: 'authToken',
  baseURL: '/api',
  getAuthHeader: (token) => `Bearer ${token}`
})
```

## CLI Options

### `generate` Command

Generate composables from OpenAPI schema:

```bash
nuxt-openapi-composables generate [options]
```

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--schema <path>` | `-s` | Path to OpenAPI schema file | `./schema/api.json` |
| `--output <dir>` | `-o` | Output directory for composables | `./app/composables/api` |
| `--cookie <name>` | `-c` | Cookie name for authentication | `authToken` |
| `--types` | `-t` | Generate TypeScript types | `false` |
| `--types-output <path>` | | Output path for TypeScript types | `./app/types/api.ts` |
| `--base-api-path <path>` | | Base API path | `/api` |
| `--use-api-import <path>` | | Custom useApi import path | `~/composables/useApi` |

### Examples

**Basic usage:**
```bash
nuxt-openapi-composables generate -s ./schema/api.json
```

**With TypeScript types:**
```bash
nuxt-openapi-composables generate \
  -s ./schema/api.json \
  -o ./composables/api \
  --types \
  --types-output ./types/api.ts
```

**Custom authentication cookie:**
```bash
nuxt-openapi-composables generate \
  -s ./api.json \
  --cookie myAuthToken
```

## Generated Method Naming

The generator creates intuitive method names based on REST conventions:

| Endpoint | HTTP Method | Generated Method Name |
|----------|-------------|----------------------|
| `/api/tasks` | GET | `getTasksCollectionApi` |
| `/api/tasks` | POST | `createTasksItemApi` |
| `/api/tasks/{id}` | GET | `getTasksItemApi` |
| `/api/tasks/{id}` | PATCH | `patchTasksItemApi` |
| `/api/tasks/{id}` | DELETE | `deleteTasksItemApi` |
| `/api/tasks/{id}/complete` | POST | `completeTasksApi` |

### Method Parameters

Generated methods accept an optional parameters object:

```typescript
interface ApiMethodParams {
  params?: Record<string, string | number>  // Path parameters
  body?: any                                 // Request body
  query?: Record<string, any>               // Query parameters
}
```

**Example usage:**

```typescript
const { getTasksItemApi, patchTasksItemApi } = useTasksApi()

// GET /api/tasks/123
const task = await getTasksItemApi({
  params: { id: 123 }
})

// PATCH /api/tasks/123 with query params
await patchTasksItemApi({
  params: { id: 123 },
  body: { title: 'Updated' },
  query: { refresh: true }
})
```

## Advanced Configuration

### Custom useApi Configuration

```typescript
// composables/useApi.ts
import { createUseApi } from 'nuxt-openapi-composables/runtime'

export const useApi = createUseApi({
  // Cookie name for auth token
  cookieName: 'myAuthToken',
  
  // Base URL for all requests
  baseURL: '/api/v1',
  
  // Additional headers for all requests
  headers: {
    'X-Client-Version': '1.0.0'
  },
  
  // Custom authorization header builder
  getAuthHeader: (token) => `Bearer ${token}`
})
```

### Custom Import Path

If you have a custom useApi composable location:

```bash
nuxt-openapi-composables generate \
  --use-api-import '#app/composables/api'
```

This will generate:

```typescript
import { useApi } from '#app/composables/api'
```

## Nuxt Module (Optional)

You can also use as a Nuxt module for auto-import support:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-openapi-composables'],
  
  openapiComposables: {
    schemaPath: './schema/api.json',
    outputDir: './app/composables/api',
    cookieName: 'authToken',
    autoImport: true
  }
})
```

> **Note**: The module provides auto-import support but doesn't auto-generate composables. You still need to run the CLI command to generate/update composables.

## Workflow Integration

### Development Workflow

1. **Update API Schema**: Get latest OpenAPI schema from your backend
2. **Generate Composables**: Run the generation command
3. **Use in Components**: Import and use generated composables

```json
{
  "scripts": {
    "update:schema": "curl https://api.example.com/openapi.json > schema/api.json",
    "generate:api": "nuxt-openapi-composables generate -s ./schema/api.json --types",
    "sync:api": "pnpm update:schema && pnpm generate:api"
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/api-sync.yml
name: Sync API Schema

on:
  schedule:
    - cron: '0 0 * * *'  # Daily
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm sync:api
      - uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore: update API composables'
          branch: 'api-sync'
```

## Examples

### Basic CRUD Operations

```typescript
// pages/tasks/index.vue
<script setup lang="ts">
const { getTasksCollectionApi } = useTasksApi()

const { data: tasks, refresh } = await useAsyncData(
  'tasks',
  () => getTasksCollectionApi()
)
</script>

// pages/tasks/[id].vue
<script setup lang="ts">
const route = useRoute()
const { getTasksItemApi, deleteTasksItemApi } = useTasksApi()

const { data: task } = await useAsyncData(
  'task',
  () => getTasksItemApi({ params: { id: route.params.id } })
)

async function deleteTask() {
  await deleteTasksItemApi({ params: { id: route.params.id } })
  await navigateTo('/tasks')
}
</script>
```

### With Query Parameters

```typescript
const { getTasksCollectionApi } = useTasksApi()

// GET /api/tasks?status=active&page=1
const tasks = await getTasksCollectionApi({
  query: {
    status: 'active',
    page: 1,
    limit: 20
  }
})
```

### Error Handling

```typescript
const { createTasksItemApi } = useTasksApi()

try {
  await createTasksItemApi({
    body: { title: 'New Task' }
  })
  
  // Show success toast
} catch (error) {
  console.error('Failed to create task:', error)
  // Show error toast
}
```

### With TypeScript Types

```typescript
// Import generated types
import type { Task, TaskCreate } from '~/types/api'

const { createTasksItemApi } = useTasksApi()

const newTask: TaskCreate = {
  title: 'New Task',
  description: 'Task description',
  status: 'pending'
}

const task: Task = await createTasksItemApi({
  body: newTask
})
```

## Migration Guide

### From Manual API Calls

**Before:**
```typescript
const authToken = useCookie('authToken')

const tasks = await $fetch('/api/tasks', {
  headers: {
    Authorization: `Bearer ${authToken.value}`
  }
})
```

**After:**
```typescript
const { getTasksCollectionApi } = useTasksApi()
const tasks = await getTasksCollectionApi()
```

## Troubleshooting

### Composables not found

Make sure to:
1. Run the generation command
2. Check the output directory exists
3. Restart your Nuxt dev server

### Types not working

1. Ensure `--types` flag is used
2. Check TypeScript config includes the output path
3. Restart your IDE

### Authentication not working

1. Verify cookie name matches your auth implementation
2. Check the cookie contains a valid token
3. Customize `getAuthHeader` if using different auth format

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Credits

Created by [Vazgen Manukyan](https://github.com/vazgen)

## Related Projects

- [openapi-typescript](https://github.com/drwpow/openapi-typescript) - TypeScript types from OpenAPI
- [Nuxt](https://nuxt.com) - The Intuitive Vue Framework

