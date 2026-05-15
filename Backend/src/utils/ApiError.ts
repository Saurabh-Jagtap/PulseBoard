class ApiError extends Error {
  statusCode: number;
  errors: { field?: string; message: string }[];
  success: boolean;

  constructor(
    statusCode: number,
    message: string,
    errors: { field?: string; message: string }[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export { ApiError };