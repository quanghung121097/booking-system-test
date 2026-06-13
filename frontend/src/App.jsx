import { BookingProvider, useBookingContext } from './context/BookingContext';
import { useTranslation } from './context/I18nContext';
import Dashboard from './pages/Dashboard';
import LoginForm from './components/LoginForm/LoginForm';
import Button from './components/ui/Button';
import LanguageSwitcher from './components/ui/LanguageSwitcher';

function AppContent() {
  const { isAuthenticated, logout } = useBookingContext();
  const { t } = useTranslation();

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header__inner">
          <h1>{t('app.title')}</h1>
          <div className="app-header__actions">
            <LanguageSwitcher />
            {isAuthenticated && (
              <Button variant="danger" onClick={logout}>
                {t('app.logout')}
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className={`app-layout__body${isAuthenticated ? ' app-layout__body--dashboard' : ''}`}>
        {isAuthenticated ? <Dashboard /> : <LoginForm />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BookingProvider>
      <AppContent />
    </BookingProvider>
  );
}
