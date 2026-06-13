export default function SkeletonRoomList({ count = 5 }) {
  return (
    <ul className="skeleton-room-list" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="skeleton-room" />
      ))}
    </ul>
  );
}
