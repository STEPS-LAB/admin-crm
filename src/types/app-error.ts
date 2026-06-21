export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly statusCode: number;
  readonly context?: Record<string, unknown>;
}
