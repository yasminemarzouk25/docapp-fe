import React, { useState, useEffect, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Container,
  Text,
  Tooltip,
  Alert,
  AlertIcon,
  Flex,
  CloseButton,
  AlertTitle,
  ButtonGroup,
  Button,
  Icon,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  Heading
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

import AddAdministrativeDocumentModal from '../components/AddAdministrativeDocumentModal';
import Pagination from '../components/Pagination';
import WorkflowBox from '../components/WorkflowBox';
import UploadSignedPdfModal from '../components/UploadSignedPdfModal';
import ConfirmModal from '../components/ConfirmModal';
import { getPriorityConfig } from '../components/PrioritySelect';

import useErrorHandler from '../hooks/useErrorHandler';
import useLoader from '../hooks/useLoader';
import usePagination, { initialPaginationMeta } from '../hooks/usePagination';
import {
  type PriorityLevel,
  priorityLabels,
  type RequestResponse
} from '../types/Request';

import { requestService } from '../services/requestService';
import { BackendStep } from '../types/Workflow';

// eslint-disable-next-line complexity
const AdministrativeDocuments: React.FC = () => {
  const [selectedRequest, setSelectedRequest] =
    useState<RequestResponse | null>(null);

  const navigate = useNavigate();
  const rowsPerPage = 10;

  const [currentRequests, setCurrentRequests] = useState<
    RequestResponse[] | []
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { paginationMetadata, setPaginationMetaData } =
    usePagination(rowsPerPage);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const loaderHeight = isMobile ? '20vh' : '60vh';
  const { Loader, isLoading, setIsLoading } = useLoader({
    height: loaderHeight
  });

  const {
    isOpen: isAdminDocOpen,
    onOpen: adminDocOnOpen,
    onClose: adminDocOnClose
  } = useDisclosure();

  const {
    isOpen: isUploadOpen,
    onOpen: uploadOnOpen,
    onClose: uploadOnClose
  } = useDisclosure();

  const {
    isOpen: isDownloadPdfOpen,
    onOpen: downloadPdfOnOpen,
    onClose: downloadPdfOnClose
  } = useDisclosure();

  const { t, i18n } = useTranslation();
  const { alert, setAlert, handleError } = useErrorHandler(t);

  const {
    alert: formAlert,
    setAlert: setFormAlert,
    handleError: handleFormError
  } = useErrorHandler(t);

  const theadColor = useColorModeValue('gray.200', 'gray.900');
  const colorBorder = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.500', 'white');
  const bgRowHovered = useColorModeValue('blue.100', 'blue.800');
  const bgRowSelected = useColorModeValue('blue.200', 'blue.700');

  const isArabic = i18n.language === 'ar';
  const direction = isArabic ? 'rtl' : 'ltr';

  const fetchRequests = async (
    paginate: boolean,
    page: number,
    limit: number | null
  ): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await requestService.hrAdmin(paginate, page, limit);

      setCurrentRequests(response.data);
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
    fetchRequests(true, page, rowsPerPage);
  };

  const handleRowClick = (request: RequestResponse) => {
    if (selectedRequest && selectedRequest.id === request.id) {
      setSelectedRequest(null);
    } else {
      setSelectedRequest(request);
    }
  };

  const getMobileBoxContent = (
    title: string,
    content: string | ReactElement
  ): ReactElement => (
    <Box whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
      <Text as="span" fontWeight="bold">
        {title}:&nbsp;
      </Text>
      {content}
    </Box>
  );

  const getTooltip = (
    label: string,
    content: string | ReactElement,
    maxW: string
  ): ReactElement => (
    <Tooltip label={label}>
      <Box
        maxW={maxW}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {content}
      </Box>
    </Tooltip>
  );

  const getPriorityDisplay = (priority: number): ReactElement => {
    const config = getPriorityConfig(priority);
    const label = priorityLabels[priority as PriorityLevel];

    if (!config) {
      return <Text>{label}</Text>;
    }

    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Icon as={config.icon} color={config.color} boxSize={4} />
        <Text>{label}</Text>
      </Box>
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleOpenAdminDocument = () => {
    adminDocOnOpen();
  };

  const getWorkFlowBoxStyles = (isMobile: boolean | undefined) => ({
    height: isMobile ? '120px' : '90px',
    px: isMobile ? 0 : 2,
    py: isMobile ? 4 : 0
  });

  const refreshRequestsList = (): void => {
    fetchRequests(true, paginationMetadata.currentPage, rowsPerPage);
  };

  // Function to update a value in a specific request in the list/selected request
  const updateRequestInList = (
    requestId: string,
    updates: Partial<RequestResponse>
  ): void => {
    setCurrentRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId ? { ...request, ...updates } : request
      )
    );

    setSelectedRequest((prevRequest) => {
      if (prevRequest && prevRequest.id === requestId) {
        return { ...prevRequest, ...updates };
      }

      return prevRequest;
    });
  };

  const handleDownloadPDF = () => {
    if (selectedRequest) {
      downloadPdfOnOpen();
    }
  };

  const reDirectToGeneratePdf = () => {
    if (selectedRequest) {
      navigate(
        `/app/generate-document/${selectedRequest.id}/${selectedRequest.template.id}`
      );
    }
  };

  const handleConfirmDownload = async () => {
    if (selectedRequest) {
      try {
        setIsSubmitting(true);
        const blob = await requestService.downloadPDF(selectedRequest.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `request_${selectedRequest.id}.pdf`);
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Update its value in the Request list to isDownloaded = true
        updateRequestInList(selectedRequest.id, { isDownloaded: true });
      } catch (error) {
        handleError(error);
      } finally {
        setIsSubmitting(false);
        downloadPdfOnClose();
      }
    }
  };

  // Fetch requests on mount
  useEffect(() => {
    fetchRequests(true, 1, rowsPerPage);

    return () => {
      setCurrentRequests([]);
      setPaginationMetaData(initialPaginationMeta);
      setFormAlert(null);
      setIsLoading(false);
    };
  }, [rowsPerPage]);

  const enableAddBtn = true;

  const enableGeneratePdfBtn =
    selectedRequest && selectedRequest.workflowStep === BackendStep._CREATED;

  // For HR documents (employeeRequestable === false): enable at GENERATED step
  const enableDownloadBtn =
    selectedRequest &&
    selectedRequest.isDownloaded === false &&
    selectedRequest.workflowStep === BackendStep._GENERATED;

  // For HR documents (employeeRequestable === false): enable at GENERATED step after download
  const enableUploadBtn =
    selectedRequest &&
    selectedRequest.isDownloaded === true &&
    selectedRequest.isUploaded === false &&
    selectedRequest.workflowStep === BackendStep._GENERATED;

  return (
    <>
      <Box ml={isMobile ? 0 : '-25px'} mt="10px">
        <WorkflowBox
          selectedRequest={selectedRequest}
          textColor={textColor}
          isArabic={isArabic}
          isMobile={isMobile}
          getWorkFlowBoxStyles={getWorkFlowBoxStyles}
          t={t}
        />
      </Box>

      <Container maxW="100%" px={0} dir={direction}>
        <Flex
          my={6}
          direction={isMobile ? 'column' : 'row'}
          dir={direction}
          justifyContent={isMobile ? 'flex-start' : 'space-between'}
          alignItems={isMobile ? 'flex-start' : 'center'}
        >
          <Heading size="md" mb={isMobile ? 4 : 0}>
            {t('administrativeDocuments.pageTitle')}
          </Heading>

          {isMobile ? (
            <Flex gap={2} width="100%">
              <ButtonGroup>
                {enableAddBtn && !selectedRequest && (
                  <Button
                    colorScheme="purple"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    onClick={handleOpenAdminDocument}
                    width="100%"
                    isDisabled={isLoading}
                  >
                    {t('addAdministrativeDocument.buttonTitle')}
                  </Button>
                )}

                {enableGeneratePdfBtn && (
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    width="100%"
                    onClick={reDirectToGeneratePdf}
                    isDisabled={isLoading}
                  >
                    {t('generatePDF.btn')}
                  </Button>
                )}

                {enableDownloadBtn && (
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    width="100%"
                    onClick={handleDownloadPDF}
                    isDisabled={isLoading}
                  >
                    {t('downloadPDF.btn')}
                  </Button>
                )}
                {enableUploadBtn && (
                  <Button
                    colorScheme="cyan"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    width="100%"
                    onClick={uploadOnOpen}
                    isDisabled={isLoading}
                  >
                    {t('uploadSignedPdf.uploadModalBtn')}
                  </Button>
                )}
              </ButtonGroup>
            </Flex>
          ) : (
            <Flex gap={2}>
              <ButtonGroup>
                {enableAddBtn && !selectedRequest && (
                  <Button
                    colorScheme="purple"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    onClick={handleOpenAdminDocument}
                    isDisabled={isLoading}
                  >
                    {t('addAdministrativeDocument.buttonTitle')}
                  </Button>
                )}

                {enableGeneratePdfBtn && (
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    onClick={reDirectToGeneratePdf}
                    isDisabled={isLoading}
                  >
                    {t('generatePDF.btn')}
                  </Button>
                )}

                {enableDownloadBtn && (
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    onClick={handleDownloadPDF}
                    isDisabled={isLoading}
                  >
                    {t('downloadPDF.btn')}
                  </Button>
                )}
                {enableUploadBtn && (
                  <Button
                    colorScheme="cyan"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    onClick={uploadOnOpen}
                    isDisabled={isLoading}
                  >
                    {t('uploadSignedPdf.uploadModalBtn')}
                  </Button>
                )}
              </ButtonGroup>
            </Flex>
          )}
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

        <Box
          overflowX="auto"
          maxHeight={alert && alert.message.length > 0 ? '40vh' : '60vh'}
          style={{ border: `1px solid ${colorBorder}` }}
        >
          {isLoading ? (
            <Loader />
          ) : (
            <TableContainer overflowX="unset" overflowY="unset">
              <Table variant="simple" border="1px" borderColor={colorBorder}>
                <Thead
                  position="sticky"
                  top={0}
                  zIndex="docked"
                  bg={theadColor}
                >
                  {!isMobile && (
                    <Tr>
                      <Th w="100px" maxW="100px">
                        <InfoIcon mx={1} />- {t('requestList.requestDate')}
                      </Th>
                      <Th w="250px" maxW="250px">
                        <InfoIcon mx={1} />- {t('requestList.document')}
                      </Th>
                      <Th w="100px" maxW="100px">
                        <InfoIcon mx={1} />- {t('requestList.createdBy')}
                      </Th>
                      <Th w="100px" maxW="100px">
                        <InfoIcon mx={1} />- {t('requestList.createdFor')}
                      </Th>
                      <Th w="100px" maxW="100px">
                        <InfoIcon mx={1} />- {t('requestList.priority')}
                      </Th>
                    </Tr>
                  )}
                </Thead>

                <Tbody>
                  {currentRequests.length === 0 ? (
                    <Tr>
                      <Td colSpan={6}>
                        <Alert
                          status="info"
                          textAlign="center"
                          justifyContent="center"
                          dir={direction}
                        >
                          <AlertIcon />
                          <AlertTitle>
                            {' '}
                            {t('requestList.noDataFound')}
                          </AlertTitle>
                        </Alert>
                      </Td>
                    </Tr>
                  ) : (
                    currentRequests.map((doc) =>
                      isMobile ? (
                        <Tr
                          key={doc.id}
                          _hover={{ bg: bgRowHovered }}
                          bg={
                            selectedRequest && selectedRequest.id === doc.id
                              ? bgRowSelected
                              : 'none'
                          }
                        >
                          <Td maxW="100px" onClick={() => handleRowClick(doc)}>
                            {getMobileBoxContent(
                              t('requestList.requestDate'),
                              formatDate(doc.requestDate)
                            )}

                            {getMobileBoxContent(
                              t('requestList.document'),
                              doc.template.name
                            )}

                            {getMobileBoxContent(
                              t('requestList.createdBy'),
                              doc.createdBy.name
                            )}

                            {getMobileBoxContent(
                              t('requestList.createdFor'),
                              doc.createdFor.name
                            )}

                            {getMobileBoxContent(
                              t('requestList.priority'),
                              getPriorityDisplay(doc.priority)
                            )}
                          </Td>
                        </Tr>
                      ) : (
                        <Tr
                          key={doc.id}
                          _hover={{ bg: bgRowHovered }}
                          bg={
                            selectedRequest && selectedRequest.id === doc.id
                              ? bgRowSelected
                              : 'none'
                          }
                          onClick={() => handleRowClick(doc)}
                        >
                          <Td w="100px" maxW="100px">
                            {getTooltip(
                              formatDate(doc.requestDate),
                              formatDate(doc.requestDate),
                              '100%'
                            )}
                          </Td>

                          <Td w="250px" maxW="250px">
                            {getTooltip(
                              doc.template.name,
                              doc.template.name,
                              '100%'
                            )}
                          </Td>

                          <Td w="100px" maxW="100px">
                            {getTooltip(
                              doc.createdBy.name,
                              doc.createdBy.name,
                              '100%'
                            )}
                          </Td>

                          <Td w="100px" maxW="100px">
                            {getTooltip(
                              doc.createdFor.name,
                              doc.createdFor.name,
                              '100%'
                            )}
                          </Td>

                          <Td w="100px" maxW="100px">
                            {getPriorityDisplay(doc.priority)}
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
      </Container>

      {currentRequests.length > 0 && (
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

      {isAdminDocOpen && (
        <AddAdministrativeDocumentModal
          isOpen={isAdminDocOpen}
          onClose={adminDocOnClose}
          setTableAlert={setAlert}
          formAlert={formAlert}
          setFormAlert={setFormAlert}
          handleFormError={handleFormError}
          refreshRequestsList={refreshRequestsList}
        />
      )}

      {selectedRequest && isUploadOpen && (
        <UploadSignedPdfModal
          selectedRequestId={selectedRequest.id}
          updateStates={updateRequestInList}
          isOpen={isUploadOpen}
          onClose={uploadOnClose}
          setTableAlert={setAlert}
          formAlert={formAlert}
          setFormAlert={setFormAlert}
          handleFormError={handleFormError}
        />
      )}
      {selectedRequest && isDownloadPdfOpen && (
        <ConfirmModal
          isOpen={isDownloadPdfOpen}
          onClose={downloadPdfOnClose}
          onConfirm={handleConfirmDownload}
          title={t('downloadPDF.confirmDownloadTitle')}
          message={t('downloadPDF.confirmDownloadMessage')}
          isArabic={isArabic}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default AdministrativeDocuments;
