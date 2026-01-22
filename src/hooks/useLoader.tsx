import React, { useState, type ReactElement } from 'react';
import { Box, Spinner } from '@chakra-ui/react';

interface UseLoaderReturn {
  Loader: React.FC;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UseLoaderConfig {
  height?: string;
  isLoadingDefault?: boolean;
}

const useLoader = ({
  height = '100vh',
  isLoadingDefault = true
}: UseLoaderConfig = {}): UseLoaderReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(isLoadingDefault);

  const Loader: React.FC = (): ReactElement => (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height={height}
      cursor="wait"
    >
      <Spinner size="lg" />
    </Box>
  );

  return {
    Loader,
    isLoading,
    setIsLoading
  };
};

export default useLoader;
