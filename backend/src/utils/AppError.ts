export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain

    this.statusCode = statusCode;
    this.isOperational = true; // Marks expected client/application errors

    Error.captureStackTrace(this, this.constructor);
  }
}
