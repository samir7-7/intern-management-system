class ApiError extends Error {
  constructor(
    statusCode,
    message = "Internal Server Error",
    stack = "",
    errors = [],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.stack = stack;
    this.message = message;
    this.errors = errors;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
