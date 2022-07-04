/**
 * CustomError class
 * @public
 */

class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.code = "ERR_CUSTOM";
    Error.captureStackTrace(this, CustomError);
  }

  public() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

/**
 * NotFoundError class
 * @public
 */

class NotFoundError extends CustomError {
  constructor(message) {
    message = message || "Not Found!";
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    this.code = "ERR_NOT_FOUND";
    this.statusCode = 404;
  }
}

/**
 * Module exports
 */

export { CustomError, NotFoundError };
