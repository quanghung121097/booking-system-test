import { useState } from 'react';
import { useBookingContext } from '../../context/BookingContext';
import { useTranslation } from '../../context/I18nContext';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/datetime';
import Button from '../ui/Button';

export default function BookingCard({ booking }) {
  const { deleteBooking } = useBookingContext();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const isPast = new Date(booking.end_time) < new Date();

  const handleDelete = async () => {
    if (!confirm(t('bookingCard.confirmDelete', { name: booking.user_name }))) return;
    setDeleting(true);
    const ok = await deleteBooking(booking.id);
    if (!ok) {
      showToast(t('toast.deleteFailed'), 'error');
      setDeleting(false);
    }
  };

  return (
    <div className={`booking-card${isPast ? ' booking-card--past' : ''}`}>
      <div className="booking-card__info">
        <strong>{booking.user_name}</strong>
        <span className="booking-card__time">
          {formatDateTime(booking.start_time)} →{' '}
          {formatDateTime(booking.end_time)}
        </span>
        {isPast && <span className="badge badge--past">{t('bookingCard.past')}</span>}
      </div>
      <Button
        variant="danger"
        loading={deleting}
        onClick={handleDelete}
        aria-label={t('bookingCard.deleteAria', { name: booking.user_name })}
      >
        {t('bookingCard.delete')}
      </Button>
    </div>
  );
}
