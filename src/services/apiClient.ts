/**
 * API Client
 * Centralized HTTP client with retry logic, error handling, and interceptors
 */

import { supabase } from '../supabase-client';

// Types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipAuth?: boolean;
}

const DEFAULT_CONFIG: Required<Pick<RequestConfig, 'timeout' | 'retries' | 'retryDelay'>> = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

// Get API base URL from env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Get current user's access token
 */
async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(status: number): boolean {
  // Retry on network errors (0), server errors (5xx), and rate limits (429)
  return status === 0 || status === 429 || (status >= 500 && status < 600);
}

/**
 * Create a timeout promise
 */
function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms);
  });
}

/**
 * Main API client class
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an API request with retry logic
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = DEFAULT_CONFIG.timeout,
      retries = DEFAULT_CONFIG.retries,
      retryDelay = DEFAULT_CONFIG.retryDelay,
      skipAuth = false,
    } = config;

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth token if not skipped
    if (!skipAuth) {
      const token = await getAccessToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    let lastError: Error | null = null;
    let lastStatus = 0;

    // Retry loop
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Race between fetch and timeout
        const response = await Promise.race([
          fetch(`${this.baseUrl}${endpoint}`, requestOptions),
          createTimeoutPromise(timeout),
        ]);

        lastStatus = response.status;

        // Parse response
        const data = await response.json().catch(() => ({}));

        // Handle success
        if (response.ok) {
          return {
            success: true,
            data: data.data ?? data,
            meta: data.meta,
          };
        }

        // Handle error
        const error: ApiError = {
          code: data.error?.code || `HTTP_${response.status}`,
          message: data.error?.message || data.error || `Request failed with status ${response.status}`,
          details: data.error?.details,
          requestId: data.requestId,
        };

        // Don't retry client errors (4xx except 429)
        if (!isRetryableError(response.status)) {
          return { success: false, error };
        }

        lastError = new Error(error.message);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }

      // Wait before retry (with exponential backoff)
      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt);
        console.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`);
        await sleep(delay);
      }
    }

    // All retries failed
    return {
      success: false,
      error: {
        code: lastStatus === 0 ? 'NETWORK_ERROR' : `HTTP_${lastStatus}`,
        message: lastError?.message || 'Request failed after all retries',
      },
    };
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

// Export class for custom instances
export { ApiClient };

/**
 * Type guard to check if response has data
 */
export function hasData<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}

/**
 * Unwrap API response or throw error
 */
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === undefined) {
    throw new Error(response.error?.message || 'Request failed');
  }
  return response.data;
}

export default api;
