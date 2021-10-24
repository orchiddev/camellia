/**
 * Represents a HTTP error from a request.
 * @extends Error
 * @private
 */
class RequestError extends Error {
  constructor(name, message, method, code, path) {
    super(message);

    /**
     * The name of the error
     * @type {string}
     */
    this.name = name;

    /**
     * The HTTP Error status code.
     * @type {number}
     */
    this.code = code || 500;

    /**
     * The HTTP request method used.
     * @type {string}
     */
    this.method = method;

    /**
     * The path of the request, as relative to the default HTTP url.
     * @type {string}
     */
    this.path = path;

    Error.captureStackTrace(this, RequestError);
  }
}

module.exports = RequestError;