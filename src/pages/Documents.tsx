import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
  Divider,
  Heading,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import useErrorHandler from '../hooks/useErrorHandler';
import useLoader from '../hooks/useLoader';

import { templateService } from '../services/templateService';
import type { Template, GroupedTemplates } from '../types/Template';

import DocumentCard from '../components/DocumentCard';

const DocumentsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { alert, setAlert, handleError } = useErrorHandler(t);
  const { Loader, isLoading, setIsLoading } = useLoader();

  const [groupedTemplates, setGroupedTemplates] = useState<GroupedTemplates>(
    {}
  );

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const fetchTemplates = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { data } = await templateService.getAll(false, 1, null);
      const groupedTemplates = templateService.groupByLanguage(data);

      const sortedLanguagesByName =
        templateService.sortByLanguages(groupedTemplates);

      setGroupedTemplates(sortedLanguagesByName);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();

    return () => {
      // Cleanup logic here
      setGroupedTemplates({});
      setAlert(null);
    };
  }, []);

  return (
    <Box maxW="100%" w="100%" dir={dir} pt={4}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {alert && (
            <Alert status={alert.status} my={4}>
              <AlertIcon />
              <AlertTitle>{alert.message}</AlertTitle>
              <CloseButton
                position="absolute"
                insetInlineEnd="8px"
                top="8px"
                onClick={() => setAlert(null)}
              />
            </Alert>
          )}

          {Object.keys(groupedTemplates).length === 0 ? (
            <Box>
              <Alert status="info" textAlign="center" justifyContent="center">
                <AlertIcon />
                <AlertTitle> {t('document.404')} </AlertTitle>
              </Alert>
            </Box>
          ) : (
            <Box>
              <Accordion
                allowMultiple
                defaultIndex={Object.keys(groupedTemplates).map(
                  (_, index) => index
                )}
              >
                {Object.entries(groupedTemplates).map(
                  ([language, templates]) => (
                    <AccordionItem key={language}>
                      <AccordionButton borderBottomWidth="1px">
                        <Box flex="1" textAlign="center">
                          <Heading as="h2" size="lg">
                            {templates.length} {language} {t('document.name')}
                          </Heading>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>

                      <AccordionPanel pb={4}>
                        <SimpleGrid
                          columns={{ base: 1, md: 3 }}
                          spacing={8}
                          justifyItems="center"
                        >
                          {templates.map((template: Template) => (
                            <Box key={template.id} mx="auto" my={4}>
                              <DocumentCard
                                documentName={template.name}
                                documentFileName={template.fileName}
                                templateId={template.id}
                                link={`/app/configure-template/${template.id}`}
                              />
                            </Box>
                          ))}
                        </SimpleGrid>
                      </AccordionPanel>
                    </AccordionItem>
                  )
                )}
              </Accordion>

              <Divider />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default DocumentsPage;
