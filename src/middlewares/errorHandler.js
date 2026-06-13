export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const message = err.message || "Internal Server Error";
  const stack = err.stack || "No stack trace available";
  const isOperational = err.isOperational;

  if (isOperational) {
    //Expected error, send the error message to the client
    res.status(statusCode).json({
      success: false,
      status: status,
      message: message,
      stack: process.env.NODE_ENV === "development" ? stack : undefined, //this is useful for debugging, don't show it in production
    });
  } else {
    //Unexpected error, log error and send generic message to the client
    console.error(err);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Something went wrong, please try again later",
    });
  }
};
