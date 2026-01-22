import { useTranslation } from 'react-i18next';
import { Box } from '@chakra-ui/react';

const Home = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const LanguageSwitcher = () => {
    const changeLanguage = (lng: string) => {
      i18n.changeLanguage(lng);
    };

    return (
      <>
        <button onClick={() => changeLanguage('en')}>English</button>
        <button onClick={() => changeLanguage('ar')}>Arabic</button>
        <button onClick={() => changeLanguage('fr')}>French</button>
        <button onClick={() => changeLanguage('ja')}>Japanese</button>
      </>
    );
  };

  return (
    <Box p={4} dir={isArabic ? 'rtl' : 'ltr'}>
      <h1>{t('welcome')}</h1>
      <LanguageSwitcher />
    </Box>
  );
};

export default Home;
