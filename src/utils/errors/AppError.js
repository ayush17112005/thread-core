export class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //calls the parent class constructor (Error)
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; //Used to distinguish between expected errors(Email not found etc) and unexpected errors(like db connection failed, server crashed etc);
    Error.captureStackTrace(this, this.constructor); //This will create a stack trace for the error instance, excluding the constructor call from the stack trace. This is useful for debugging and helps to identify where the error originated from in the code.
  }
}
