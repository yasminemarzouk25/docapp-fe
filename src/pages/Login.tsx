import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Divider,
  Heading,
  HStack,
  Stack,
  Text,
  useColorModeValue,
  Link as ChakraLink,
  Alert,
  AlertIcon
} from '@chakra-ui/react';

import { useMsal } from '@azure/msal-react';
import type { AuthenticationResult } from '@azure/msal-browser';
import { loginRequest } from '../config/msal';
import { isValidRedirect } from '../utils';

import Logo from '../components/Logo';
import MicrosoftButton from '../components/MicrosoftButton';

import authService from '../services/authService';
import useErrorHandler from '../hooks/useErrorHandler';
import useLoader from '../hooks/useLoader';
import { UserRole } from '../types/User';

const Login = () => {
  const navigate = useNavigate();
  const { instance } = useMsal();
  const { t } = useTranslation();
  const { alert, setAlert, handleError } = useErrorHandler(t);

  const { setIsLoading, isLoading, Loader } = useLoader({
    isLoadingDefault: false
  });

  const linkColor = useColorModeValue('blue.500', 'blue.200');

  // Color tokens (avoid calling useColorModeValue inline in JSX)
  const rightPanelBg = useColorModeValue('white', 'gray.800');
  const headingColorLg = useColorModeValue('gray.800', 'white');
  const textColorLg = useColorModeValue('gray.600', 'gray.400');
  const alertBg = useColorModeValue('white', 'gray.700');
  const dividerColorLg = useColorModeValue('gray.200', 'gray.600');
  const smallTextColorLg = useColorModeValue('gray.500', 'gray.400');

  const location = useLocation();

  const handleLogin = () => {
    instance.clearCache();
    setIsLoading(true);

    instance
      .loginPopup(loginRequest)
      .then(async (result: void | AuthenticationResult) => {
        if (result) {
          const { accessToken } = result;
          instance.clearCache();

          setAlert(null);
          try {
            const tokens = await authService.sso(accessToken);
            authService.storeTokens(tokens);
            setAlert(null);

            let path = '';
            const userRole = authService.getUserRole();

            if (userRole.includes(UserRole._HR)) {
              path = '/app/';
            } else if (userRole.includes(UserRole._Signer)) {
              path = '/app/requests?tab=1';
            } else {
              path = '/app/requests?tab=0';
            }

            const redirectTo =
              new URLSearchParams(location.search).get('redirect') || path;

            navigate(isValidRedirect(redirectTo) ? redirectTo : path);
          } catch (error) {
            handleError(error);
          }
        }
      })
      .catch(() => {
        setAlert({ status: 'error', message: t('login.unexpectedError') });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Box
      minH="100vh"
      h={{ base: '100vh', lg: 'auto' }}
      display="flex"
      flexDirection={{ base: 'column', lg: 'row' }}
      overflow="hidden"
      id="login-page"
    >
      {/* Left Branding Panel - Hidden on mobile */}
      <Box
        flex={{ base: 'none', lg: '1' }}
        bgGradient="linear(to-br, blue.900, blue.600)"
        color="white"
        display={{ base: 'none', lg: 'flex' }}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={{ lg: 16 }}
        minH="100vh"
        position="relative"
        boxShadow="2xl"
      >
        <Box
          textAlign="center"
          maxW="500px"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Box mb={3}>
            <Logo height="72" />
          </Box>
          <Heading
            size="xl"
            mb={2}
            fontWeight="bold"
            letterSpacing="tight"
            lineHeight={1.1}
          >
            Doc-App
          </Heading>
          <Text fontSize="lg" opacity={0.92} lineHeight="1.7" mt={2}>
            {t('login.welcomeMessage')}
          </Text>
        </Box>
      </Box>

      {/* Right Login Panel - Full screen on mobile with blue background */}
      <Box
        flex={{ base: '1', lg: '1' }}
        bg={{
          base: 'transparent',
          lg: rightPanelBg
        }}
        bgGradient={{
          base: 'linear(to-br, blue.900, blue.600)',
          lg: 'none'
        }}
        display="flex"
        alignItems={{ base: 'flex-start', lg: 'center' }}
        justifyContent="center"
        p={{ base: 6, md: 10, lg: 12 }}
        pt={{ base: 20, lg: 12 }}
        minH="100vh"
        h={{ base: '100vh', lg: 'auto' }}
      >
        {isLoading ? (
          <Loader />
        ) : (
          <Box w="full" maxW="440px">
            <Stack spacing={{ base: 6, md: 8 }}>
              {/* Logo and App Name - Only visible on mobile */}
              <Box
                display={{ base: 'flex', lg: 'none' }}
                flexDirection="column"
                alignItems="center"
                mb={{ base: 2, md: 4 }}
              >
                <Box mb={3}>
                  <Logo height="60" />
                </Box>
                <Heading
                  size="lg"
                  color="white"
                  fontWeight="bold"
                  letterSpacing="tight"
                >
                  Doc-App
                </Heading>
              </Box>

              <Stack spacing={3} textAlign="center">
                <Heading
                  size={{ base: 'lg', md: 'xl' }}
                  color={{ base: 'white', lg: headingColorLg }}
                  fontWeight="bold"
                >
                  {t('login.loginToAccount')}
                </Heading>
                <Text
                  color={{ base: 'whiteAlpha.900', lg: textColorLg }}
                  fontSize={{ base: 'sm', md: 'md' }}
                >
                  {t('login.accessRestricted')}
                </Text>
              </Stack>

              {alert && (
                <Alert
                  status={alert.status}
                  borderRadius="md"
                  alignItems="flex-start"
                  bg={alertBg}
                >
                  <AlertIcon mt={1} />
                  {alert.message}
                </Alert>
              )}

              <Stack spacing={6}>
                <MicrosoftButton handleLogin={handleLogin} />

                <Box pt={4}>
                  <HStack spacing={4} justify="center">
                    <Divider
                      borderColor={{
                        base: 'whiteAlpha.400',
                        lg: dividerColorLg
                      }}
                    />
                    <Text
                      fontSize="sm"
                      color={{ base: 'whiteAlpha.900', lg: smallTextColorLg }}
                      whiteSpace="nowrap"
                    >
                      {t('login.havingIssues')}&nbsp;
                      <ChakraLink
                        as={RouterLink}
                        to="#"
                        color={{
                          base: 'white',
                          lg: linkColor
                        }}
                        fontWeight="medium"
                        textDecoration="underline"
                      >
                        {t('login.contactSupport')}
                      </ChakraLink>
                    </Text>
                    <Divider
                      borderColor={{
                        base: 'whiteAlpha.400',
                        lg: dividerColorLg
                      }}
                    />
                  </HStack>
                </Box>
              </Stack>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Login;
