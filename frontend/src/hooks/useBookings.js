import { useEffect } from 'react';
import { defaultBookingQuery, useBookingContext } from '../context/BookingContext';

export function useBookings() {
  const { bookings, bookingsLoading, bookingsMeta, error, selectedRoom, fetchBookings } =
    useBookingContext();

  useEffect(() => {
    if (!selectedRoom?.id) return;

    fetchBookings(selectedRoom.id, { ...defaultBookingQuery });
  }, [selectedRoom?.id, fetchBookings]);

  return { bookings, loading: bookingsLoading, meta: bookingsMeta, error };
}
