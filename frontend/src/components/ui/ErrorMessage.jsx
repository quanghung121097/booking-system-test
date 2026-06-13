export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <span className="error-msg" role="alert">
      {message}
    </span>
  );
}
