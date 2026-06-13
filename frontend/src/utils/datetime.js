/**
 * Chuyển giá trị datetime-local (YYYY-MM-DDTHH:mm, giờ local) sang ISO8601 UTC cho API/DB.
 */
export function toApiDateTime(localDateTime) {
  if (!localDateTime) return localDateTime;
  return new Date(localDateTime).toISOString();
}

/** Hiển thị ISO8601 từ API — giờ 24h (dd/MM/yyyy HH:mm). */
export function formatDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Cộng thêm phút vào giá trị datetime-local, trả về YYYY-MM-DDTHH:mm. */
export function addMinutesToLocalDateTime(localDateTime, minutes) {
  if (!localDateTime) return '';
  const d = new Date(localDateTime);
  d.setMinutes(d.getMinutes() + minutes);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
