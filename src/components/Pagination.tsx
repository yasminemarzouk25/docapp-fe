import React, { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Tooltip,
  HStack,
  IconButton,
  useColorModeValue,
  useBreakpointValue
} from '@chakra-ui/react';

import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';
import type { PaginationMetadata } from '../types/Pagination';

type PaginationProps = {
  metadata: PaginationMetadata;
  onPageChange: (_page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  metadata,
  onPageChange
}): ReactElement => {
  const { t } = useTranslation();

  const [firstPageIndex, setFirstPageIndex] = useState(1);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const buttonBg = useColorModeValue('white', 'gray.800');

  const {
    totalItems,
    totalPages,
    currentPage,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage
  } = metadata;

  const pagesToShow = isMobile ? 3 : 10;

  const handlePreviousClick = () => {
    if (hasPrevPage) {
      if (firstPageIndex > 1) {
        setFirstPageIndex(firstPageIndex - 1);
      }
      onPageChange(Number(prevPage));
    }
  };

  const handleNextClick = () => {
    if (hasNextPage) {
      if (firstPageIndex <= totalPages - pagesToShow) {
        setFirstPageIndex(firstPageIndex + 1);
      }
      onPageChange(Number(nextPage));
    }
  };

  return (
    <Box bg={buttonBg} mx={4} py="3" width="100%">
      {totalItems === 0 ? (
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            left: '0',
            display: 'none'
          }}
        ></div>
      ) : (
        <HStack spacing="2" justifyContent="center">
          <Tooltip
            label={t('pagination.prevPage')}
            aria-label={t('pagination.prevPage')}
          >
            <IconButton
              icon={<ArrowLeftIcon />}
              aria-label="Previous Page"
              size="sm"
              mr={1}
              onClick={handlePreviousClick}
              isDisabled={hasPrevPage === false}
            />
          </Tooltip>
          {Array.from({ length: pagesToShow }, (_, index) => {
            const pageNumber = firstPageIndex + index;

            return (
              pageNumber <= totalPages && (
                <Button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  isActive={currentPage === pageNumber}
                  size="sm"
                  mx={1}
                >
                  {pageNumber}
                </Button>
              )
            );
          })}

          <Tooltip
            label={t('pagination.nextPage')}
            aria-label={t('pagination.nextPage')}
          >
            <IconButton
              icon={<ArrowRightIcon />}
              aria-label="Next Page"
              size="sm"
              ml={1}
              onClick={handleNextClick}
              isDisabled={hasNextPage === false}
            />
          </Tooltip>
        </HStack>
      )}
    </Box>
  );
};

export default Pagination;
