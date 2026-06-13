export default function SkeletonBookingList({ count = 3 }) {
  return (
    <div className="booking-list skeleton-list" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
  );
}
