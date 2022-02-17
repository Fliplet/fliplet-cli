/*
 * Parses an undetermined error type to a string
 */
function parseError(error, defaultError) {
  let errorObject;

  if (!error) {
    return defaultError;
  }

  if (typeof error === 'string') {
    try {
      errorObject = JSON.parse(error);

      return parseError(errorObject, defaultError);
    } catch (e) {
      return error || defaultError;
    }
  }

  if (typeof error !== 'object') {
    // Number, Boolean etc.
    return error;
  }

  if (Array.isArray(error) && error.length === 1) {
    // Single element array
    return parseError(error[0], defaultError);
  }

  if (error.error) {
    return parseError(error.error);
  }

  if (error.body) {
    return parseError(error.body, defaultError);
  }

  if (error.responseJSON) {
    return parseError(error.responseJSON, defaultError);
  }

  if (error.description) {
    return parseError(error.description, defaultError);
  }

  if (error.message) {
    // Includes try...catch and thrown errors
    let message = error.message;

    // Adds list of errors where possible. Useful for model validation errors.
    if (Array.isArray(error.errors) && error.errors.length) {
      message += ': ';
      error.errors.forEach((e, i) => {
        if (i !== 0) {
          message += '; ';
        }

        message += parseError(e);
      });
    }

    return message;
  }

  if (error.responseText) {
    // XHR object
    return parseError(error.responseText, defaultError);
  }

  if (error.status === 0) {
    return 'Error connecting to server';
  }

  if (Object.keys(error).length === 1) {
    // Object only contains one key, feeling lucky?
    return parseError(error[Object.keys(error)[0]], defaultError);
  }

  return JSON.stringify(error) || defaultError;
}

module.exports.parseError = parseError;
