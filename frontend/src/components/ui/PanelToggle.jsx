export default function PanelToggle({
  open,
  active = false,
  label,
  openLabel,
  closeLabel,
  controls,
  onClick,
  icon,
}) {
  return (
    <button
      type="button"
      className={`panel-toggle${open ? ' panel-toggle--open' : ''}${active ? ' panel-toggle--active' : ''}`}
      onClick={onClick}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? closeLabel : openLabel}
    >
      {icon}
      <span>{label}</span>
      {active ? <span className="panel-toggle__badge" aria-hidden="true" /> : null}
      <svg
        className="panel-toggle__chevron"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}
