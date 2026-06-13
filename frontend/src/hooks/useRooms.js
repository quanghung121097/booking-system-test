import { useBookingContext } from '../context/BookingContext';

export function useRooms() {
  const { rooms, roomsLoading, error } = useBookingContext();
  return { rooms, loading: roomsLoading, error };
}
