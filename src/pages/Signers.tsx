import React, { useEffect, useState, useRef, type ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Tooltip,
  Alert,
  AlertIcon,
  Badge,
  Flex,
  CloseButton,
  AlertTitle,
  useDisclosure
} from '@chakra-ui/react';
import {
  EmailIcon,
  InfoIcon,
  SettingsIcon,
  AttachmentIcon
} from '@chakra-ui/icons';

import { userService } from '../services/userService';
import { UserRole, type User } from '../types/User';
import { displayFieldOrDash } from '../utils';

import useErrorHandler from '../hooks/useErrorHandler';
import useLoader from '../hooks/useLoader';

import AuthenticatedImage from '../components/AuthenticatedImage';
import UploadSignature from '../components/modals/UploadSignature';

const SignersPage: React.FC = (): ReactElement => {
  const location = useLocation();
  const addedUserMessage = location.state?.message || null;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { alert, setAlert, handleError } = useErrorHandler(t);

  const [bodyHeight, setBodyHeight] = useState(window.innerHeight);
  const hasAlert = alert && alert.message.length > 0;

  // Add resize event listener
  useEffect(() => {
    const handleResize = () => {
      setBodyHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate height based on the current bodyHeight state
  let heightPair;
  if (bodyHeight > 780) {
    heightPair = ['70vh', '75vh'];
  } else if (bodyHeight > 525) {
    heightPair = ['55vh', '65vh'];
  } else {
    heightPair = ['30vh', '35vh'];
  }

  const height = hasAlert ? heightPair[0] : heightPair[1];
  const { Loader, isLoading, setIsLoading } = useLoader({ height });

  // Calculate responsive padding based on screen height
  let cellPadding;
  let headerPadding;
  if (bodyHeight > 900) {
    // Large height screens
    cellPadding = { py: 4, px: 2 };
    headerPadding = { py: 5, px: 2 };
  } else if (bodyHeight > 780) {
    // Medium-large height screens
    cellPadding = { py: 3, px: 2 };
    headerPadding = { py: 4, px: 2 };
  } else if (bodyHeight > 525) {
    // Medium height screens
    cellPadding = { py: 2, px: 2 };
    headerPadding = { py: 3, px: 2 };
  } else {
    // Small height screens
    cellPadding = { py: 1, px: 2 };
    headerPadding = { py: 3, px: 2 };
  }

  const isMobile = useBreakpointValue({ base: true, md: false });

  const colorBorder = useColorModeValue('gray.100', 'gray.700');
  const actionsBtnColor = useColorModeValue('gray.300', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.900');
  const theadColor = useColorModeValue('gray.200', 'gray.900');

  const isArabic = i18n.language === 'ar';
  const direction = isArabic ? 'rtl' : 'ltr';

  const {
    alert: modalAlert,
    setAlert: setModalAlert,
    handleError: handleModalError
  } = useErrorHandler(t);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [signers, setSigners] = useState<User[]>([]);

  const fetchSigners = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await userService.getByRole(UserRole._Signer);
      setSigners(response);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSigners();

    return () => {
      // Cleanup logic here
      setSigners([]);
      setAlert(null);
    };
  }, []);

  // Add a key to force re-render of table rows on scroll
  const [tableKey, setTableKey] = useState(0);
  const tableBoxRef = useRef<HTMLDivElement>(null);

  // Attach scroll event to the table container
  useEffect(() => {
    const handleScroll = () => {
      setTableKey((prev) => prev + 1);
    };
    const ref = tableBoxRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (ref) {
        ref.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const openSignatureModal = (userId: string): void => {
    setSelectedUserId(userId);
    onOpen();
  };

  return (
    <>
      <Box maxW="100%" dir={direction} w="100%">
        <Flex my={6} dir={direction}>
          <Box>
            <Heading as="h4" size="md">
              {t('signersPage.pageTitle')}
            </Heading>
          </Box>
        </Flex>
        {(addedUserMessage || alert) && (
          <Alert status={alert?.status ?? 'success'} my={4}>
            <AlertIcon />
            {addedUserMessage || alert?.message}
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={() => {
                setAlert(null);
                navigate(location.pathname, { state: { message: null } });
              }}
            />
          </Alert>
        )}

        <Box
          ref={tableBoxRef}
          overflowX="auto"
          maxHeight={height}
          style={{ border: `1px solid ${colorBorder}` }}
        >
          {isLoading ? (
            <Loader />
          ) : (
            <TableContainer overflowX="unset" overflowY="unset">
              <Table
                key={tableKey}
                variant="simple"
                border="1px"
                borderColor={colorBorder}
                size="sm"
                fontSize="sm"
              >
                <Thead
                  position="sticky"
                  top={0}
                  zIndex="docked"
                  bg={theadColor}
                >
                  {!isMobile && (
                    <Tr fontSize="xs">
                      <Th
                        w="180px"
                        textAlign="center"
                        fontSize="xs"
                        {...headerPadding}
                      >
                        <InfoIcon mx={1} boxSize={3} />-{' '}
                        {t('signersPage.fullName')}
                      </Th>
                      <Th
                        w="220px"
                        textAlign="center"
                        fontSize="xs"
                        {...headerPadding}
                      >
                        <EmailIcon mx={1} boxSize={3} />-{' '}
                        {t('signersPage.department')}
                      </Th>
                      <Th
                        w="120px"
                        textAlign="center"
                        fontSize="xs"
                        {...headerPadding}
                      >
                        <InfoIcon mx={1} boxSize={3} />-{' '}
                        {t('signersPage.signature')}
                      </Th>
                      <Th
                        w="110px"
                        textAlign="center"
                        fontSize="xs"
                        {...headerPadding}
                      >
                        <SettingsIcon mx={1} boxSize={3} />-{' '}
                        {t('signersPage.actions')}
                      </Th>
                    </Tr>
                  )}
                </Thead>

                <Tbody>
                  {signers.length === 0 ? (
                    <Tr>
                      <Td colSpan={4}>
                        <Alert
                          status="info"
                          textAlign="center"
                          justifyContent="center"
                          dir={direction}
                        >
                          <AlertIcon />
                          <AlertTitle> {t('signersPage.404')} </AlertTitle>
                        </Alert>
                      </Td>
                    </Tr>
                  ) : (
                    signers.map((signer) =>
                      isMobile ? (
                        <Tr
                          key={signer.id}
                          _hover={{
                            bg: hoverBgColor
                          }}
                        >
                          <Td maxW="100px">
                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              <Text as="span" fontWeight="bold">
                                {t('signersPage.fullName')} :
                              </Text>
                              {displayFieldOrDash(signer.firstName)}{' '}
                              {displayFieldOrDash(signer.lastName)}
                            </Box>

                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              mt={1}
                            >
                              <Text as="span" fontWeight="bold">
                                {t('signersPage.department')} :
                              </Text>
                              {displayFieldOrDash(signer.department)}
                            </Box>

                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              mt={1}
                              display="flex"
                              alignItems="center"
                              gap={2}
                            >
                              <Text as="span" fontWeight="bold">
                                {t('signersPage.signature')} :
                              </Text>
                              {signer.signatureUrl ? (
                                <AuthenticatedImage
                                  url={signer.signatureUrl}
                                  alt="signature"
                                  width="110px"
                                  height="40px"
                                />
                              ) : (
                                <Badge colorScheme="red">
                                  {t('signersPage.noSignature')}
                                </Badge>
                              )}
                            </Box>

                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              mt={1}
                            >
                              <Text as="span" fontWeight="bold">
                                {t('signersPage.actions')} :
                              </Text>
                              <IconButton
                                icon={<AttachmentIcon />}
                                backgroundColor={actionsBtnColor}
                                aria-label="upload-signature"
                                size="sm"
                                ml={1}
                                onClick={() => openSignatureModal(signer.id)}
                                title={t('signersPage.uploadSignature')}
                              />
                            </Box>
                          </Td>
                        </Tr>
                      ) : (
                        <Tr
                          key={signer.id}
                          _hover={{
                            bg: hoverBgColor
                          }}
                        >
                          <Td
                            w="180px"
                            textAlign="center"
                            fontSize="xs"
                            {...cellPadding}
                          >
                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              textAlign="center"
                            >
                              <Tooltip
                                label={signer.firstName + ' ' + signer.lastName}
                                display="inline"
                              >
                                <span>
                                  {displayFieldOrDash(signer.firstName)}
                                  {displayFieldOrDash(signer.lastName)}
                                </span>
                              </Tooltip>
                            </Box>
                          </Td>
                          <Td
                            w="220px"
                            textAlign="center"
                            fontSize="xs"
                            {...cellPadding}
                          >
                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              textAlign="center"
                            >
                              <Tooltip
                                label={signer.department}
                                hasArrow
                                display="inline"
                              >
                                <span>
                                  {displayFieldOrDash(signer.department)}
                                </span>
                              </Tooltip>
                            </Box>
                          </Td>

                          <Td
                            w="120px"
                            textAlign="center"
                            fontSize="xs"
                            {...cellPadding}
                          >
                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              textAlign="center"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              height="30px"
                            >
                              {signer.signatureUrl ? (
                                <AuthenticatedImage
                                  url={signer.signatureUrl}
                                  alt="signature"
                                  width="110px"
                                  height="30px"
                                />
                              ) : (
                                <Badge colorScheme="red" fontSize="xs">
                                  {t('signersPage.noSignature')}
                                </Badge>
                              )}
                            </Box>
                          </Td>

                          <Td
                            w="110px"
                            textAlign="center"
                            fontSize="xs"
                            {...cellPadding}
                          >
                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textAlign="center"
                            >
                              <IconButton
                                icon={<AttachmentIcon />}
                                backgroundColor={actionsBtnColor}
                                aria-label="upload-signature"
                                size="xs"
                                ml={1}
                                onClick={() => openSignatureModal(signer.id)}
                                title={t('signersPage.uploadSignature')}
                              />
                            </Box>
                          </Td>
                        </Tr>
                      )
                    )
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
      {selectedUserId && isOpen && (
        <UploadSignature
          signerId={selectedUserId}
          refreshSignersList={fetchSigners}
          isOpen={isOpen}
          onClose={onClose}
          setTableAlert={setAlert}
          modalAlert={modalAlert}
          setModalAlert={setModalAlert}
          handleModalError={handleModalError}
        />
      )}
    </>
  );
};

export default SignersPage;
