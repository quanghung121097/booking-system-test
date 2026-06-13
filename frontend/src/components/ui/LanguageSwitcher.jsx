import { useTranslation } from '../../context/I18nContext';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="lang-switcher">
      <button
        type="button"
        className={`lang-switcher__btn${locale === 'vi' ? ' lang-switcher__btn--active' : ''}`}
        onClick={() => setLocale('vi')}
      >
        VI
      </button>
      <button
        type="button"
        className={`lang-switcher__btn${locale === 'en' ? ' lang-switcher__btn--active' : ''}`}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
    </div>
  );
}
