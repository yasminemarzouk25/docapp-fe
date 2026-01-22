import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import {
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Text,
  IconButton,
  Collapse,
  VStack,
  Tooltip,
  type BoxProps,
  type FlexProps
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  FiHome,
  FiCompass,
  FiSettings,
  FiFileText,
  FiUsers,
  FiDatabase,
  FiFolder,
  FiClipboard,
  FiCheckSquare,
  FiEye
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { FaSignature } from 'react-icons/fa';
import Logo from './Logo';
import { UserRole } from '../types/User';

interface LinkItemProps {
  name: string;
  icon: IconType;
  path: string;
}

interface NavItemProps extends FlexProps {
  icon: IconType;
  path: string;
  isCollapsed: boolean;
  children: ReactNode;
  isActive?: boolean;
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
  onToggleCollapse?: (_collapsed: boolean) => void;
}

interface LinkItemPropsWithRoles extends LinkItemProps {
  roles?: UserRole[];
}

const getLinkItems = (userRoles: UserRole[]): Array<LinkItemPropsWithRoles> => {
  const hasRole = (roles?: UserRole[]) => {
    if (!roles || roles.length === 0) return true;

    return roles.some((role) => userRoles.includes(role));
  };

  const allItems: Array<LinkItemPropsWithRoles> = [
    { name: 'home', icon: FiHome, path: '/app/' },
    // Requests group
    { name: 'myRequests', icon: FiClipboard, path: '/app/requests/my' },
    {
      name: 'assignedRequests',
      icon: FiCheckSquare,
      path: '/app/requests/assigned',
      roles: [UserRole._HR]
    },
    {
      name: 'reviewRequests',
      icon: FiEye,
      path: '/app/requests/review',
      roles: [UserRole._Signer]
    },

    {
      name: 'administrativeDocuments',
      icon: FiFolder,
      path: '/app/administrative-documents',
      roles: [UserRole._HR]
    },

    // Users group
    {
      name: 'users',
      icon: FiUsers,
      path: '/app/users',
      roles: [UserRole._HR]
    },
    {
      name: 'signers',
      icon: FaSignature,
      path: '/app/signers',
      roles: [UserRole._HR]
    },

    // Templates group
    {
      name: 'configureTemplates',
      icon: FiFileText,
      path: '/app/documents',
      roles: [UserRole._HR]
    },
    {
      name: 'addTemplate',
      icon: FiCompass,
      path: '/app/add-template',
      roles: [UserRole._HR]
    },

    // Settings group
    {
      name: 'placeholders',
      icon: FiDatabase,
      path: '/app/placeholders',
      roles: [UserRole._HR]
    },
    {
      name: 'languages',
      icon: FiSettings,
      path: '/app/languages',
      roles: [UserRole._HR]
    }
  ];

  return allItems.filter((item) => hasRole(item.roles));
};

const NavItem = ({
  icon,
  path,
  children,
  isCollapsed,
  isActive,
  ...rest
}: NavItemProps) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeColor = useColorModeValue('blue.600', 'blue.300');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Tooltip label={isCollapsed ? children : ''} placement="right" hasArrow>
      <Flex
        align="center"
        px={isCollapsed ? 2 : 4}
        py={3}
        mx={2}
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? bgColor : 'transparent'}
        color={isActive ? activeColor : textColor}
        fontWeight={isActive ? 'semibold' : 'medium'}
        transition="all 0.2s"
        _hover={{
          bg: isActive ? bgColor : hoverBg,
          color: activeColor
        }}
        onClick={() => navigate(path)}
        justify={isCollapsed ? 'center' : 'flex-start'}
        {...rest}
      >
        {icon && <Icon mr={isCollapsed ? 0 : 4} fontSize="20" as={icon} />}
        <Collapse in={!isCollapsed} animateOpacity>
          <Text fontSize="sm">{children}</Text>
        </Collapse>
      </Flex>
    </Tooltip>
  );
};

const Sidebar = ({ onClose, onToggleCollapse, ...rest }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  interface DecodedToken {
    id: string;
    fullname: string;
    roles: UserRole[];
  }

  const token = localStorage.getItem('access_token');
  let userRoles: UserRole[] = [];

  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      userRoles = decoded.roles || [];
    } catch {
      // Token decode failed - user will see default items only
    }
  }

  const linkItems = getLinkItems(userRoles);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toggleBg = useColorModeValue('white', 'gray.700');
  const toggleHoverBg = useColorModeValue('blue.50', 'blue.900');
  const toggleBorder = useColorModeValue('gray.300', 'gray.600');
  const toggleIconColor = useColorModeValue('blue.600', 'blue.300');
  const toggleActiveBg = useColorModeValue('blue.100', 'blue.800');

  const handleToggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsedState);
    }
  };

  return (
    <Box
      transition="width 0.3s ease"
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      w={{ base: 'full', md: isCollapsed ? 20 : 60 }}
      pos="fixed"
      top={{ base: 0, md: '64px' }}
      left={0}
      bottom={0}
      overflowY="auto"
      zIndex={900}
      {...rest}
    >
      <Flex h="full" direction="column" justify="space-between">
        <Box>
          {/* Mobile Header with Logo and Branding */}
          <Flex
            alignItems="center"
            justifyContent="space-between"
            px={4}
            py={4}
            display={{ base: 'flex', md: 'none' }}
            borderBottom="1px"
            borderBottomColor={borderColor}
          >
            <Flex alignItems="center" gap={2}>
              <Logo height="40" />
              <Box>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  lineHeight="1.2"
                  bgGradient={useColorModeValue(
                    'linear(to-r, blue.700, blue.600)',
                    'linear(to-r, blue.400, blue.300)'
                  )}
                  bgClip="text"
                >
                  Doc-App
                </Text>
                <Text fontSize="xs" color="gray.500" lineHeight="1.2">
                  HR Document System
                </Text>
              </Box>
            </Flex>
            <CloseButton onClick={onClose} />
          </Flex>

          {/* Navigation Items */}
          <VStack spacing={1} align="stretch" mt={{ base: 4, md: 6 }}>
            {linkItems.map((link) => (
              <NavItem
                key={link.name}
                icon={link.icon}
                path={link.path}
                isCollapsed={isCollapsed}
                isActive={location.pathname === link.path}
              >
                {t(`sidebar.${link.name}`, link.name)}
              </NavItem>
            ))}
          </VStack>
        </Box>

        {/* Collapse/Expand Toggle - Desktop Only */}
        <Box
          display={{ base: 'none', md: 'block' }}
          p={4}
          borderTop="1px"
          borderTopColor={borderColor}
        >
          <Flex justify={isCollapsed ? 'center' : 'flex-end'}>
            <Tooltip
              label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              placement="right"
              hasArrow
            >
              <IconButton
                icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                onClick={handleToggleCollapse}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                size="md"
                variant="outline"
                bg={toggleBg}
                borderColor={toggleBorder}
                color={toggleIconColor}
                borderWidth="2px"
                borderRadius="full"
                transition="all 0.2s"
                _hover={{
                  bg: toggleHoverBg,
                  borderColor: toggleIconColor
                }}
                _active={{
                  bg: toggleActiveBg
                }}
              />
            </Tooltip>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default Sidebar;
