import { useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure
} from '@chakra-ui/react';

import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children?: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <Box minH="100vh" bg={useColorModeValue('white', 'gray.800')}>
      {/* Navbar */}
      <Navbar onMenuClick={onOpen} />

      {/* Sidebar for Desktop */}
      <Sidebar
        onClose={() => onClose}
        onToggleCollapse={setIsSidebarCollapsed}
        display={{ base: 'none', md: 'block' }}
      />

      {/* Mobile Drawer */}
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <Sidebar onClose={onClose} />
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box
        ml={{ base: 0, md: isSidebarCollapsed ? 20 : 60 }}
        pt="60px"
        px={{ base: 4, md: 8 }}
        pb={{ base: 4, md: 8 }}
        transition="margin-left 0.3s ease"
      >
        {children || <Outlet />}
      </Box>
    </Box>
  );
};

export default AppLayout;
