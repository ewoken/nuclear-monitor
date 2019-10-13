/* eslint-disable max-classes-per-file */
const ExtendableError = require('es6-error');

class DefaultError extends ExtendableError {
  constructor(
    message = '',
    errorCode = DefaultError.ERROR_CODE,
    payload = null,
  ) {
    super(message);
    this.payload = payload;
    this.errorCode = errorCode;
  }

  static get ERROR_CODE() {
    return 'DEFAULT_ERROR';
  }

  toObject() {
    return {
      message: this.message,
      payload: this.payload,
      errorCode: this.errorCode,
    };
  }
}

class DomainError extends DefaultError {
  constructor(message, errorCode = DomainError.ERROR_CODE, payload = null) {
    super(message, errorCode, payload);
  }

  static get ERROR_CODE() {
    return 'DOMAIN_ERROR';
  }
}

class ValidationError extends DefaultError {
  constructor(errors, object) {
    super('Validation error', ValidationError.ERROR_CODE, {
      errors,
      object,
    });
  }

  static get ERROR_CODE() {
    return 'VALIDATION_ERROR';
  }
}

class InternalError extends DefaultError {
  constructor(message, payload) {
    super(message, InternalError.ERROR_CODE, payload);
  }

  static get ERROR_CODE() {
    return 'INTERNAL_ERROR';
  }
}

function only(SpecificError, handler) {
  return function onlyHandler(error) {
    if (error instanceof SpecificError) {
      return handler(error);
    }
    throw error;
  };
}

module.exports = {
  DefaultError,
  DomainError,
  ValidationError,
  InternalError,
  only,
};
