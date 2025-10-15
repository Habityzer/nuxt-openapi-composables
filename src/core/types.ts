/**
 * Configuration options for the composables generator
 */
export interface GeneratorConfig {
  /** Path to the OpenAPI schema file */
  schemaPath: string
  /** Output directory for generated composables */
  outputDir: string
  /** Cookie name for authentication token (default: 'authToken') */
  cookieName?: string
  /** Base API path (default: '/api') */
  baseApiPath?: string
  /** Custom import path for useApi composable */
  useApiImportPath?: string
  /** Whether to generate TypeScript types (default: false) */
  generateTypes?: boolean
  /** Output path for TypeScript types */
  typesOutputPath?: string
  /** Import path for types in useOpenApi.ts (e.g., '~/types/api') */
  typesImportPath?: string
  /** Default API path prefix (e.g., '/api/symfony', can be overridden at runtime) */
  apiPrefix?: string
}

/**
 * OpenAPI Schema structure
 */
export interface OpenAPISchema {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  servers?: Array<{
    url: string
    description?: string
  }>
  paths: Record<string, PathItem>
  components?: {
    schemas?: Record<string, SchemaObject>
    securitySchemes?: Record<string, SecurityScheme>
  }
}

/**
 * OpenAPI Path Item
 */
export interface PathItem {
  get?: Operation
  post?: Operation
  put?: Operation
  patch?: Operation
  delete?: Operation
  options?: Operation
  head?: Operation
  trace?: Operation
  parameters?: Parameter[]
}

/**
 * OpenAPI Operation
 */
export interface Operation {
  operationId?: string
  summary?: string
  description?: string
  tags?: string[]
  parameters?: Parameter[]
  requestBody?: RequestBody
  responses?: Record<string, Response>
  security?: SecurityRequirement[]
}

/**
 * OpenAPI Parameter
 */
export interface Parameter {
  name: string
  in: 'query' | 'header' | 'path' | 'cookie'
  description?: string
  required?: boolean
  schema?: SchemaObject
}

/**
 * OpenAPI Request Body
 */
export interface RequestBody {
  description?: string
  content: Record<string, MediaType>
  required?: boolean
}

/**
 * OpenAPI Response
 */
export interface Response {
  description: string
  content?: Record<string, MediaType>
  headers?: Record<string, Header>
}

/**
 * OpenAPI Media Type
 */
export interface MediaType {
  schema?: SchemaObject
  example?: any
  examples?: Record<string, Example>
}

/**
 * OpenAPI Schema Object
 */
export interface SchemaObject {
  type?: string
  format?: string
  properties?: Record<string, SchemaObject>
  required?: string[]
  items?: SchemaObject
  allOf?: SchemaObject[]
  oneOf?: SchemaObject[]
  anyOf?: SchemaObject[]
  $ref?: string
}

/**
 * OpenAPI Header
 */
export interface Header {
  description?: string
  schema?: SchemaObject
  required?: boolean
}

/**
 * OpenAPI Example
 */
export interface Example {
  summary?: string
  description?: string
  value?: any
}

/**
 * OpenAPI Security Scheme
 */
export interface SecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect'
  description?: string
  name?: string
  in?: 'query' | 'header' | 'cookie'
  scheme?: string
  bearerFormat?: string
}

/**
 * OpenAPI Security Requirement
 */
export type SecurityRequirement = Record<string, string[]>

/**
 * Generated method information
 */
export interface GeneratedMethod {
  name: string
  path: string
  httpMethod: string
  contentType: string
}

/**
 * Resource information
 */
export interface ResourceInfo {
  name: string
  paths: Array<{
    path: string
    methods: GeneratedMethod[]
  }>
}

