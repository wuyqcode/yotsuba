export type Theme = 'light' | 'dark';

export type Language = 'zh' | 'en';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
