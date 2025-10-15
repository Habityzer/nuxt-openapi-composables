# Nuxt OpenAPI Composables

[![npm version](https://img.shields.io/npm/v/@habityzer/nuxt-openapi-composables.svg)](https://npmjs.com/package/@habityzer/nuxt-openapi-composables)
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
pnpm add -D @habityzer/nuxt-openapi-composables

# Using npm
npm install -D @habityzer/nuxt-openapi-composables

# Using yarn
yarn add -D @habityzer/nuxt-openapi-composables
```

## Quick Start

### 1. Generate Composables

Generate composables from your OpenAPI schema:

```bash
npx nuxt-openapi-composables generate \
  --schema ./schema/api.json \
  --output ./app/composables/api \
  --types \
  --types-import '~/types/api' \
  --api-prefix '/api/symfony'
```

This will generate:
- `useOpenApi.ts` - Core API client composable
- `use{Resource}Api.ts` - Resource-specific composables (e.g., `useUserWordsApi.ts`)
- `api.ts` - TypeScript types (if `--types` flag is used)

Add to your `package.json`:

```json
{
  "scripts": {
    "generate:api": "nuxt-openapi-composables generate -s ./schema/api.json -o ./composables/api --types"
  }
}
```

### 2. Configure Nuxt

Add API prefix configuration to your `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiPrefix: '/api/symfony' // Your API path prefix
    }
  }
})
```

Or use environment variable:

```bash
# .env
NUXT_PUBLIC_API_PREFIX=/api/symfony
```

### 3. Use Generated Composables

```typescript
// pages/user-words.vue
<script setup lang="ts">
const { getUserWordsApi, postUserWordsBatchApi } = useUserWordsApi()

// Fetch all user words
const { data: words } = await getUserWordsApi()

// Create words in batch
await postUserWordsBatchApi({
  body: {
    words: [
      { word: 'ephemeral', tags: ['Lesson 1'] },
      { word: 'abandon', tags: ['Lesson 1'] }
    ]
  }
})
</script>
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
| `--types` | `-t` | Generate TypeScript types using openapi-typescript | `false` |
| `--types-output <path>` | | Output path for TypeScript types | `./app/types/api.ts` |
| `--types-import <path>` | | Import path for types in useOpenApi.ts | `~/types/api` |
| `--api-prefix <path>` | | Default API path prefix (can be overridden at runtime) | _(none)_ |
| `--cookie <name>` | `-c` | Cookie name for authentication (deprecated) | `authToken` |

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
  --types-output ./types/api.ts \
  --types-import '~/types/api'
```

**With custom API prefix:**
```bash
nuxt-openapi-composables generate \
  -s ./api.json \
  -o ./composables/api \
  --api-prefix '/api/symfony'
```

**Complete example:**
```bash
nuxt-openapi-composables generate \
  --schema ./openapi.json \
  --output ./app/composables/api \
  --types \
  --types-output ./app/types/api.ts \
  --types-import '~/types/api' \
  --api-prefix '/api/v1'
```

## Generated Method Naming

The generator creates intuitive method names based on REST conventions with an "Api" suffix to distinguish from store methods:

| Endpoint | HTTP Method | Generated Method Name |
|----------|-------------|----------------------|
| `/api/tasks` | GET | `getTasksApi` |
| `/api/tasks` | POST | `postTasksApi` |
| `/api/tasks/{id}` | GET | `getTaskApi` (singular) |
| `/api/tasks/{id}` | PATCH | `patchTaskApi` |
| `/api/tasks/{id}` | DELETE | `deleteTaskApi` |
| `/api/tasks/{id}/complete` | POST | `postTaskCompleteApi` |
| `/api/user-words/batch` | POST | `postUserWordsBatchApi` |
| `/api/user-words/random` | GET | `getRandomUserWordsApi` |

**Why the "Api" suffix?**

The `Api` suffix helps distinguish between API calls and Pinia store methods when working in stores:

```typescript
// In your Pinia store
export const useUserWordsStore = defineStore('userWords', () => {
  const { getUserWordsApi } = useUserWordsApi()  // API call
  
  const words = ref([])
  
  // Store action - no naming conflict!
  async function getUserWords() {  
    words.value = await getUserWordsApi()
  }
  
  return { words, getUserWords }
})
```

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
const { getTaskApi, patchTaskApi } = useTasksApi()

// GET /api/tasks/123
const task = await getTaskApi({
  params: { id: 123 }
})

// PATCH /api/tasks/123 with query params
await patchTaskApi({
  params: { id: 123 },
  body: { title: 'Updated' },
  query: { refresh: true }
})
```

