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
  Spacer
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, InfoIcon } from '@chakra-ui/icons';

import Pagination from '../components/Pagination';
import AddPlaceholderModal from '../components/AddPlaceholderModal';
import EditPlaceholderModal from '../components/EditPlaceholderModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

import type { Placeholder } from '../types/Placeholder';

import { displayFieldOrDash } from '../utils';
import { placeholderService } from '../services/placeholderService';

import usePagination, { initialPaginationMeta } from '../hooks/usePagination';
import useErrorHandler from '../hooks/useErrorHandler';
import useLoader from '../hooks/useLoader';

const PlaceholderListPage: React.FC = (): ReactElement => {
  const [placeholderList, setPlaceholderList] = useState<Placeholder[]>([]);
  const [selectedPlaceholder, setSelectedPlaceholder] =
    useState<Placeholder | null>(null);
  const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(
    null
  );
  const [selectedPlaceholderId, setSelectedPlaceholderId] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { t, i18n } = useTranslation();
  const { alert, setAlert, handleError } = useErrorHandler(t);

  const [bodyHeight, setBodyHeight] = useState(window.innerHeight);
  const hasAlert = (alert && alert.message.length > 0) || editSuccessMessage;

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
  const rowsPerPage = 15;

  const { paginationMetadata, setPaginationMetaData } =
    usePagination(rowsPerPage);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal
  } = useDisclosure();
  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit
  } = useDisclosure();

  const fetchPlaceholders = async (
    paginate: boolean,
    page: number,
    limit: number | null
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await placeholderService.getAll(paginate, page, limit);
      setPlaceholderList(response.data);

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
    fetchPlaceholders(true, page, rowsPerPage);
  };

  const refreshPlaceholdersList = () => {
    fetchPlaceholders(true, 1, rowsPerPage);
  };

  const handleEditPlaceholder = (placeholder: Placeholder) => {
    setSelectedPlaceholder(placeholder);
    onOpenEdit();
  };

  const handleDeleteClick = async () => {
    try {
      setIsSubmitting(true);
      if (!selectedPlaceholderId) {
        setAlert({
          status: 'error',
          message: t('placeholderList.deleteError')
        });

        return;
      }
      if (selectedPlaceholderId) {
        await placeholderService._delete(selectedPlaceholderId);
        setAlert({
          status: 'success',
          message: t('placeholderList.deleteSuccess')
        });
        fetchPlaceholders(true, 1, rowsPerPage);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
      onCloseDeleteModal();
    }
  };

  useEffect(() => {
    fetchPlaceholders(true, 1, rowsPerPage);

    return () => {
      // Cleanup logic here
      setPlaceholderList([]);
      setPaginationMetaData(initialPaginationMeta);
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

  return (
    <>
      <Box maxW="100%" dir={direction} w="100%">
        <Flex my={6} dir={direction}>
          <Box>
            <Heading as="h4" size="md">
              {t('placeholderList.pageTitle')}
            </Heading>
          </Box>
          <Spacer />
          <Box>
            <Button
              colorScheme="teal"
              variant="outline"
              spinnerPlacement="start"
              size="sm"
              onClick={onOpen}
            >
              {t('addPlaceholder.addButton')}
            </Button>
          </Box>
        </Flex>

        {(alert || editSuccessMessage) && (
          <Alert status={alert?.status ?? 'success'} my={4}>
            <AlertIcon />
            {alert?.message || editSuccessMessage}
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={() => {
                setAlert(null);
                setEditSuccessMessage(null);
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
                        w="200px"
                        textAlign="center"
                        fontSize="xs"
                        {...headerPadding}
                      >
                        <InfoIcon mx={1} boxSize={3} />-
                        {t('placeholderList.name')}
                      </Th>
                      <Th
                        w="250px"
                        textAlign="center"
                        fontSize="xs"
                        {...headerPadding}
                      >
                        <InfoIcon mx={1} boxSize={3} />-
                        {t('placeholderList.labels')}
                      </Th>
                      <Th
                        w="120px"
                        textAlign="center"
                        fontSize="xs"
                        {...headerPadding}
                      >
                        <InfoIcon mx={1} boxSize={3} />-
                        {t('placeholderList.actions')}
                      </Th>
                    </Tr>
                  )}
                </Thead>

                <Tbody>
                  {placeholderList.length === 0 ? (
                    <Tr>
                      <Td colSpan={3}>
                        <Alert
                          status="info"
                          textAlign="center"
                          justifyContent="center"
                          dir={direction}
                        >
                          <AlertIcon />
                          <AlertTitle>{t('placeholderList.404')} </AlertTitle>
                        </Alert>
                      </Td>
                    </Tr>
                  ) : (
                    placeholderList.map((placeholder) =>
                      isMobile ? (
                        <Tr
                          key={placeholder.id}
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
                              <Text as="span" fontWeight="bold" mr={1}>
                                {t('placeholderList.name')} :
                              </Text>
                              {displayFieldOrDash(placeholder.name)}
                            </Box>

                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              mt={1}
                            >
                              <Text as="span" fontWeight="bold" mr={1}>
                                {t('placeholderList.labels')} :
                              </Text>
                              {placeholder.labels.length === 0
                                ? '-'
                                : displayFieldOrDash(
                                    placeholder.labels.join(' , ')
                                  )}
                            </Box>
                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              mt={1}
                            >
                              <Text as="span" fontWeight="bold" mr={1}>
                                {t('placeholderList.actions')} :
                              </Text>
                              <IconButton
                                icon={<EditIcon />}
                                backgroundColor={actionsBtnColor}
                                aria-label="edit"
                                size="sm"
                                ml={1}
                                onClick={() =>
                                  handleEditPlaceholder(placeholder)
                                }
                                isDisabled={isSubmitting}
                              />
                              {placeholder.isDeletable && (
                                <IconButton
                                  icon={<DeleteIcon />}
                                  backgroundColor={actionsBtnColor}
                                  aria-label="Delete"
                                  size="sm"
                                  ml={1}
                                  onClick={() => {
                                    setSelectedPlaceholderId(placeholder.id);
                                    onOpenDeleteModal();
                                  }}
                                  isDisabled={isSubmitting}
                                />
                              )}
                            </Box>
                          </Td>
                        </Tr>
                      ) : (
                        <Tr
                          key={placeholder.id}
                          _hover={{
                            bg: hoverBgColor
                          }}
                        >
                          <Td
                            w="200px"
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
                              {displayFieldOrDash(placeholder.name)}
                            </Box>
                          </Td>
                          <Td
                            w="250px"
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
                              {placeholder.labels.length === 0
                                ? '-'
                                : displayFieldOrDash(
                                    placeholder.labels.join(' , ')
                                  )}
                            </Box>
                          </Td>
                          <Td
                            w="120px"
                            textAlign="center"
                            fontSize="xs"
                            {...cellPadding}
                          >
                            <Flex
                              justifyContent="center"
                              alignItems="center"
                              gap={1}
                              minHeight="24px"
                            >
                              <IconButton
                                icon={<EditIcon />}
                                backgroundColor={actionsBtnColor}
                                aria-label="edit"
                                size="xs"
                                onClick={() =>
                                  handleEditPlaceholder(placeholder)
                                }
                                isDisabled={isSubmitting}
                              />
                              {placeholder.isDeletable ? (
                                <IconButton
                                  icon={<DeleteIcon />}
                                  backgroundColor={actionsBtnColor}
                                  aria-label="Delete"
                                  size="xs"
                                  onClick={() => {
                                    setSelectedPlaceholderId(placeholder.id);
                                    onOpenDeleteModal();
                                  }}
                                  isDisabled={isSubmitting}
                                />
                              ) : (
                                <Box width="32px" />
                              )}
                            </Flex>
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

      {placeholderList.length > 0 && (
        <Flex justifyContent="center" alignItems="center" mt={4} pb={4}>
          <Pagination
            metadata={paginationMetadata}
            onPageChange={handlePageChange}
          />
        </Flex>
      )}

      <AddPlaceholderModal
        isOpen={isOpen}
        onClose={onClose}
        refreshPlaceholdersList={refreshPlaceholdersList}
      />
      {selectedPlaceholder && (
        <EditPlaceholderModal
          isOpen={isOpenEdit}
          onClose={onCloseEdit}
          placeholderId={selectedPlaceholder.id}
          refreshPlaceholdersList={refreshPlaceholdersList}
          setEditSuccessMessage={setEditSuccessMessage}
        />
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onConfirm={handleDeleteClick}
        entityName={'placeholder'}
        isArabic={isArabic}
      />
    </>
  );
};

export default PlaceholderListPage;
