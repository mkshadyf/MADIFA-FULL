declare module 'vimeo' {
  export interface RequestOptions {
    method: string;
    path: string;
    query?: Record<string, unknown>;
    body?: Record<string, unknown>;
  }

  export type RequestCallback<T> = (error: any, result: T, status: number, headers?: any) => void;

  export default class Vimeo {
    constructor(clientId: string, clientSecret: string, accessToken: string);

    request<T>(
      options: RequestOptions,
      callback: RequestCallback<T>
    ): void;
  }
} 