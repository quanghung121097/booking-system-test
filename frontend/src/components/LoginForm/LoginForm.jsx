import { useEffect, useState } from 'react';
import { useBookingContext } from '../../context/BookingContext';
import { useTranslation } from '../../context/I18nContext';
import { useToast } from '../../context/ToastContext';
import { translateApiError } from '../../utils/apiErrors';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import styles from './LoginForm.module.css';

function validateLogin({ email, password }, t) {
  const errors = {};
  if (!email.trim()) {
    errors.email = t('login.emailRequired');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = t('login.emailInvalid');
  }
  if (!password) {
    errors.password = t('login.passwordRequired');
  }
  return errors;
}

export default function LoginForm() {
  const { login } = useBookingContext();
  const { t, locale } = useTranslation();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFieldErrors({});
    setError('');
  }, [locale]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validateLogin({ email, password }, t);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast(Object.values(errors)[0], 'error');
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const message = translateApiError(err.rawMessage ?? err.message, t, err.code)
        || t('toast.loginFailed');
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.title}>{t('login.title')}</h2>

        <div className={`${styles.field}${fieldErrors.email ? ' field--error' : ''}`}>
          <label htmlFor="email">{t('login.email')}</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            autoComplete="email"
          />
          <ErrorMessage message={fieldErrors.email} />
        </div>

        <div className={`${styles.field}${fieldErrors.password ? ' field--error' : ''}`}>
          <label htmlFor="password">{t('login.password')}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            autoComplete="current-password"
          />
          <ErrorMessage message={fieldErrors.password} />
        </div>

        <ErrorMessage message={error} />

        <Button type="submit" loading={loading}>
          {loading ? t('login.submitting') : t('login.submit')}
        </Button>
      </form>
    </div>
  );
}
