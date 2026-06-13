import { useEffect, useState } from 'react';
import { defaultBookingQuery, useBookingContext } from '../../context/BookingContext';
import { useTranslation } from '../../context/I18nContext';
import { useDelayedLoading } from '../../hooks/useDelayedLoading';
import Button from '../ui/Button';
import DateTimeField from '../ui/DateTimeField';
import FilterIcon from '../ui/FilterIcon';
import LoadingOverlay from '../ui/LoadingOverlay';
import PanelToggle from '../ui/PanelToggle';
import SkeletonBookingList from '../ui/SkeletonBookingList';
import BookingCard from './BookingCard';

function hasActiveFilters(query) {
  return Boolean(query.user_name?.trim() || query.from || query.to);
}

export default function BookingList() {
  const {
    selectedRoom,
    bookings,
    bookingsMeta,
    bookingsLoading,
    bookingQuery,
    fetchBookings,
  } = useBookingContext();
  const { t } = useTranslation();
  const showLoadingOverlay = useDelayedLoading(bookingsLoading);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    user_name: '',
    from: '',
    to: '',
    per_page: defaultBookingQuery.per_page,
  });

  useEffect(() => {
    setFilters({
      user_name: bookingQuery.user_name ?? '',
      from: bookingQuery.from ?? '',
      to: bookingQuery.to ?? '',
      per_page: bookingQuery.per_page ?? defaultBookingQuery.per_page,
    });
  }, [selectedRoom?.id, bookingQuery]);

  const handleSearch = (e) => {
    e?.preventDefault();
    fetchBookings(selectedRoom.id, {
      ...filters,
      page: 1,
    });
  };

  const handleClear = () => {
    setFilters((prev) => ({
      user_name: '',
      from: '',
      to: '',
      per_page: prev.per_page,
    }));
    fetchBookings(selectedRoom.id, {
      ...defaultBookingQuery,
      per_page: filters.per_page,
      page: 1,
    });
  };

  const handlePerPageChange = (perPage) => {
    setFilters((prev) => ({ ...prev, per_page: perPage }));
    fetchBookings(selectedRoom.id, {
      ...bookingQuery,
      user_name: filters.user_name,
      from: filters.from,
      to: filters.to,
      per_page: perPage,
      page: 1,
    });
  };

  const handlePageChange = (page) => {
    fetchBookings(selectedRoom.id, { ...bookingQuery, page });
  };

  const meta = bookingsMeta ?? {
    current_page: 1,
    last_page: 1,
    per_page: filters.per_page,
    total: bookings.length,
  };

  const isInitialLoad = bookingsLoading && bookings.length === 0;
  const showNoResults = !bookingsLoading && bookings.length === 0 && hasActiveFilters(bookingQuery);
  const showEmpty = !bookingsLoading && bookings.length === 0 && !hasActiveFilters(bookingQuery);
  const filtersActive = hasActiveFilters(bookingQuery);

  return (
    <div className="booking-list-panel">
      <div className="booking-list-panel__toolbar">
        {!isInitialLoad && meta.total > 0 ? (
          <p className="booking-list__summary">
            {t('bookingList.total', { total: meta.total })}
            {' · '}
            {t('bookingList.page', { current: meta.current_page, last: meta.last_page })}
          </p>
        ) : (
          <span className="booking-list-panel__toolbar-spacer" />
        )}

        <div className="booking-list-panel__toolbar-actions">
          <label className="booking-list-panel__per-page">
            <span>{t('bookingList.perPage')}</span>
            <select
              value={filters.per_page}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <PanelToggle
            open={filtersOpen}
            active={filtersActive}
            label={t('bookingList.filters')}
            openLabel={t('bookingList.openFilters')}
            closeLabel={t('bookingList.closeFilters')}
            controls="booking-filters-panel"
            onClick={() => setFiltersOpen((open) => !open)}
            icon={<FilterIcon />}
          />
        </div>
      </div>

      <div
        id="booking-filters-panel"
        className={`panel-collapse${filtersOpen ? ' panel-collapse--open' : ''}`}
      >
        <div className="panel-collapse__inner">
          <form className="booking-filters" lang="en-GB" onSubmit={handleSearch}>
            <div className="booking-filters__row">
              <label className="booking-filters__field">
                <span>{t('bookingList.searchName')}</span>
                <input
                  type="text"
                  value={filters.user_name}
                  placeholder={t('bookingList.searchNamePlaceholder')}
                  onChange={(e) => setFilters((prev) => ({ ...prev, user_name: e.target.value }))}
                />
              </label>

              <DateTimeField
                id="filter_from"
                label={t('bookingList.searchFrom')}
                value={filters.from}
                onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                fieldClassName="booking-filters__field"
              />

              <DateTimeField
                id="filter_to"
                label={t('bookingList.searchTo')}
                value={filters.to}
                min={filters.from}
                onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                fieldClassName="booking-filters__field"
              />
            </div>

            <div className="booking-filters__actions">
              <Button type="submit">{t('bookingList.search')}</Button>
              <button type="button" className="btn btn--ghost" onClick={handleClear}>
                {t('bookingList.clear')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="booking-list-panel__scroll">
        <div
          className={`booking-list-panel__body${showLoadingOverlay && bookings.length ? ' booking-list-panel__body--dimmed' : ''}`}
        >
          <LoadingOverlay visible={showLoadingOverlay && bookings.length > 0} label={t('common.loading')} />

          {isInitialLoad ? (
            <SkeletonBookingList count={filters.per_page > 5 ? 5 : filters.per_page} />
          ) : showEmpty ? (
            <p className="empty-msg">{t('bookingList.empty')}</p>
          ) : showNoResults ? (
            <p className="empty-msg">{t('bookingList.noResults')}</p>
          ) : (
            <div className="booking-list">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>

        {!isInitialLoad && meta.last_page > 1 && (
          <div className="booking-pagination">
            <button
              type="button"
              className="btn btn--ghost"
              disabled={bookingsLoading || meta.current_page <= 1}
              onClick={() => handlePageChange(meta.current_page - 1)}
            >
              {t('bookingList.prev')}
            </button>
            <span className="booking-pagination__info">
              {t('bookingList.page', { current: meta.current_page, last: meta.last_page })}
            </span>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={bookingsLoading || meta.current_page >= meta.last_page}
              onClick={() => handlePageChange(meta.current_page + 1)}
            >
              {t('bookingList.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
