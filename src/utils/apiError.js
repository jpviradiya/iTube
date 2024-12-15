class apiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    // setting values
    super(message); //set message parameter using super constructor
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    // setting stack values
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export { apiError };
/*
INPUT:
try {
  throw new apiError(404, "Resource not found", ["Invalid ID"], "Custom stack trace");
} catch (error) {
  console.error(error);
}

OUTPUT:
{
  statusCode: 404,
  message: "Resource not found",
  data: null,
  success: false,
  errors: ["Invalid ID"],
  statck: "Custom stack trace"
}
*/
