import React, { useEffect, useState, useRef, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  useBreakpointValue,
  useColorModeValue,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Flex,
  CloseButton,
  AlertTitle,
  Button,
  useDisclosure,
  Spacer,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  FormErrorMessage,
  Badge
} from '@chakra-ui/react';
import { DeleteIcon, InfoIcon, AddIcon } from '@chakra-ui/icons';
import { useForm, Controller } from 'react-hook-form';

import Pagination from '../components/Pagination';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

import type { Language } from '../types/Language';

import { displayFieldOrDash } from '../utils';
import { languageService } from '../services/languageService';

import usePagination, { initialPaginationMeta } from '../hooks/usePagination';
import useErrorHandler from '../hooks/useErrorHandler';
import useLoader from '../hooks/useLoader';
import {
  type LanguageFormData,
  languageValidationRules
} from '../forms/addLanguage';

const LanguageManagement: React.FC = (): ReactElement => {
  const [languageList, setLanguageList] = useState<Language[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addSuccessMessage, setAddSuccessMessage] = useState<string | null>(
    null
  );
  const [bodyHeight, setBodyHeight] = useState(window.innerHeight);
  const [tableKey, setTableKey] = useState(0);
  const tableBoxRef = useRef<HTMLDivElement>(null);

  const { t, i18n } = useTranslation();
  const { alert, setAlert, handleError } = useErrorHandler(t);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const colorBorder = useColorModeValue('gray.100', 'gray.700');
  const actionsBtnColor = useColorModeValue('gray.300', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.900');
  const theadColor = useColorModeValue('gray.200', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const isArabic = i18n.language === 'ar';
  const rowsPerPage = 10;

  const { paginationMetadata, setPaginationMetaData } =
    usePagination(rowsPerPage);
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal
  } = useDisclosure();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
    reset
  } = useForm<LanguageFormData>({
    defaultValues: { code: '', name: '' }
  });

  const validationRules = languageValidationRules(t);

  const getHeightValues = () => {
    const hasAlert = alert && alert.message.length > 0;
    let heightPair;

    if (bodyHeight > 780) {
      heightPair = ['70vh', '75vh'];
    } else if (bodyHeight > 525) {
      heightPair = ['55vh', '65vh'];
    } else {
      heightPair = ['30vh', '35vh'];
    }

    return hasAlert ? heightPair[0] : heightPair[1];
  };

  const getPaddingValues = () => {
    let cellPadding;
    let headerPadding;

    if (bodyHeight > 900) {
      cellPadding = { py: 4, px: 2 };
      headerPadding = { py: 5, px: 2 };
    } else if (bodyHeight > 780) {
      cellPadding = { py: 3, px: 2 };
      headerPadding = { py: 4, px: 2 };
    } else if (bodyHeight > 525) {
      cellPadding = { py: 2, px: 2 };
      headerPadding = { py: 3, px: 2 };
    } else {
      cellPadding = { py: 1, px: 2 };
      headerPadding = { py: 3, px: 2 };
    }

    return { cellPadding, headerPadding };
  };

  const getErrorBorderColor = (hasError: boolean): string | undefined => {
    return hasError ? 'red.500' : undefined;
  };

  const fetchLanguages = async (
    paginate: boolean,
    page: number,
    limit: number | null
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await languageService.getAll(paginate, page, limit);
      setLanguageList(response.data);

      // Extract metadata from the response (excluding the data field)
      const { data, ...metadata } = response;
      setPaginationMetaData(metadata);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchLanguages(true, page, rowsPerPage);
  };

  const refreshLanguagesList = () => {
    fetchLanguages(true, 1, rowsPerPage);
  };

  const handleDeleteClick = async () => {
    try {
      setIsSubmitting(true);
      if (!selectedLanguageId) {
        setAlert({
          status: 'error',
          message: t('languageManagement.deleteError')
        });

        return;
      }

      await languageService._delete(selectedLanguageId);
      setAlert({
        status: 'success',
        message: t('languageManagement.deleteSuccess')
      });
      fetchLanguages(true, 1, rowsPerPage);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
      onCloseDeleteModal();
    }
  };

  const onAddSubmit = async (data: LanguageFormData) => {
    try {
      setIsSubmitting(true);
      await languageService.create(data.code.toLowerCase(), data.name);
      setAddSuccessMessage(t('languageManagement.addSuccess'));
      reset();
      refreshLanguagesList();
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    reset();
    setAlert(null);
    setAddSuccessMessage(null);
  };

  useEffect(() => {
    const handleResize = () => setBodyHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setTableKey((prev) => prev + 1);
    const ref = tableBoxRef.current;
    if (ref) ref.addEventListener('scroll', handleScroll);

    return () => {
      if (ref) ref.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    fetchLanguages(true, 1, rowsPerPage);

    return () => {
      // Cleanup logic here
      setLanguageList([]);
      setPaginationMetaData(initialPaginationMeta);
      setAlert(null);
      setAddSuccessMessage(null);
    };
  }, []);

  // Component rendering
  const height = getHeightValues();
  const { Loader, isLoading, setIsLoading } = useLoader({ height });
  const { cellPadding, headerPadding } = getPaddingValues();
  const direction = isArabic ? 'rtl' : 'ltr';

  const renderMobileRow = (language: Language, index: number) => (
    <Tr key={index} _hover={{ bg: hoverBgColor }}>
      <Td maxW="100px" {...cellPadding}>
        <Box whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
          <Text as="span" fontWeight="bold" mr={1}>
            {t('languageManagement.languageCode')} :
          </Text>
          <Badge colorScheme="blue" mr={2}>
            {displayFieldOrDash(language.code?.toUpperCase())}
          </Badge>
        </Box>
        <Box
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          mt={2}
        >
          <Text as="span" fontWeight="bold" mr={1}>
            {t('languageManagement.languageName')} :
          </Text>
          {displayFieldOrDash(language.name)}
        </Box>
        <Box
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          mt={2}
        >
          <Text as="span" fontWeight="bold" mr={1}>
            {t('languageManagement.actions')} :
          </Text>
          {language.isDeletable && (
            <IconButton
              icon={<DeleteIcon />}
              backgroundColor={actionsBtnColor}
              aria-label="Delete"
              size="sm"
              ml={1}
              onClick={() => {
                setSelectedLanguageId(language.code);
                onOpenDeleteModal();
              }}
              isDisabled={isSubmitting}
            />
          )}
        </Box>
      </Td>
    </Tr>
  );

  const renderDesktopRow = (language: Language, index: number) => (
    <Tr key={index} _hover={{ bg: hoverBgColor }}>
      <Td w="120px" textAlign="center" fontSize="xs" {...cellPadding}>
        <Badge colorScheme="blue" fontSize="sm">
          {displayFieldOrDash(language.code?.toUpperCase())}
        </Badge>
      </Td>
      <Td w="200px" textAlign="center" fontSize="xs" {...cellPadding}>
        <Box
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          textAlign="center"
        >
          {displayFieldOrDash(language.name)}
        </Box>
      </Td>
      <Td w="100px" textAlign="center" fontSize="xs" {...cellPadding}>
        <Box whiteSpace="nowrap" overflow="hidden" textAlign="center">
          {language.isDeletable && (
            <IconButton
              icon={<DeleteIcon />}
              backgroundColor={actionsBtnColor}
              aria-label="Delete"
              size="sm"
              ml={1}
              onClick={() => {
                setSelectedLanguageId(language.code);
                onOpenDeleteModal();
              }}
              isDisabled={isSubmitting}
            />
          )}
        </Box>
      </Td>
    </Tr>
  );

  const renderTableHeader = () => (
    <Thead position="sticky" top={0} zIndex="docked" bg={theadColor}>
      {!isMobile && (
        <Tr fontSize="xs">
          <Th w="120px" textAlign="center" fontSize="xs" {...headerPadding}>
            <InfoIcon mx={1} boxSize={3} />-{' '}
            {t('languageManagement.languageCode')}
          </Th>
          <Th w="200px" textAlign="center" fontSize="xs" {...headerPadding}>
            <InfoIcon mx={1} boxSize={3} />-{' '}
            {t('languageManagement.languageName')}
          </Th>
          <Th w="100px" textAlign="center" fontSize="xs" {...headerPadding}>
            <InfoIcon mx={1} boxSize={3} />- {t('languageManagement.actions')}
          </Th>
        </Tr>
      )}
    </Thead>
  );

  const renderEmptyState = () => (
    <Tr>
      <Td colSpan={isMobile ? 1 : 3}>
        <Alert
          status="info"
          textAlign="center"
          justifyContent="center"
          dir={direction}
        >
          <AlertIcon />
          <AlertTitle> {t('languageManagement.noLanguages')} </AlertTitle>
        </Alert>
      </Td>
    </Tr>
  );

  const renderFormControls = () => (
    <>
      <FormControl isRequired isInvalid={Boolean(errors.code)}>
        <FormLabel>{t('languageManagement.languageCode')}</FormLabel>
        <Controller
          name="code"
          control={control}
          rules={validationRules.code}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={t('languageManagement.codePlaceholder')}
              focusBorderColor={getErrorBorderColor(Boolean(errors.code))}
              maxLength={2}
              style={{ textTransform: 'uppercase' }}
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
            />
          )}
        />
        <FormErrorMessage>{errors.code?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={Boolean(errors.name)}>
        <FormLabel>{t('languageManagement.languageName')}</FormLabel>
        <Controller
          name="name"
          control={control}
          rules={validationRules.name}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={t('languageManagement.namePlaceholder')}
              focusBorderColor={getErrorBorderColor(Boolean(errors.name))}
            />
          )}
        />
        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
      </FormControl>
    </>
  );

  const renderDesktopForm = () => (
    <HStack spacing={4} align="flex-start">
      <FormControl isRequired isInvalid={Boolean(errors.code)} flex="1">
        <FormLabel>{t('languageManagement.languageCode')}</FormLabel>
        <Controller
          name="code"
          control={control}
          rules={validationRules.code}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={t('languageManagement.codePlaceholder')}
              focusBorderColor={getErrorBorderColor(Boolean(errors.code))}
              maxLength={2}
              style={{ textTransform: 'uppercase' }}
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
            />
          )}
        />
        <FormErrorMessage>{errors.code?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={Boolean(errors.name)} flex="2">
        <FormLabel>{t('languageManagement.languageName')}</FormLabel>
        <Controller
          name="name"
          control={control}
          rules={validationRules.name}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={t('languageManagement.namePlaceholder')}
              focusBorderColor={getErrorBorderColor(Boolean(errors.name))}
            />
          )}
        />
        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
      </FormControl>
    </HStack>
  );

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Box maxW="100%" dir={direction} w="100%">
            <Flex my={6} dir={direction}>
              <Box flex="1">
                <Heading as="h4" size="md">
                  {t('languageManagement.pageTitle')}
                </Heading>
              </Box>
              <Spacer />
            </Flex>

            {alert && (
              <Alert status={alert.status} my={4} dir={direction}>
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

            {addSuccessMessage && (
              <Alert status="success" my={4} dir={direction}>
                <AlertIcon />
                {addSuccessMessage}
                <CloseButton
                  position="absolute"
                  right="8px"
                  top="8px"
                  onClick={() => setAddSuccessMessage(null)}
                />
              </Alert>
            )}
            <Card mb={6} bg={cardBg}>
              <CardBody>
                <Heading as="h5" size="sm" mb={4}>
                  {t('languageManagement.addLanguageTitle')}
                </Heading>

                <form
                  onSubmit={handleSubmit(onAddSubmit)}
                  noValidate
                  autoComplete="off"
                >
                  <VStack spacing={4} align="stretch">
                    {isMobile ? renderFormControls() : renderDesktopForm()}
                    <HStack
                      spacing={3}
                      justify={isMobile ? 'stretch' : 'flex-start'}
                    >
                      <Button
                        leftIcon={<AddIcon />}
                        colorScheme="blue"
                        type="submit"
                        isLoading={isSubmitting}
                        isDisabled={
                          isSubmitting ||
                          (Object.keys(errors).length > 0 && isSubmitted)
                        }
                        flex={isMobile ? '1' : 'none'}
                        size="sm"
                      >
                        {isMobile
                          ? t('languageManagement.addLanguageMobile')
                          : t('languageManagement.addLanguage')}
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={handleResetForm}
                        isDisabled={isSubmitting}
                        flex={isMobile ? '1' : 'none'}
                        size="sm"
                      >
                        {t('languageManagement.reset')}
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              </CardBody>
            </Card>

            {/* Languages List */}
            <Box mb={isMobile ? 4 : 20}>
              <Heading as="h5" size="sm" mb={4}>
                {t('languageManagement.languagesList')}
              </Heading>

              <Box
                ref={tableBoxRef}
                overflowX="auto"
                overflowY="auto"
                maxHeight={height}
                style={{ border: `1px solid ${colorBorder}` }}
              >
                <TableContainer overflowX="unset" overflowY="unset">
                  <Table
                    key={tableKey}
                    variant="simple"
                    border="1px"
                    borderColor={colorBorder}
                    size="sm"
                    fontSize="sm"
                  >
                    {renderTableHeader()}
                    <Tbody>
                      {languageList.length === 0
                        ? renderEmptyState()
                        : languageList.map((language, index) =>
                            isMobile
                              ? renderMobileRow(language, index)
                              : renderDesktopRow(language, index)
                          )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Box>

          {languageList.length > 0 && (
            <Flex
              justifyContent="center"
              alignItems="center"
              position={isMobile ? 'relative' : 'fixed'}
              bottom="0"
              left="0"
              right="0"
            >
              <Pagination
                metadata={paginationMetadata}
                onPageChange={handlePageChange}
              />
            </Flex>
          )}
        </>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onConfirm={handleDeleteClick}
        entityName={'language'}
        isArabic={isArabic}
      />
    </>
  );
};

export default LanguageManagement;
