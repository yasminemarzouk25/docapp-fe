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
  Button,
  IconButton,
  useBreakpointValue,
  useColorModeValue,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Badge,
  Flex,
  Spacer,
  CloseButton,
  AlertTitle,
  useDisclosure
} from '@chakra-ui/react';
import {
  DeleteIcon,
  EditIcon,
  EmailIcon,
  InfoIcon,
  SettingsIcon,
  UnlockIcon
} from '@chakra-ui/icons';

import Pagination from '../components/Pagination';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { userService } from '../services/userService';
import type { User } from '../types/User';
import { displayFieldOrDash } from '../utils';
import useErrorHandler from '../hooks/useErrorHandler';
import usePagination, { initialPaginationMeta } from '../hooks/usePagination';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import useLoader from '../hooks/useLoader';

const UsersPage: React.FC = (): ReactElement => {
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
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedUser, setSelectedUser] = useState<{
    id: string | null;
    name: string | null;
  }>({
    id: null,
    name: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const rowsPerPage = 15;
  const { paginationMetadata, setPaginationMetaData } =
    usePagination(rowsPerPage);

  const fetchUsers = async (
    paginate: boolean,
    page: number,
    limit: number | null
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await userService.getAll(paginate, page, limit);
      setUsers(response.data);

      // Extract metadata from the response (excluding the data field)
      const { data, ...metadata } = response;
      setPaginationMetaData(metadata);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(true, 1, rowsPerPage);

    return () => {
      // Cleanup logic here
      setUsers([]);
      setPaginationMetaData(initialPaginationMeta);
      setAlert(null);
    };
  }, []);

  const handleSyncButtonClick = async () => {
    setIsSubmitting(true);
    try {
      const syncResult = await userService.sync();

      setAlert({
        message: syncResult.message,
        status: 'success'
      });
      // Refetch the users after syncing and reset the pagination metadata
      fetchUsers(true, 1, rowsPerPage);
      setPaginationMetaData(initialPaginationMeta);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(true, page, rowsPerPage);
  };

  const handleDeleteClick = async () => {
    try {
      setIsSubmitting(true);

      if (selectedUser && selectedUser.id) {
        await userService._delete(selectedUser.id);
        setAlert({
          status: 'success',
          message: t('usersList.deleteSuccess')
        });
        fetchUsers(true, paginationMetadata.currentPage, rowsPerPage);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  // Add a key to force re-render of table rows on scroll
  const [tableKey, setTableKey] = useState(0);
  const tableBoxRef = useRef<HTMLDivElement>(null);
  const direction = isArabic ? 'rtl' : 'ltr';

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

  return (
    <>
      <Box maxW="100%" dir={direction} w="100%">
        <Flex my={6} dir={direction}>
          <Box>
            <Heading as="h4" size="md">
              {t('usersList.pageTitle')}
            </Heading>
          </Box>
          <Spacer />
          <Box mr={4}>
            <Button
              isLoading={isSubmitting}
              colorScheme="teal"
              variant="outline"
              loadingText={t('usersList.loading')}
              spinnerPlacement="start"
              onClick={handleSyncButtonClick}
              size="sm"
            >
              {t('usersList.syncButton')}
            </Button>
          </Box>
          <Box>
            <NavLink to="/add-user">
              <Button
                colorScheme="teal"
                variant="outline"
                spinnerPlacement="start"
                size="sm"
                type="button"
              >
                {t('usersList.addButton')}
              </Button>
            </NavLink>
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
                key={tableKey} // Force re-render on scroll
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
                        w="150px"
                        textAlign="center"
                        fontSize="xs"
                        {...headerPadding}
                      >
                        <InfoIcon mx={1} boxSize={3} />-
                        {t('usersList.fullName')}
                      </Th>
                      <Th
                        w="180px"
                        textAlign="center"
                        fontSize="xs"
                        {...headerPadding}
                      >
                        <EmailIcon mx={1} boxSize={3} />- {t('usersList.email')}
                      </Th>
                      <Th
                        w="110px"
                        textAlign="center"
                        fontSize="xs"
                        {...headerPadding}
                      >
                        <InfoIcon mx={1} boxSize={3} />- {t('usersList.mobile')}
                      </Th>
                      <Th
                        w="140px"
                        textAlign="center"
                        fontSize="xs"
                        {...headerPadding}
                      >
                        <InfoIcon mx={1} boxSize={3} />-
                        {t('usersList.department')}
                      </Th>
                      <Th
                        w="100px"
                        textAlign="center"
                        fontSize="xs"
                        {...headerPadding}
                      >
                        <UnlockIcon mx={1} boxSize={3} />-
                        {t('usersList.status')}
                      </Th>
                      <Th
                        w="100px"
                        textAlign="center"
                        fontSize="xs"
                        {...headerPadding}
                      >
                        <SettingsIcon mx={1} boxSize={3} />-
                        {t('usersList.actions')}
                      </Th>
                    </Tr>
                  )}
                </Thead>

                <Tbody>
                  {users.length === 0 ? (
                    <Tr>
                      <Td colSpan={7}>
                        <Alert
                          status="info"
                          textAlign="center"
                          justifyContent="center"
                          dir={direction}
                        >
                          <AlertIcon />
                          <AlertTitle> {t('usersList.404')} </AlertTitle>
                        </Alert>
                      </Td>
                    </Tr>
                  ) : (
                    users.map((user) =>
                      isMobile ? (
                        <Tr
                          key={user.id}
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
                                {t('usersList.fullName')} :
                              </Text>
                              {displayFieldOrDash(user.firstName)}
                              {displayFieldOrDash(user.lastName)}
                            </Box>

                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              mt={1}
                            >
                              <Text as="span" fontWeight="bold">
                                {t('usersList.email')} :
                              </Text>
                              {displayFieldOrDash(user.email)}
                            </Box>

                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              mt={1}
                            >
                              <Text as="span" fontWeight="bold">
                                {t('usersList.mobile')} :
                              </Text>
                              {displayFieldOrDash(user.mobile)}
                            </Box>

                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              mt={1}
                            >
                              <Text as="span" fontWeight="bold">
                                {t('usersList.department')} :
                              </Text>
                              {displayFieldOrDash(user.department)}
                            </Box>

                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              mt={1}
                            >
                              <Text as="span" fontWeight="bold">
                                {t('usersList.status')} :
                              </Text>
                              {user.isActive ? (
                                <Badge colorScheme="green">
                                  {t('usersList.enabled')}
                                </Badge>
                              ) : (
                                <Badge colorScheme="red">
                                  {t('usersList.disabled')}
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
                                {t('usersList.actions')} :
                              </Text>
                              <IconButton
                                icon={<EditIcon />}
                                backgroundColor={actionsBtnColor}
                                aria-label="edit"
                                size="sm"
                                ml={1}
                                isDisabled={isSubmitting}
                              />
                              <IconButton
                                icon={<DeleteIcon />}
                                backgroundColor={actionsBtnColor}
                                aria-label="Delete"
                                size="sm"
                                ml={1}
                                onClick={() => {
                                  setSelectedUser({
                                    id: user.id,
                                    name: user.displayName
                                  });
                                  onOpen();
                                }}
                                isDisabled={isSubmitting || user.isActive}
                              />
                            </Box>
                          </Td>
                        </Tr>
                      ) : (
                        <Tr
                          key={user.id}
                          _hover={{
                            bg: hoverBgColor
                          }}
                        >
                          <Td
                            w="150px"
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
                              {displayFieldOrDash(user.firstName)}
                              {displayFieldOrDash(user.lastName)}
                            </Box>
                          </Td>
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
                              {displayFieldOrDash(user.email)}
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
                              textOverflow="ellipsis"
                              textAlign="center"
                            >
                              {displayFieldOrDash(user.mobile)}
                            </Box>
                          </Td>

                          <Td
                            w="140px"
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
                              {displayFieldOrDash(user.department)}
                            </Box>
                          </Td>

                          <Td
                            w="100px"
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
                              {user.isActive ? (
                                <Badge colorScheme="green" fontSize="xs">
                                  {t('usersList.enabled')}
                                </Badge>
                              ) : (
                                <Badge colorScheme="red" fontSize="xs">
                                  {t('usersList.disabled')}
                                </Badge>
                              )}
                            </Box>
                          </Td>

                          <Td
                            w="100px"
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
                                icon={<EditIcon />}
                                backgroundColor={actionsBtnColor}
                                aria-label="edit"
                                size="xs"
                                ml={1}
                                isDisabled={isSubmitting}
                              />

                              <IconButton
                                icon={<DeleteIcon />}
                                backgroundColor={actionsBtnColor}
                                aria-label="Delete"
                                size="xs"
                                ml={1}
                                onClick={() => {
                                  setSelectedUser({
                                    id: user.id,
                                    name: user.displayName
                                  });
                                  onOpen();
                                }}
                                isDisabled={isSubmitting || user.isActive}
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

      {users.length > 0 && (
        <Flex justifyContent="center" alignItems="center" mt={4} pb={4}>
          <Pagination
            metadata={paginationMetadata}
            onPageChange={handlePageChange}
          />
        </Flex>
      )}

      <ConfirmDeleteModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleDeleteClick}
        entityName={selectedUser.name ?? 'unknown'}
        isArabic={isArabic}
      />
    </>
  );
};

export default UsersPage;
