const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

interface RequestOptions extends RequestInit {
  token?: string;
  body?: any;
}

/**
 * Generic API request helper with type safety, authorization token management, and error handling.
 */
export async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  options: RequestOptions = {}
): Promise<T> {
  const { token, body, headers, ...customOptions } = options;

  // Standard headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const config: RequestInit = {
    method,
    headers: requestHeaders,
    ...customOptions,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown API error');
    console.error(`[API Error] ${method} ${endpoint} failed:`, response.status, response.statusText, errorText);
    throw new Error(errorText || response.statusText);
  }

  // Handle empty responses or 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Reusable wrapper object for cleaner service calls.
 */
export const api = {
  get: <T>(endpoint: string, token?: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, 'GET', { token, ...options }),
    
  post: <T>(endpoint: string, data: any, token?: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, 'POST', { token, body: data, ...options }),
    
  put: <T>(endpoint: string, data: any, token?: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, 'PUT', { token, body: data, ...options }),
    
  delete: <T>(endpoint: string, token?: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, 'DELETE', { token, ...options }),
};
