import type { paths } from '~/types/api'

// Helper types to extract response types from OpenAPI paths
type ApiResponse<T extends keyof paths, M extends keyof paths[T], ContentType extends 'application/ld+json' | 'application/json'>
  = paths[T][M] extends { responses: { 200: { content: { [K in ContentType]: infer R } } } }
    ? R
    : paths[T][M] extends { responses: { 201: { content: { [K in ContentType]: infer R } } } }
      ? R
      : never

// Helper types to extract request body types
type ApiRequestBody<T extends keyof paths, M extends keyof paths[T]>
  = paths[T][M] extends { requestBody: { content: { [key: string]: infer R } } }
    ? M extends 'patch'
      ? Partial<R>
      : R
    : never

// Helper types to extract path parameters
type ApiPathParams<T extends keyof paths, M extends keyof paths[T]>
  = paths[T][M] extends { parameters: { path: infer R } }
    ? R
    : never

// Helper type to extract query parameters
type ApiQueryParams<T extends keyof paths, M extends keyof paths[T]>
  = paths[T][M] extends { parameters: { query?: infer R } }
    ? R
    : never

// Helper type to determine content type from path and method
type ApiContentType<T extends keyof paths, M extends keyof paths[T]>
  = paths[T][M] extends { responses: { 200: { content: { 'application/ld+json': unknown } } } }
    ? 'application/ld+json'
    : paths[T][M] extends { responses: { 200: { content: { 'application/json': unknown } } } }
      ? 'application/json'
      : 'application/ld+json'

// Type for endpoint configuration
export type EndpointConfig = {
  path: keyof paths
  method: keyof paths[keyof paths]
  contentType?: 'application/ld+json' | 'application/json' | 'application/merge-patch+json'
}

interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any // Needs to handle both OpenAPI types and $fetch requirements
  query?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  server?: boolean // Force server-side execution
}

interface ApiError {
  response?: {
    status: number
    _data?: {
      message?: string
    }
  }
}

export const useOpenApi = () => {
  // Get the API path prefix from runtime config
  const getApiPrefix = (): string => {
    try {
      const config = useRuntimeConfig()
      // Use public.apiPrefix from nuxt.config.ts or environment variable
      // Falls back to empty string if not configured
      return config.public.apiPrefix || ''
    } catch {
      // Fallback if runtime config is not available
      return ''
    }
  }

  // Helper to create errors (Nuxt-aware with fallback)
  const throwError = (statusCode: number, statusMessage: string): never => {
    try {
      // Try to use Nuxt's createError if available
      throw createError({
        statusCode,
        statusMessage
      })
    } catch {
      // Fallback to standard Error if createError is not available
      const error = new Error(statusMessage) as Error & { statusCode?: number }
      error.statusCode = statusCode
      throw error
    }
  }

  // Main API call function - now uses Nuxt proxy
  const apiCall = async <T>(
    endpoint: string,
    options: ApiCallOptions = {}
  ): Promise<T> => {
    const {
      method = 'GET',
      body,
      query,
      headers = {}
    } = options

    try {
      const prefix = getApiPrefix()

      // Build the full URL with optional prefix
      let url = endpoint
      if (prefix) {
        // Remove leading slash from endpoint if present to avoid double slashes
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
        url = `${prefix}/${cleanEndpoint}`
      }

      // Serialize query parameters manually to handle arrays with brackets
      let finalUrl = url
      if (query && Object.keys(query).length > 0) {
        const searchParams = new URLSearchParams()
        Object.entries(query).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(`${key}[]`, String(v)))
          } else if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
          }
        })
        const queryString = searchParams.toString()
        if (queryString) {
          finalUrl = `${url}?${queryString}`
        }
      }

      const response = await $fetch<T>(finalUrl, {
        method,
        body,
        headers: {
          'Content-Type': headers['Content-Type'] || (method.toUpperCase() === 'PATCH' ? 'application/merge-patch+json' : 'application/json'),
          ...headers
        },
        // Nuxt-specific options
        retry: 1,
        timeout: 10000
      })

      return response as T
    } catch (error: unknown) {
      // Error handling - projects can catch and handle these errors as needed
      const apiError = error as ApiError
      if (apiError.response) {
        const statusCode = apiError.response.status
        const errorMessage = apiError.response._data?.message || 'API Error'

        // Log the error for debugging
        console.error(`API Error ${statusCode}:`, apiError.response._data)

        // Throw error with status code and message
        throwError(statusCode, errorMessage)
      }

      // Network or unknown error
      console.error('API Call failed:', error)
      throwError(500, 'Network Error')
    }
  }

  // Typed API call with path inference
  const typedApiCall = <
    TPath extends keyof paths,
    TMethod extends keyof paths[TPath],
    ContentType extends 'application/ld+json' | 'application/json' = 'application/ld+json'
  >(
    path: TPath,
    method: TMethod,
    options: {
      params?: ApiPathParams<TPath, TMethod>
      query?: ApiQueryParams<TPath, TMethod>
      body?: ApiRequestBody<TPath, TMethod>
      headers?: Record<string, string>
      server?: boolean
    } = {}
  ): Promise<ApiResponse<TPath, TMethod, ContentType>> => {
    // Build the URL with path parameters
    let url = path as string
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, String(value))
      })
    }

    return apiCall<ApiResponse<TPath, TMethod, ContentType>>(url, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      method: method as any,
      body: options.body,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query: options.query as Record<string, any>,
      headers: options.headers,
      server: options.server
    })
  }

  // Helper function to create typed API methods
  const createApiMethod = <T extends EndpointConfig>(config: T) => {
    return (options: {
      params?: ApiPathParams<T['path'], T['method']>
      query?: ApiQueryParams<T['path'], T['method']>
      body?: ApiRequestBody<T['path'], T['method']>
    } = {}) => {
      // Use the provided contentType from config, or fall back to inferred type
      type ContentType = T['contentType'] extends 'application/json' | 'application/ld+json'
        ? T['contentType']
        : ApiContentType<T['path'], T['method']>

      // Prepare headers with content type and accept header if specified in config
      const headers: Record<string, string> = {}
      if (config.contentType) {
        headers['Content-Type'] = config.contentType

        // Set Accept header based on content type and method
        if (config.contentType === 'application/merge-patch+json') {
          // For PATCH requests, API returns JSON or LD+JSON, not merge-patch+json
          headers['Accept'] = 'application/json'
        } else {
          // For other content types, Accept header matches Content-Type
          headers['Accept'] = config.contentType
        }
      }

      return typedApiCall<
        T['path'],
        T['method'],
        ContentType
      >(config.path, config.method, {
        ...options,
        headers
      })
    }
  }

  return {
    apiCall,
    typedApiCall,
    createApiMethod,
    getApiPrefix
  }
}
