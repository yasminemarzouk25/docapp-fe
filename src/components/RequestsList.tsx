import React, { useState, useEffect, type ReactElement } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Badge,
  Flex,
  CloseButton,
  AlertTitle,
  ButtonGroup,
  Button,
  Icon,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

import AddRequestModal from './AddRequestModal';
import Pagination from './Pagination';
import WorkflowBox from './WorkflowBox';
import ValidateRequestModal from './ValidateRequestModal';
import EditRequestModal from './modals/EditRequest';
import AssignApproverModal from './AssignApproverModal';
import UploadSignedPdfModal from './UploadSignedPdfModal';
import UploadDechargePdfModal from './request/UploadDechargePdfModal';
import { getPriorityConfig } from './PrioritySelect';
import ConfirmModal from './ConfirmModal';

import useErrorHandler from '../hooks/useErrorHandler';
import useLoader from '../hooks/useLoader';
import usePagination, { initialPaginationMeta } from '../hooks/usePagination';
import {
  type PriorityLevel,
  priorityLabels,
  Status,
  type RequestResponse
} from '../types/Request';
import { type ConnectedUser } from '../types/User';
import { BackendStep } from '../types/Workflow';
import { requestService } from '../services/requestService';

interface RequestsListProps {
  title: string;
  fetchRequests: (
    _paginate: boolean,
    _page: number,
    _limit: number | null
  ) => Promise<{
    data: RequestResponse[];
    [key: string]: any;
  }>;
  enableAddButton?: boolean;
  enableEditButton?: boolean;
  enableGeneratePdfButton?: boolean;
  enableAssignButton?: boolean;
  enableValidateButton?: boolean;
  enableDownloadButton?: boolean;
  enableUploadButton?: boolean;
  enableUploadDechargeButton?: boolean;
}

