import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HamburgerIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon
} from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
  useColorModeValue,
  VStack,
  Image
} from '@chakra-ui/react';

import authService from '../services/authService';
import avatarImage from '../assets/avatar.png';
import usFlag from '../assets/flags/us.svg';
import arFlag from '../assets/flags/sa.svg';
import frFlag from '../assets/flags/fr.svg';
import jaFlag from '../assets/flags/jp.svg';

import Logo from './Logo';

interface NavbarProps {
  onMenuClick?: () => void;
}

// Flag component to display SVG flags
const FlagIcon = ({
  src,
  alt,
  size = 20
}: {
  src: string;
  alt: string;
  size?: number;
}) => (
  <Image
    src={src}
    alt={alt}
    width={`${size}px`}
    height={`${size * 0.75}px`}
    display="inline-block"
    verticalAlign="middle"
    borderRadius="2px"
  />
);

const NavLink = ({ children, href }: { children: ReactNode; href: string }) => {
  const hoverBg = useColorModeValue('gray.200', 'gray.700');

  return (
    <Link to={href}>
      <Box
        px={2}
        py={1}
        rounded={'md'}
        _hover={{
          textDecoration: 'none',
          bg: hoverBg
        }}
      >
        {children}
      </Box>
    </Link>
  );
};

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  const navbarBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getLanguageData = (code: string) => {
    const languages: {
      [key: string]: { label: string; shortLabel: string; flag: string };
    } = {
      en: { label: 'English', shortLabel: 'EN', flag: usFlag },
      ar: { label: 'العربية', shortLabel: 'AR', flag: arFlag },
      fr: { label: 'Français', shortLabel: 'FR', flag: frFlag },
      ja: { label: '日本語', shortLabel: 'JA', flag: jaFlag }
    };

    return (
      languages[code] || {
        label: code,
        shortLabel: code.toUpperCase(),
        flag: usFlag
      }
    );
  };

  return (
    <>
      <Box
        bg={navbarBg}
        px={4}
        dir={isArabic ? 'rtl' : 'ltr'}
        position="fixed"
        top={0}
        left={0}
        right={0}
        w="full"
        zIndex={1000}
        borderBottom="1px"
        borderBottomColor={borderColor}
        boxShadow="sm"
      >
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          {/* Mobile hamburger menu */}
          <IconButton
            size={'md'}
            icon={<HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={onMenuClick}
            variant="ghost"
          />

          {/* Logo and Title Section */}
          <Flex
            alignItems={'center'}
            flex={1}
            justify={{ base: 'center', md: 'flex-start' }}
          >
            <Box display={{ base: 'none', sm: 'block' }}>
              <Logo height="43" />
            </Box>
            <NavLink href="/app/">
              <VStack
                align={{ base: 'center', md: 'flex-start' }}
                spacing={0}
                ml={{ base: 0, sm: 2 }}
                textAlign={{ base: 'center', md: 'left' }}
              >
                <Text
                  fontWeight="bold"
                  fontSize={{ base: 'sm', md: 'lg' }}
                  bgGradient={useColorModeValue(
                    'linear(to-r, blue.700, blue.600)',
                    'linear(to-r, blue.400, blue.300)'
                  )}
                  bgClip="text"
                >
                  Doc-App
                </Text>
                <Text
                  fontSize={{ base: 'xs', md: 'sm' }}
                  color="gray.500"
                  maxW={{ base: '120px', sm: '200px', md: '100%' }}
                  isTruncated
                  display={{ base: 'none', sm: 'block' }}
                >
                  AI-Powered HR Document Management System
                </Text>
              </VStack>
            </NavLink>
          </Flex>

          {/* Desktop Navigation */}
          <Flex alignItems={'center'} display={{ base: 'none', md: 'flex' }}>
            {/* Language Selector */}
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                size="sm"
                variant="ghost"
                mr={2}
                minW="auto"
                px={1.5}
              >
                <HStack spacing={1.5}>
                  <FlagIcon
                    src={getLanguageData(i18n.language).flag}
                    alt={`${getLanguageData(i18n.language).label} flag`}
                    size={18}
                  />
                  <Text fontSize="sm">
                    {getLanguageData(i18n.language).label}
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList zIndex="dropdown" minW="140px">
                <MenuItem onClick={() => changeLanguage('en')}>
                  <HStack spacing={2}>
                    <FlagIcon src={usFlag} alt="US flag" size={16} />
                    <Text>English</Text>
                  </HStack>
                </MenuItem>
                <MenuItem onClick={() => changeLanguage('ar')}>
                  <HStack spacing={2}>
                    <FlagIcon src={arFlag} alt="Saudi Arabia flag" size={16} />
                    <Text>العربية</Text>
                  </HStack>
                </MenuItem>
                <MenuItem onClick={() => changeLanguage('fr')}>
                  <HStack spacing={2}>
                    <FlagIcon src={frFlag} alt="France flag" size={16} />
                    <Text>Français</Text>
                  </HStack>
                </MenuItem>
                <MenuItem onClick={() => changeLanguage('ja')}>
                  <HStack spacing={2}>
                    <FlagIcon src={jaFlag} alt="Japan flag" size={16} />
                    <Text>日本語</Text>
                  </HStack>
                </MenuItem>
              </MenuList>
            </Menu>

            {/* Color Mode Toggle */}
            <IconButton
              size={'md'}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              aria-label={'Toggle Color Mode'}
              onClick={toggleColorMode}
              mr={3}
              variant="ghost"
            />

            {/* User Menu */}
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <Avatar size={'sm'} src={avatarImage} />
              </MenuButton>
              <MenuList zIndex="dropdown">
                <MenuItem>Link 1</MenuItem>
                <MenuItem>Link 2</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>{t('navbar.logout')}</MenuItem>
              </MenuList>
            </Menu>
          </Flex>

          {/* Mobile-only icons */}
          <Flex alignItems={'center'} display={{ base: 'flex', md: 'none' }}>
            {/* Language Selector - Mobile (flags only) */}
            <Menu>
              <MenuButton
                as={IconButton}
                icon={
                  <FlagIcon
                    src={getLanguageData(i18n.language).flag}
                    alt={`${getLanguageData(i18n.language).label} flag`}
                    size={20}
                  />
                }
                size="sm"
                variant="ghost"
                aria-label="Select Language"
                mr={2}
              />
              <MenuList
                zIndex="dropdown"
                minW="auto"
                style={{ minWidth: 'calc(100% + 20px)' }}
              >
                <MenuItem onClick={() => changeLanguage('en')}>
                  <HStack spacing={2}>
                    <FlagIcon src={usFlag} alt="US flag" size={16} />
                    <Text fontWeight="medium">EN</Text>
                  </HStack>
                </MenuItem>
                <MenuItem onClick={() => changeLanguage('ar')}>
                  <HStack spacing={2}>
                    <FlagIcon src={arFlag} alt="Saudi Arabia flag" size={16} />
                    <Text fontWeight="medium">AR</Text>
                  </HStack>
                </MenuItem>
                <MenuItem onClick={() => changeLanguage('fr')}>
                  <HStack spacing={2}>
                    <FlagIcon src={frFlag} alt="France flag" size={16} />
                    <Text fontWeight="medium">FR</Text>
                  </HStack>
                </MenuItem>
                <MenuItem onClick={() => changeLanguage('ja')}>
                  <HStack spacing={2}>
                    <FlagIcon src={jaFlag} alt="Japan flag" size={16} />
                    <Text fontWeight="medium">JA</Text>
                  </HStack>
                </MenuItem>
              </MenuList>
            </Menu>

            <IconButton
              size={'sm'}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              aria-label={'Toggle Color Mode'}
              onClick={toggleColorMode}
              mr={2}
              variant="ghost"
            />
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <Avatar size={'sm'} src={avatarImage} />
              </MenuButton>
              <MenuList zIndex="dropdown">
                <MenuItem>Link 1</MenuItem>
                <MenuItem>Link 2</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>{t('navbar.logout')}</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

export default Navbar;