## Configuration

### API Prefix Configuration

The generated `useOpenApi.ts` reads the API prefix from Nuxt's runtime config. Configure it in your project:

**Option 1: nuxt.config.ts**
```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiPrefix: '/api/symfony' // Your API prefix
    }
  }
})
```

**Option 2: Environment Variable**
```bash
# .env
NUXT_PUBLIC_API_PREFIX=/api/symfony
```

**Option 3: Set Default During Generation**
```bash
nuxt-openapi-composables generate \
  --api-prefix '/api/symfony'
```

The priority is: Runtime Config > Environment Variable > CLI Default

### Error Handling

All API errors are thrown with `statusCode` and `statusMessage` properties. Handle them in your application:

```typescript
const { getUserWordsApi } = useUserWordsApi()

try {
  const words = await getUserWordsApi()
} catch (error) {
  if (error.statusCode === 401) {
    // Handle authentication error
    await navigateTo('/login')
  } else if (error.statusCode === 404) {
    // Handle not found
    console.error('Resource not found')
  } else {
    // Handle other errors
    console.error('API Error:', error.statusMessage)
  }
}
```

### Custom Types Import Path

If your types are in a different location:

```bash
nuxt-openapi-composables generate \
  --types-import '@/types/api'
```

## Nuxt Module (Optional)

You can also use as a Nuxt module for auto-import support:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@habityzer/nuxt-openapi-composables'],
  
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
const { getTasksApi } = useTasksApi()

const { data: tasks, refresh } = await useAsyncData(
  'tasks',
  () => getTasksApi()
)
</script>

// pages/tasks/[id].vue
<script setup lang="ts">
const route = useRoute()
const { getTaskApi, deleteTaskApi } = useTasksApi()

const { data: task } = await useAsyncData(
  'task',
  () => getTaskApi({ params: { id: route.params.id } })
)

async function deleteTask() {
  await deleteTaskApi({ params: { id: route.params.id } })
  await navigateTo('/tasks')
}
</script>
```

### With Query Parameters

```typescript
const { getTasksApi } = useTasksApi()

// GET /api/tasks?status=active&page=1
const tasks = await getTasksApi({
  query: {
    status: 'active',
    page: 1,
    limit: 20
  }
})
```

### With Pinia Stores

```typescript
// stores/tasks.ts
export const useTasksStore = defineStore('tasks', () => {
  const { getTasksApi, postTasksApi, deleteTaskApi } = useTasksApi()
  
  const tasks = ref([])
  const loading = ref(false)
  
  async function fetchTasks() {
    loading.value = true
    try {
      tasks.value = await getTasksApi()
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      loading.value = false
    }
  }
  
  async function createTask(title: string) {
    const task = await postTasksApi({ body: { title } })
    tasks.value.push(task)
    return task
  }
  
  return { tasks, loading, fetchTasks, createTask }
})
```

### With TypeScript Types

```typescript
// Import generated types
import type { paths } from '~/types/api'

const { postTasksApi } = useTasksApi()

type TaskCreate = paths['/api/tasks']['post']['requestBody']['content']['application/json']
type Task = paths['/api/tasks']['post']['responses']['201']['content']['application/json']

const newTask: TaskCreate = {
  title: 'New Task',
  description: 'Task description',
  status: 'pending'
}

const task: Task = await postTasksApi({
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
const { getTasksApi } = useTasksApi()
const tasks = await getTasksApi()
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

### API prefix not working

1. Verify runtime config is set in `nuxt.config.ts`
2. Check environment variable `NUXT_PUBLIC_API_PREFIX`
3. Regenerate composables if you changed the CLI default
4. Restart your Nuxt dev server

### Requests going to wrong URL

The final URL is: `apiPrefix + endpoint`

Example:
- API Prefix: `/api/symfony`
- Endpoint: `/api/user-words`
- Final URL: `/api/symfony/api/user-words`

If your backend strips the prefix, adjust accordingly.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Credits

Created by [Vazgen Manukyan](https://github.com/vazgen)

## Related Projects

- [openapi-typescript](https://github.com/drwpow/openapi-typescript) - TypeScript types from OpenAPI
- [Nuxt](https://nuxt.com) - The Intuitive Vue Framework

