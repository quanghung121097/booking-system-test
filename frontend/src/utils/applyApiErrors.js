import { translateApiError } from './apiErrors';

const FORM_FIELDS = ['user_name', 'start_time', 'end_time'];

/**
 * Gán lỗi API vào field form (khung đỏ) và trả message cho toast.
 */
export function applyApiErrors(error, setError, t) {
  const code = error.code ?? null;
  const fieldErrors = error.fieldErrors;

  if (fieldErrors && typeof fieldErrors === 'object') {
    let toastMessage = null;

    for (const [field, msgs] of Object.entries(fieldErrors)) {
      if (!FORM_FIELDS.includes(field) || !msgs?.[0]) continue;
      const msg = translateApiError(msgs[0], t, code);
      setError(field, { message: msg });
      toastMessage ??= msg;
    }

    if (toastMessage) return toastMessage;
  }

  const raw = error.rawMessage ?? error.message;
  const message = translateApiError(raw, t, code) || t('validation.fixErrors');

  if (code === 'booking_overlap') {
    setError('start_time', { message });
    setError('end_time', { message });
  }

  return message;
}
