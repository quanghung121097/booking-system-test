import Spinner from './Spinner';

export default function LoadingOverlay({ visible, label = 'Loading' }) {
  return (
    <div
      className={`loading-overlay${visible ? ' loading-overlay--visible' : ''}`}
      aria-hidden={!visible}
      aria-live="polite"
    >
      <div className="loading-overlay__content">
        <Spinner size="md" />
        {label ? <span className="loading-overlay__label">{label}</span> : null}
      </div>
    </div>
  );
}
