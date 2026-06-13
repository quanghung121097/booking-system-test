/** Map error code từ API → key i18n */
const ERROR_CODE_MAP = {
  booking_overlap: 'api.overlap',
};

/** Map message gốc từ API (tiếng Anh) → key i18n */
const ERROR_KEY_MAP = {
  'This time slot overlaps with an existing booking.': 'api.overlap',
  'Validation failed.': 'api.validationFailed',
  'The provided credentials are incorrect.': 'api.invalidCredentials',
  'End time must be after start time.': 'validation.endAfterStart',
  'Start time must be in the future.': 'validation.startFuture',
  'Selected room does not exist.': 'api.roomNotFound',
  'This action is unauthorized.': 'api.unauthorized',
  'Server error.': 'api.serverError',
  'An unexpected error occurred': 'api.unexpected',
  'The email field is required.': 'login.emailRequired',
  'The password field is required.': 'login.passwordRequired',
  'The email field must be a valid email address.': 'login.emailInvalid',
  'The user name field is required.': 'validation.nameRequired',
  'The start time field is required.': 'validation.startRequired',
  'The end time field is required.': 'validation.endRequired',
  'The room id field is required.': 'api.roomRequired',
  'The room id field must be an integer.': 'api.roomInvalid',
  'The start time field must be a valid date.': 'validation.startRequired',
  'The end time field must be a valid date.': 'validation.endRequired',
  'The start time field must be a date after now.': 'validation.startFuture',
  'The end time field must be a date after start time.': 'validation.endAfterStart',
};

let translator = null;

export function registerApiErrorTranslator(tFn) {
  translator = tFn;
}

export function translateApiError(message, tFn, code) {
  const t = tFn || translator;

  if (code && ERROR_CODE_MAP[code] && t) {
    return t(ERROR_CODE_MAP[code]);
  }

  if (!message) return message;

  const key = ERROR_KEY_MAP[String(message).trim()];
  if (key && t) return t(key);

  return message;
}
