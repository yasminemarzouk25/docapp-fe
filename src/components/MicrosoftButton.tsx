import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, useColorModeValue } from '@chakra-ui/react';

interface MicrosoftButtonProps {
  handleLogin: () => void;
}

const MicrosoftButton: React.FC<MicrosoftButtonProps> = ({ handleLogin }) => {
  const { t } = useTranslation();

  const buttonBgColor = useColorModeValue('blue.100', 'blue.800');
  const buttonBgHoverColor = useColorModeValue('blue.200', 'blue.900');

  return (
    <Button
      onClick={handleLogin}
      bg={buttonBgColor}
      _hover={{ bg: buttonBgHoverColor }}
      flexGrow={1}
      alignItems="center"
      leftIcon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 21 21"
          width="16"
          height="16"
        >
          <path fill="#f35325" d="M0 0h10v10H0z" />
          <path fill="#81bc06" d="M11 0h10v10H11z" />
          <path fill="#05a6f0" d="M0 11h10v10H0z" />
          <path fill="#ffba08" d="M11 11h10v10H11z" />
        </svg>
      }
    >
      {t('login.signInWithMicrosoft')}
    </Button>
  );
};

export default MicrosoftButton;
