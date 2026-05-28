type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: HeadersInit
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function requestJson<T>(input: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(input, {
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = 'Request failed.'

    try {
      const errorBody = (await response.json()) as { message?: string }
      if (errorBody.message) {
        message = errorBody.message
      }
    } catch {
      // Fall back to status text when no JSON error body is available.
      if (response.statusText) {
        message = response.statusText
      }
    }

    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function jsonRequest(body: unknown, options: RequestOptions = {}): RequestOptions {
  return {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(body),
  }
}