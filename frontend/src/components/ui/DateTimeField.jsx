import { forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';

const DateTimeField = forwardRef(function DateTimeField(
  { id, label, error, fieldClassName = '', min, ...inputProps },
  ref,
) {
  return (
    <div className={`${fieldClassName}${error ? ' field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        ref={ref}
        id={id}
        type="datetime-local"
        lang="en-GB"
        step="60"
        min={min || undefined}
        {...inputProps}
      />
      <ErrorMessage message={error} />
    </div>
  );
});

export default DateTimeField;
