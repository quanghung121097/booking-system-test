import { useEffect } from 'react';
import { defaultBookingQuery, useBookingContext } from '../context/BookingContext';
import { useTranslation } from '../context/I18nContext';
import RoomList from '../components/RoomList/RoomList';
import BookingList from '../components/BookingList/BookingList';
import BookingForm from '../components/BookingForm/BookingForm';

export default function Dashboard() {
  const { selectedRoom, fetchBookings } = useBookingContext();
  const { t } = useTranslation();

  useEffect(() => {
    if (selectedRoom?.id) {
      fetchBookings(selectedRoom.id, { ...defaultBookingQuery });
    }
  }, [selectedRoom?.id, fetchBookings]);

  return (
    <div className="dashboard">
      <aside className="dashboard__sidebar">
        <h2 className="sidebar__heading">{t('dashboard.rooms')}</h2>
        <RoomList />
      </aside>

      <main className="dashboard__main">
        {!selectedRoom ? (
          <div className="empty-state">
            <p>{t('dashboard.empty')}</p>
          </div>
        ) : (
          <>
            <section className="dashboard__form-section">
              <BookingForm />
            </section>
            <section className="dashboard__bookings-section">
              <h3 className="section-heading">{t('dashboard.currentBookings')}</h3>
              <BookingList />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