// eslint-disable-next-line complexity
const RequestsList: React.FC<RequestsListProps> = ({
  title,
  fetchRequests,
  enableAddButton = false,
  enableEditButton = false,
  enableGeneratePdfButton = false,
  enableAssignButton = false,
  enableValidateButton = false,
  enableDownloadButton = false,
  enableUploadButton = false,
  enableUploadDechargeButton = false
}) => {
  const [selectedRequest, setSelectedRequest] =
    useState<RequestResponse | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const editRequestId = queryParams.get('editRequestId');
  const reviewRequestId = queryParams.get('reviewRequestId');
  const rowsPerPage = 10;

  const [currentRequests, setCurrentRequests] = useState<
    RequestResponse[] | []
  >([]);
  const [createdForUser, setCreatedForUser] = useState<ConnectedUser | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { paginationMetadata, setPaginationMetaData } =
    usePagination(rowsPerPage);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const loaderHeight = isMobile ? '20vh' : '60vh';
  const { Loader, isLoading, setIsLoading } = useLoader({
    height: loaderHeight
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenValidateModal,
    onOpen: openValidateModal,
    onClose: onCloseValidateModal
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: editOnOpen,
    onClose: editOnClose
  } = useDisclosure();

  const {
    isOpen: isAssignOpen,
    onOpen: assignOnOpen,
    onClose: assignOnClose
  } = useDisclosure();

  const {
    isOpen: isUploadOpen,
    onOpen: uploadOnOpen,
    onClose: uploadOnClose
  } = useDisclosure();

  const {
    isOpen: isUploadDechargeOpen,
    onOpen: uploadDechargeOnOpen,
    onClose: uploadDechargeOnClose
  } = useDisclosure();

  const {
    isOpen: isDownloadPdfOpen,
    onOpen: downloadPdfOnOpen,
    onClose: downloadPdfOnClose
  } = useDisclosure();

  const { t, i18n } = useTranslation();
  const { alert, setAlert, handleError } = useErrorHandler(t);

  interface DecodedToken {
    id: string;
    fullname: string;
  }
  const token = localStorage.getItem('access_token');

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

  const showErrorAndRedirect = (errorMessage: string) => {
    setAlert({
      status: 'error',
      message: errorMessage
    });
    navigate(
      {
        pathname: location.pathname,
        search: queryParams.toString()
      },
      { replace: true }
    );
  };

  const openValidate = () => {
    editOnClose();
    if (selectedRequest) {
      queryParams.set('reviewRequestId', selectedRequest.id);
      navigate(
        {
          pathname: location.pathname,
          search: queryParams.toString()
        },
        { replace: true }
      );
      openValidateModal();
    }
  };

  const openEdit = () => {
    if (selectedRequest) {
      queryParams.set('editRequestId', selectedRequest.id);
      navigate(
        {
          pathname: location.pathname,
          search: queryParams.toString()
        },
        { replace: true }
      );
      editOnOpen();
    }
  };

  const fetchRequestsData = async (
    paginate: boolean,
    page: number,
    limit: number | null
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetchRequests(paginate, page, limit);

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
    fetchRequestsData(true, page, rowsPerPage);
  };

  const handleRowClick = (request: RequestResponse) => {
    if (selectedRequest && selectedRequest.id === request.id) {
      setSelectedRequest(null);
    } else {
      setSelectedRequest(request);
    }
  };

  const getStatusBadge = (status: string): ReactElement => {
    switch (status) {
      case 'Approved':
        return <Badge colorScheme="green">Approved</Badge>;
      case 'Rejected':
        return <Badge colorScheme="red">Rejected</Badge>;
      default:
        return <Badge colorScheme="yellow">Pending</Badge>;
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

  const handleOpenAddRequest = () => {
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      setCreatedForUser(decoded);
    }
    onOpen();
  };

  const getWorkFlowBoxStyles = (isMobile: boolean | undefined) => ({
    height: isMobile ? '120px' : '90px',
    px: isMobile ? 0 : 2,
    py: isMobile ? 4 : 0
  });

  const refreshRequestsList = (): void => {
    fetchRequestsData(true, paginationMetadata.currentPage, rowsPerPage);
  };

  // ? Function to update a value in a specific request in the list/selected request
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

        // * Update its value in the Request list to isDownloaded = true
        updateRequestInList(selectedRequest.id, { isDownloaded: true });
      } catch (error) {
        handleError(error);
      } finally {
        setIsSubmitting(false);
        downloadPdfOnClose();
      }
    }
  };

  const clearEditRequestIdParams = () => {
    editOnClose();
    queryParams.delete('editRequestId');
    navigate(
      {
        pathname: location.pathname,
        search: queryParams.toString()
      },
      { replace: true }
    );
  };
  const clearReviewRequestIdParams = () => {
    onCloseValidateModal();
    queryParams.delete('reviewRequestId');
    navigate(
      {
        pathname: location.pathname,
        search: queryParams.toString()
      },
      { replace: true }
    );
  };

  const handleEditRequest = (
    editRequestId: string,
    requests: RequestResponse[]
  ) => {
    onCloseValidateModal();
    const matchingRequest = requests.find((req) => req.id === editRequestId);

    if (matchingRequest) {
      setAlert(null);
      setSelectedRequest(matchingRequest);
      editOnOpen();
    } else {
      clearEditRequestIdParams();
      setAlert({
        status: 'error',
        message: 'The request specified in the link does not exist.'
      });
    }
  };

  const handleReviewRequest = (
    requestId: string,
    requests: RequestResponse[]
  ) => {
    editOnClose();
    const matchingRequest = requests.find((req) => req.id === requestId);

    if (matchingRequest) {
      setAlert(null);
      setSelectedRequest(matchingRequest);
      openValidate();
    } else {
      clearReviewRequestIdParams();
      setAlert({
        status: 'error',
        message: 'The request specified in the link does not exist.'
      });
    }
  };

  // Set browser tab title
  useEffect(() => {
    document.title = 'Doc App - ' + title;
  }, [title]);

  // Fetch requests on mount
  useEffect(() => {
    fetchRequestsData(true, 1, rowsPerPage);

    return () => {
      setCurrentRequests([]);
      setPaginationMetaData(initialPaginationMeta);
      setFormAlert(null);
      setIsLoading(false);
    };
  }, []);

  // Handle edit/review modal opening
  useEffect(() => {
    const hasEdit = Number(queryParams.has('editRequestId'));
    const hasReview = Number(queryParams.has('reviewRequestId'));

    if (hasEdit + hasReview > 1) {
      editOnClose();
      assignOnClose();
      onCloseValidateModal();

      queryParams.delete('editRequestId');
      queryParams.delete('reviewRequestId');
      showErrorAndRedirect('Only one request parameter can be used at a time.');

      return;
    }
    if (editRequestId && currentRequests.length > 0) {
      handleEditRequest(editRequestId, currentRequests);
    }
    if (reviewRequestId && currentRequests.length > 0) {
      handleReviewRequest(reviewRequestId, currentRequests);
    }
  }, [currentRequests, editRequestId, reviewRequestId]);

  const showEditBtn =
    enableEditButton &&
    selectedRequest &&
    selectedRequest.workflowStep === BackendStep._CREATED;

  const showGeneratePdfBtn =
    enableGeneratePdfButton &&
    selectedRequest &&
    selectedRequest.workflowStep === BackendStep._CREATED;

  // Assign button only for employee requestable documents (requires review)
  const showAssignBtn =
    enableAssignButton &&
    selectedRequest &&
    selectedRequest.workflowStep === BackendStep._GENERATED &&
    selectedRequest.status === Status._PENDING &&
    selectedRequest.documentApprover === null;

  const showValidateBtn =
    enableValidateButton &&
    selectedRequest &&
    selectedRequest.workflowStep === BackendStep._ASSIGNED_TO_REVIEWER;

  // Enable at REVIEWED step with APPROVED status
  const showDownloadBtn =
    enableDownloadButton &&
    selectedRequest &&
    selectedRequest.isDownloaded === false &&
    selectedRequest.status === Status._APPROVED &&
    selectedRequest.workflowStep === BackendStep._REVIEWED;

  // Enable at REVIEWED step with APPROVED status after download
  const showUploadBtn =
    enableUploadButton &&
    selectedRequest &&
    selectedRequest.isDownloaded === true &&
    selectedRequest.isUploaded === false &&
    selectedRequest.status === Status._APPROVED &&
    selectedRequest.workflowStep === BackendStep._REVIEWED;

  const showUploadDechargeBtn =
    enableUploadDechargeButton &&
    selectedRequest &&
    selectedRequest.workflowStep === BackendStep._SIGNED;

  return (
    <>
      <Box ml={isMobile ? 0 : '-25px'} mt="10px" mb={4}>
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
          justifyContent="flex-end"
        >
          {isMobile ? (
            <Flex gap={2} mt={4} width="100%">
              <ButtonGroup>
                {enableAddButton && (
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    onClick={handleOpenAddRequest}
                    width="100%"
                    isDisabled={isLoading}
                  >
                    {t('addRequest.requestTitle')}
                  </Button>
                )}

                {showEditBtn && (
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    onClick={openEdit}
                    width="100%"
                    isDisabled={isLoading}
                  >
                    {t('addRequest.editRequestBtn')}
                  </Button>
                )}

                {showGeneratePdfBtn && (
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

                {showAssignBtn && (
                  <Button
                    colorScheme="orange"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    onClick={assignOnOpen}
                    width="100%"
                    isDisabled={isLoading}
                  >
                    {t('assignRequest.assignModalBtn')}
                  </Button>
                )}

                {showValidateBtn && (
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    width="100%"
                    onClick={openValidate}
                  >
                    {t('openValidateModal.btn')}
                  </Button>
                )}

                {showDownloadBtn && (
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
                {showUploadBtn && (
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
                {showUploadDechargeBtn && (
                  <Button
                    colorScheme="cyan"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    width="100%"
                    onClick={uploadDechargeOnOpen}
                    isDisabled={isLoading}
                  >
                    {t('uploadDechargePdf.uploadModalBtn')}
                  </Button>
                )}
              </ButtonGroup>
            </Flex>
          ) : (
            <Flex gap={2}>
              <ButtonGroup>
                {enableAddButton && (
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    onClick={handleOpenAddRequest}
                    isDisabled={isLoading}
                  >
                    {t('addRequest.requestTitle')}
                  </Button>
                )}

                {showEditBtn && (
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    onClick={openEdit}
                    isDisabled={isLoading}
                  >
                    {t('addRequest.editRequestBtn')}
                  </Button>
                )}

                {showGeneratePdfBtn && (
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

                {showAssignBtn && (
                  <Button
                    colorScheme="orange"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    onClick={assignOnOpen}
                    isDisabled={isLoading}
                  >
                    {t('assignRequest.assignModalBtn')}
                  </Button>
                )}

                {showValidateBtn && (
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    onClick={openValidate}
                  >
                    {t('openValidateModal.btn')}
                  </Button>
                )}

                {showDownloadBtn && (
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
                {showUploadBtn && (
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
                {showUploadDechargeBtn && (
                  <Button
                    colorScheme="cyan"
                    variant="outline"
                    spinnerPlacement="start"
                    size="sm"
                    onClick={uploadDechargeOnOpen}
                    isDisabled={isLoading}
                  >
                    {t('uploadDechargePdf.uploadModalBtn')}
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
                      <Th w="150px" maxW="150px">
                        <InfoIcon mx={1} />- {t('requestList.document')}
                      </Th>
                      <Th w="120px" maxW="120px">
                        <InfoIcon mx={1} />- {t('requestList.createdBy')}
                      </Th>
                      <Th w="120px" maxW="120px">
                        <InfoIcon mx={1} />- {t('requestList.createdFor')}
                      </Th>
                      <Th w="120px" maxW="120px">
                        <InfoIcon mx={1} />- {t('requestList.documentApprover')}
                      </Th>
                      <Th w="110px" maxW="110px">
                        <InfoIcon mx={1} />- {t('requestList.priority')}
                      </Th>
                      <Th w="100px" maxW="100px">
                        <InfoIcon mx={1} />- {t('requestList.status')}
                      </Th>
                    </Tr>
                  )}
                </Thead>

                <Tbody>
                  {currentRequests.length === 0 ? (
                    <Tr>
                      <Td colSpan={7}>
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

                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              <Text as="span" fontWeight="bold">
                                {t('requestList.documentApprover')} :
                              </Text>
                              {doc.documentApprover
                                ? doc.documentApprover.name
                                : '-'}
                            </Box>

                            {getMobileBoxContent(
                              t('requestList.priority'),
                              getPriorityDisplay(doc.priority)
                            )}

                            {getMobileBoxContent(
                              t('requestList.status'),
                              getStatusBadge(doc.status)
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
                          <Td w="150px" maxW="150px">
                            {getTooltip(
                              doc.template.name,
                              doc.template.name,
                              '150px'
                            )}
                          </Td>

                          <Td w="120px" maxW="120px">
                            {getTooltip(
                              doc.createdBy.name,
                              doc.createdBy.name,
                              '120px'
                            )}
                          </Td>

                          <Td w="120px" maxW="120px">
                            {getTooltip(
                              doc.createdFor.name,
                              doc.createdFor.name,
                              '120px'
                            )}
                          </Td>

                          <Td w="120px" maxW="120px">
                            {doc.documentApprover ? (
                              <>
                                {getTooltip(
                                  doc.documentApprover.name!,
                                  doc.documentApprover.name!,
                                  '120px'
                                )}
                              </>
                            ) : (
                              <Box
                                maxW="120px"
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                              >
                                -
                              </Box>
                            )}
                          </Td>

                          <Td w="110px" maxW="110px">
                            {getPriorityDisplay(doc.priority)}
                          </Td>

                          <Td w="100px" maxW="100px">
                            <Box
                              maxW="100px"
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              {getStatusBadge(doc.status)}
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

      {createdForUser && (
        <AddRequestModal
          isOpen={isOpen}
          onClose={onClose}
          setTableAlert={setAlert}
          formAlert={formAlert}
          setFormAlert={setFormAlert}
          handleFormError={handleFormError}
          createdForUser={createdForUser}
          refreshRequestsList={refreshRequestsList}
        />
      )}

      {selectedRequest && isOpenValidateModal && (
        <ValidateRequestModal
          isOpen={isOpenValidateModal}
          onClose={clearReviewRequestIdParams}
          setTableAlert={setAlert}
          id={selectedRequest.id}
          formAlert={formAlert}
          handleFormError={handleFormError}
          handleTableError={handleError}
          refreshRequestsList={refreshRequestsList}
          setSelectedRequest={setSelectedRequest}
          request={selectedRequest}
        />
      )}

      {selectedRequest && isEditOpen && (
        <EditRequestModal
          isOpen={isEditOpen}
          onClose={clearEditRequestIdParams}
          setTableAlert={setAlert}
          formAlert={formAlert}
          setFormAlert={setFormAlert}
          setSelectedRequest={setSelectedRequest}
          handleFormError={handleFormError}
          selectedRequest={selectedRequest}
          refreshRequestsList={refreshRequestsList}
        />
      )}

      {selectedRequest && isAssignOpen && (
        <AssignApproverModal
          isOpen={isAssignOpen}
          onClose={assignOnClose}
          setTableAlert={setAlert}
          formAlert={formAlert}
          setFormAlert={setFormAlert}
          handleFormError={handleFormError}
          selectedRequest={selectedRequest}
          setSelectedRequest={setSelectedRequest}
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

      {selectedRequest && isUploadDechargeOpen && (
        <UploadDechargePdfModal
          selectedRequestId={selectedRequest.id}
          updateStates={updateRequestInList}
          isOpen={isUploadDechargeOpen}
          onClose={uploadDechargeOnClose}
          setTableAlert={setAlert}
          formAlert={formAlert}
          setFormAlert={setFormAlert}
          handleFormError={handleFormError}
        />
      )}
    </>
  );
};

export default RequestsList;
