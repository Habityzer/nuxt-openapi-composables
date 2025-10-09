/**
 * Configurable useApi composable for Nuxt applications
 * This is a runtime composable that can be customized per project
 */

// @ts-ignore - These are Nuxt auto-imports available at runtime
declare const useCookie: any
// @ts-ignore - These are Nuxt auto-imports available at runtime
declare const $fetch: any

export interface UseApiConfig {
  /** Cookie name for authentication token (default: 'authToken') */
  cookieName?: string
  /** Base URL for API requests (default: '/api') */
  baseURL?: string
  /** Additional headers to include in all requests */
  headers?: Record<string, string>
  /** Custom authorization header builder */
  getAuthHeader?: (token: string) => string
}

export interface ApiMethodOptions {
  path: string
  method: string
  contentType?: string
}

export interface ApiMethodParams {
  params?: Record<string, string | number>
  body?: any
  query?: Record<string, any>
}

/**
 * Create a configured useApi composable
 * This allows projects to customize the behavior without modifying the generated code
 *
 * @example
 * // In your project's composables/useApi.ts:
 * import { createUseApi } from 'nuxt-openapi-composables/runtime'
 *
 * export const useApi = createUseApi({
 *   cookieName: 'my-auth-token',
 *   baseURL: '/api',
 *   getAuthHeader: (token) => `Bearer ${token}`
 * })
 */
export function createUseApi(userConfig: UseApiConfig = {}) {
  const config: Required<UseApiConfig> = {
    cookieName: userConfig.cookieName || 'authToken',
    baseURL: userConfig.baseURL || '/api',
    headers: userConfig.headers || {},
    getAuthHeader: userConfig.getAuthHeader || ((token: string) => `Bearer ${token}`)
  }

  return () => {
    // Note: These imports are assumed to be available in Nuxt context
    // They will be auto-imported by Nuxt
    const authToken = useCookie(config.cookieName)

    /**
     * Create an API method caller
     */
    const createApiMethod = <T = any>(options: ApiMethodOptions) => {
      return async (methodParams?: ApiMethodParams): Promise<T> => {
        let url = options.path

        // Replace path parameters (e.g., {id} -> 123)
        if (methodParams?.params) {
          url = url.replace(/\{([^}]+)\}/g, (_, key) => {
            const value = methodParams.params![key]
            return value !== undefined ? String(value) : `{${key}}`
          })
        }

        // Build headers
        const headers: Record<string, string> = {
          'Content-Type': options.contentType || 'application/json',
          ...config.headers
        }

        // Add authorization header if token exists
        if (authToken.value) {
          headers.Authorization = config.getAuthHeader(authToken.value as string)
        }

        // Build fetch options
        const fetchOptions: any = {
          method: options.method.toUpperCase(),
          baseURL: config.baseURL,
          headers
        }

        // Add body for non-GET requests
        if (methodParams?.body) {
          fetchOptions.body = methodParams.body
        }

        // Add query parameters
        if (methodParams?.query) {
          fetchOptions.query = methodParams.query
        }

        // Make the request using Nuxt's $fetch
        return await $fetch<T>(url, fetchOptions)
      }
    }

    return {
      createApiMethod
    }
  }
}

/**
 * Default useApi composable with standard configuration
 * Projects can override this by creating their own composables/useApi.ts
 */
export const useApi = createUseApi()

