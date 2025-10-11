# Quick Start Guide

## For New Projects

### 1. Install

```bash
pnpm add -D @habityzer/nuxt-openapi-composables
```

### 2. Create `composables/useApi.ts`

```typescript
import { createUseApi } from '@habityzer/nuxt-openapi-composables/runtime'

export const useApi = createUseApi({
  cookieName: 'authToken',  // Your auth cookie name
  baseURL: '/api'           // Your API base URL
})
```

### 3. Add Script to `package.json`

```json
{
  "scripts": {
    "generate:api": "nuxt-openapi-composables generate -s ./schema/api.json -o ./composables/api --types"
  }
}
```

### 4. Generate Composables

```bash
pnpm generate:api
```

### 5. Use in Components

```vue
<script setup lang="ts">
const { getTasksCollectionApi, createTasksItemApi } = useTasksApi()

// Fetch tasks
const { data: tasks } = await useAsyncData(
  'tasks',
  () => getTasksCollectionApi()
)

// Create task
const createTask = async (title: string) => {
  await createTasksItemApi({
    body: { title }
  })
  refresh()
}
</script>
```

## CLI Commands

### Generate Composables

```bash
# Basic
nuxt-openapi-composables generate

# With options
nuxt-openapi-composables generate \
  --schema ./schema/api.json \
  --output ./composables/api \
  --cookie authToken \
  --types \
  --types-output ./types/api.ts
```

### Short Aliases

```bash
nuxt-openapi-composables generate -s ./schema/api.json -o ./composables/api -c authToken -t
```

## Method Naming Patterns

| Endpoint | Method | Generated Name |
|----------|--------|----------------|
| `/api/tasks` | GET | `getTasksCollectionApi` |
| `/api/tasks` | POST | `createTasksItemApi` |
| `/api/tasks/{id}` | GET | `getTasksItemApi` |
| `/api/tasks/{id}` | PATCH | `patchTasksItemApi` |
| `/api/tasks/{id}` | DELETE | `deleteTasksItemApi` |

## Custom Configuration

### Different Auth Cookie

```typescript
export const useApi = createUseApi({
  cookieName: 'myCustomToken'
})
```

### Custom Headers

```typescript
export const useApi = createUseApi({
  headers: {
    'X-Client-Version': '1.0.0'
  }
})
```

### Custom Auth Header Format

```typescript
export const useApi = createUseApi({
  getAuthHeader: (token) => `Token ${token}`
})
```

## TypeScript Types

### Generate Types

```bash
nuxt-openapi-composables generate --types --types-output ./types/api.ts
```

### Use Generated Types

```typescript
import type { Task, TaskCreate } from '~/types/api'

const newTask: TaskCreate = {
  title: 'New Task',
  status: 'pending'
}

const task: Task = await createTasksItemApi({
  body: newTask
})
```

## Common Patterns

### With Path Parameters

```typescript
const { getTasksItemApi } = useTasksApi()

const task = await getTasksItemApi({
  params: { id: 123 }
})
```

### With Query Parameters

```typescript
const { getTasksCollectionApi } = useTasksApi()

const tasks = await getTasksCollectionApi({
  query: {
    status: 'active',
    page: 1,
    limit: 20
  }
})
```

### With Request Body

```typescript
const { createTasksItemApi } = useTasksApi()

await createTasksItemApi({
  body: {
    title: 'New Task',
    description: 'Description'
  }
})
```

### Complete Example

```typescript
const { patchTasksItemApi } = useTasksApi()

await patchTasksItemApi({
  params: { id: 123 },
  body: { status: 'completed' },
  query: { notify: true }
})
```

## Troubleshooting

### Composables not found
- Run `pnpm generate:api`
- Restart Nuxt dev server

### Types not working
- Add `--types` flag
- Check `tsconfig.json` includes output path

### Auth not working
- Verify cookie name matches
- Check cookie contains valid token
- Inspect network tab for auth headers

## Development Workflow

```bash
# 1. Update OpenAPI schema
curl https://api.example.com/openapi.json > schema/api.json

# 2. Generate composables
pnpm generate:api

# 3. Use in your app
# Import and use generated composables
```

## Need Help?

- 📖 See [README.md](./README.md) for full documentation
- 🧪 Check [tests/](./tests/) for usage examples
- 🐛 Report issues on GitHub

