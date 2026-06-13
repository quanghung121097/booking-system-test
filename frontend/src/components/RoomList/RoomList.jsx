import { useBookingContext } from '../../context/BookingContext';
import { useTranslation } from '../../context/I18nContext';
import { useRooms } from '../../hooks/useRooms';
import { useDelayedLoading } from '../../hooks/useDelayedLoading';
import ErrorMessage from '../ui/ErrorMessage';
import LoadingOverlay from '../ui/LoadingOverlay';
import SkeletonRoomList from '../ui/SkeletonRoomList';
import styles from './RoomList.module.css';

export default function RoomList() {
  const { rooms, loading, error } = useRooms();
  const { selectedRoom, selectRoom } = useBookingContext();
  const { t } = useTranslation();
  const showOverlay = useDelayedLoading(loading && rooms.length > 0);

  if (error) return <ErrorMessage message={error} />;

  if (loading && rooms.length === 0) {
    return <SkeletonRoomList />;
  }

  return (
    <div className={`${styles.wrapper}${showOverlay ? ` ${styles.wrapperDimmed}` : ''}`}>
      <LoadingOverlay visible={showOverlay} label={t('common.loading')} />
      <ul className={styles.list}>
        {rooms.map((room) => {
          const count = room.bookings_count ?? 0;
          const bookingLabel = count === 1 ? t('roomList.bookings') : t('roomList.bookingsPlural');

          return (
            <li
              key={room.id}
              className={`${styles.item} ${selectedRoom?.id === room.id ? styles.itemActive : ''}`}
              onClick={() => selectRoom(room)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && selectRoom(room)}
              aria-pressed={selectedRoom?.id === room.id}
            >
              <span className={styles.name}>{room.name}</span>
              <span className={styles.meta}>
                {t('roomList.capacity')}: {room.capacity} · {count} {bookingLabel}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
