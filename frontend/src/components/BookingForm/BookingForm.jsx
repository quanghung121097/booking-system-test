import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBookingSchema } from '../../schemas/bookingSchema';
import { useBookingContext } from '../../context/BookingContext';
import { useTranslation } from '../../context/I18nContext';
import { useToast } from '../../context/ToastContext';
import { applyApiErrors } from '../../utils/applyApiErrors';
import { addMinutesToLocalDateTime, toApiDateTime } from '../../utils/datetime';
import BookingFormIcon from '../ui/BookingFormIcon';
import Button from '../ui/Button';
import DateTimeField from '../ui/DateTimeField';
import ErrorMessage from '../ui/ErrorMessage';
import PanelToggle from '../ui/PanelToggle';
import styles from './BookingForm.module.css';

function getFirstErrorMessage(errors) {
  for (const field of ['user_name', 'start_time', 'end_time']) {
    if (errors[field]?.message) return errors[field].message;
  }
  return null;
}

function hasFormErrors(errors) {
  return Boolean(errors.user_name || errors.start_time || errors.end_time || errors.root);
}

export default function BookingForm() {
  const { selectedRoom, createBooking, fetchBookings, bookingQuery } = useBookingContext();
  const { t, locale } = useTranslation();
  const { showToast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const schema = useMemo(() => createBookingSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    clearErrors();
  }, [locale, clearErrors]);

  useEffect(() => {
    setFormOpen(false);
    reset();
  }, [selectedRoom?.id, reset]);

  useEffect(() => {
    if (hasFormErrors(errors)) {
      setFormOpen(true);
    }
  }, [errors]);

  const startTime = watch('start_time');
  const endTime = watch('end_time');

  useEffect(() => {
    if (!startTime) return;

    if (endTime && new Date(endTime) <= new Date(startTime)) {
      setValue('end_time', addMinutesToLocalDateTime(startTime, 60), {
        shouldValidate: true,
      });
    }
  }, [startTime, endTime, setValue]);

  const onInvalid = (formErrors) => {
    setFormOpen(true);
    showToast(getFirstErrorMessage(formErrors) || t('validation.fixErrors'), 'error');
  };

  const onSubmit = async (formData) => {
    try {
      await createBooking({
        ...formData,
        room_id: selectedRoom.id,
        start_time: toApiDateTime(formData.start_time),
        end_time: toApiDateTime(formData.end_time),
      });
      reset();
      await fetchBookings(selectedRoom.id, { ...bookingQuery, page: 1 });
      showToast(t('toast.bookingSuccess'), 'success');
      setFormOpen(false);
    } catch (e) {
      setFormOpen(true);
      const message = applyApiErrors(e, setError, t);
      showToast(message, 'error');
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <h3 className={styles.title}>
          {t('bookingForm.title')} — {selectedRoom?.name}
        </h3>

        <PanelToggle
          open={formOpen}
          active={hasFormErrors(errors)}
          label={t('bookingForm.toggle')}
          openLabel={t('bookingForm.openForm')}
          closeLabel={t('bookingForm.closeForm')}
          controls="booking-form-panel"
          onClick={() => setFormOpen((open) => !open)}
          icon={<BookingFormIcon />}
        />
      </div>

      <div
        id="booking-form-panel"
        className={`panel-collapse${formOpen ? ' panel-collapse--open' : ''}`}
      >
        <div className="panel-collapse__inner">
          <form
            key={locale}
            lang="en-GB"
            className={`${styles.form} panel-collapse__content${isSubmitting ? ` ${styles.formLoading}` : ''}`}
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            noValidate
          >
            <div className={`${styles.field}${errors.user_name ? ' field--error' : ''}`}>
              <label htmlFor="user_name">{t('bookingForm.userName')}</label>
              <input
                id="user_name"
                type="text"
                placeholder={t('bookingForm.userNamePlaceholder')}
                {...register('user_name')}
              />
              <ErrorMessage message={errors.user_name?.message} />
            </div>

            <DateTimeField
              id="start_time"
              label={t('bookingForm.startTime')}
              error={errors.start_time?.message}
              fieldClassName={styles.field}
              {...register('start_time')}
            />

            <DateTimeField
              id="end_time"
              label={t('bookingForm.endTime')}
              error={errors.end_time?.message}
              fieldClassName={styles.field}
              min={startTime}
              {...register('end_time')}
            />

            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? t('bookingForm.submitting') : t('bookingForm.submit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
