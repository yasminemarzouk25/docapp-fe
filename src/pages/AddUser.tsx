import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Stack,
  HStack,
  Heading,
  useBreakpointValue,
  useColorModeValue,
  ButtonGroup,
  CloseButton,
  AlertIcon,
  Alert,
  Flex,
  Spacer
} from '@chakra-ui/react';

import FormField from '../components/FormField';
import FormSection from '../components/FormSection';

import useErrorHandler from '../hooks/useErrorHandler';
import { userService } from '../services/userService';
import type { User } from '../types/User';

const AddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { alert, setAlert, handleError } = useErrorHandler(t);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<Partial<User>>({});

  const isArabic = i18n.language === 'ar';
  const isMobile = useBreakpointValue({ base: true, md: false }) || false;
  const darkLightColor = useColorModeValue('#012C4A', '#DDD');
  const saveBtnColor = useColorModeValue('#38A169', '#2F855A');
  const cancelBtnColor = useColorModeValue('blue.600', 'blue.400');

  const handleAddUser = async () => {
    try {
      setIsSubmitting(true);
      await userService.create(newUser);
      navigate('/app/users', {
        state: { message: t('addUser.successMessage') }
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
    field: keyof Partial<User>
  ) => {
    const { value } = e.target;

    setNewUser((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  return (
    <>
      <Box maxW="100%" dir={isArabic ? 'rtl' : 'ltr'} minH="100%">
        {/* <Box px={isMobile ? 4 : 8}> */}
        <Flex my={6} dir={isArabic ? 'rtl' : 'ltr'} alignItems="center">
          {/* <Box mt={2} mb={isMobile ? 4 : 0}> */}
          <Box>
            <Heading as="h4" size="md" color={darkLightColor}>
              {t('addUser.pageTitle')}
            </Heading>
          </Box>
          <Spacer />
        </Flex>
        {alert && (
          <Alert status={alert.status} my={4} dir={isArabic ? 'rtl' : 'ltr'}>
            <AlertIcon />
            {alert.message}
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={() => setAlert(null)}
            />
          </Alert>
        )}
        {/* Form for adding a new user */}
        <Box w="100%" paddingLeft={isMobile ? 1 : 0}>
          <form>
            <Stack spacing={6}>
              {/* Personal Information Section */}
              <FormSection
                title={t('addUser.sections.personalInformation')}
                isMobile={isMobile}
                darkLightColor={darkLightColor}
              />

              <HStack
                spacing={4}
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                alignItems="flex-start"
              >
                <FormField
                  label={t('addUser.firstName')}
                  type="text"
                  darkLightColor={darkLightColor}
                  isMobile={isMobile}
                  isRequired
                  isDisabled={isSubmitting}
                  // OnChange={(e) => handleChange(e, 'firstName')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e, 'firstName')
                  }
                />
                <FormField
                  label={t('addUser.lastName')}
                  type="text"
                  darkLightColor={darkLightColor}
                  isMobile={isMobile}
                  isRequired
                  isDisabled={isSubmitting}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e, 'lastName')
                  }
                />
                <FormField
                  label={t('addUser.displayName')}
                  type="text"
                  darkLightColor={darkLightColor}
                  isMobile={isMobile}
                  isDisabled={isSubmitting}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e, 'displayName')
                  }
                />
              </HStack>

              <HStack
                spacing={4}
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                alignItems="flex-start"
              >
                <FormField
                  label={t('addUser.email')}
                  type="email"
                  darkLightColor={darkLightColor}
                  isMobile={isMobile}
                  isRequired
                  isDisabled={isSubmitting}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e, 'email')
                  }
                />

                <FormField
                  label={t('addUser.mobile')}
                  type="tel"
                  darkLightColor={darkLightColor}
                  isMobile={isMobile}
                  isDisabled={isSubmitting}
                  // OnChange={(e) => handleChange(e, 'mobile')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e, 'mobile')
                  }
                />
                <FormField
                  label={t('addUser.birthday')}
                  type="date"
                  darkLightColor={darkLightColor}
                  isMobile={isMobile}
                  isDisabled={isSubmitting}
                  // OnChange={(e) => handleChange(e, 'birthday')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e, 'birthday')
                  }
                />
              </HStack>

              {/* Professional Details Section */}
              <FormSection
                title={t('addUser.sections.professionalDetails')}
                isMobile={isMobile}
                darkLightColor={darkLightColor}
              />
              <HStack
                spacing={4}
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                alignItems="flex-start"
              >
                <FormField
                  label={t('addUser.companyName')}
                  type="text"
                  darkLightColor={darkLightColor}
                  isMobile={isMobile}
                  isDisabled={isSubmitting}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e, 'companyName')
                  }
                />
                <FormField
                  label={t('addUser.jobTitle')}
                  type="text"
                  darkLightColor={darkLightColor}
                  isMobile={isMobile}
                  isDisabled={isSubmitting}
                  // OnChange={(e) => handleChange(e, 'jobTitle')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e, 'jobTitle')
                  }
                />
                <FormControl isDisabled={isSubmitting}>
                  <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                    {t('addUser.department')}
                  </FormLabel>

                  <Select
                    placeholder={t('addUser.department')}
                    color={darkLightColor}
                    onChange={(e) => handleChange(e, 'department')}
                  >
                    <option value="dev-integration">Dev && Integration</option>
                    <option value="sap">SAP</option>
                    <option value="hr">HR</option>
                  </Select>
                </FormControl>
              </HStack>

              {/* Additional Information Section */}
              <FormSection
                title={t('addUser.sections.additionalInformation')}
                isMobile={isMobile}
                darkLightColor={darkLightColor}
              />
              <HStack
                spacing={4}
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                alignItems="flex-start"
              >
                <FormControl isDisabled={isSubmitting}>
                  <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                    {t('addUser.country')}
                  </FormLabel>
                  <Select
                    placeholder={t('addUser.country')}
                    color={darkLightColor}
                    onChange={(e) => handleChange(e, 'country')}
                  >
                    <option value="tunisia">Tunisia </option>
                    <option value="japan">Japan</option>
                    <option value="dubai">Dubai</option>
                    <option value="canada">Canada</option>
                  </Select>
                </FormControl>
                <FormField
                  label={t('addUser.state')}
                  type="text"
                  darkLightColor={darkLightColor}
                  isMobile={isMobile}
                  isDisabled={isSubmitting}
                  // OnChange={(e) => handleChange(e, 'state')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e, 'state')
                  }
                />
                <FormField
                  label={t('addUser.streetAddress')}
                  type="text"
                  darkLightColor={darkLightColor}
                  isMobile={isMobile}
                  isDisabled={isSubmitting}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e, 'streetAddress')
                  }
                />
                <FormField
                  label={t('addUser.postalCode')}
                  type="text"
                  darkLightColor={darkLightColor}
                  isMobile={isMobile}
                  isDisabled={isSubmitting}
                  // OnChange={(e) => handleChange(e, 'postalCode')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e, 'postalCode')
                  }
                />
              </HStack>

              {/* Save and Cancel Buttons */}
              <HStack
                display="flex"
                justifyContent={isArabic ? 'start' : 'end'}
                spacing={4}
              >
                <ButtonGroup gap="4">
                  <NavLink to="/app/users">
                    <Button
                      color={cancelBtnColor}
                      border="1px"
                      type="button"
                      isDisabled={isSubmitting}
                    >
                      {t('addUser.buttons.cancel')}
                    </Button>
                  </NavLink>
                  <Button
                    color={saveBtnColor}
                    border="1px"
                    type="submit"
                    isLoading={isSubmitting}
                    onClick={() => {
                      handleAddUser();
                    }}
                  >
                    {t('addUser.buttons.save')}
                  </Button>
                </ButtonGroup>
              </HStack>
            </Stack>
          </form>
        </Box>
      </Box>
    </>
  );
};

export default AddUserPage;
