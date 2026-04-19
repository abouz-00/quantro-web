/**
 * API Client for communicating with the Quantro Backend
 * Handles HTTP requests with automatic cookie-based authentication
 */

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '/api') {
    this.baseURL = baseURL;
  }

  // Note: Authentication is now handled via httpOnly cookies
  // No need for manual token management

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string>, options?: { signal?: AbortSignal }): Promise<T> {
    try {
      // Build URL - handle both relative (/api) and absolute (http://...) base URLs
      let url: URL;
      const fullEndpoint = `${this.baseURL}${endpoint}`;
      
      if (this.baseURL.startsWith('http')) {
        url = new URL(endpoint, this.baseURL);
      } else {
        // For relative URLs like '/api', construct from current origin
        url = new URL(fullEndpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      }
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      console.log('🌐 GET request to:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include', // Include cookies for authentication
        signal: options?.signal,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      // Re-throw abort errors so callers can handle cancellation
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      console.error('GET request failed:', { endpoint, params, error });
      throw new Error(`NetworkError when attempting to fetch resource.`);
    }
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    try {
      // Build URL - handle both relative (/api) and absolute (http://...) base URLs
      let url: string;
      const fullEndpoint = `${this.baseURL}${endpoint}`;
      
      if (this.baseURL.startsWith('http')) {
        url = new URL(endpoint, this.baseURL).toString();
      } else {
        // For relative URLs like '/api', construct from current origin
        url = new URL(fullEndpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000').toString();
      }

      console.log('🌐 POST request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include', // Include cookies for authentication
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('POST request failed:', { endpoint, error });
      throw new Error(`NetworkError when attempting to fetch resource.`);
    }
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    try {
      // Build URL - handle both relative (/api) and absolute (http://...) base URLs
      let url: string;
      const fullEndpoint = `${this.baseURL}${endpoint}`;
      
      if (this.baseURL.startsWith('http')) {
        url = new URL(endpoint, this.baseURL).toString();
      } else {
        // For relative URLs like '/api', construct from current origin
        url = new URL(fullEndpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000').toString();
      }

      console.log('🌐 PUT request to:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include', // Include cookies for authentication
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('PUT request failed:', { endpoint, error });
      throw new Error(`NetworkError when attempting to fetch resource.`);
    }
  }

  async delete<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    try {
      // Build URL - handle both relative (/api) and absolute (http://...) base URLs
      let url: URL;
      const fullEndpoint = `${this.baseURL}${endpoint}`;
      
      if (this.baseURL.startsWith('http')) {
        url = new URL(endpoint, this.baseURL);
      } else {
        // For relative URLs like '/api', construct from current origin
        url = new URL(fullEndpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      }
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      console.log('🌐 DELETE request to:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include', // Include cookies for authentication
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('DELETE request failed:', { endpoint, params, error });
      throw new Error(`NetworkError when attempting to fetch resource.`);
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or multiple instances
export { ApiClient };