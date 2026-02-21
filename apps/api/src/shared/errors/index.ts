export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message, 422, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, "INTERNAL_ERROR");
    this.name = "InternalError";
  }
}
