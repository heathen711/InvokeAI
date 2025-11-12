import { Button, Flex } from '@invoke-ai/ui-library';
import { MobileModelDetails } from 'features/ui/components/mobile/models/MobileModelDetails';
import { MobileModelInstallForm } from 'features/ui/components/mobile/models/MobileModelInstallForm';
import { MobileModelsList } from 'features/ui/components/mobile/models/MobileModelsList';
import { memo, useCallback, useState } from 'react';
import { PiPlusBold } from 'react-icons/pi';

type ModelsView = 'list' | 'details' | 'install';

/**
 * Mobile Models mode - combines all models components
 * Handles navigation between list, details, and install views
 */
export const MobileModelsMode = memo(() => {
  const [currentView, setCurrentView] = useState<ModelsView>('list');
  const [selectedModelKey, setSelectedModelKey] = useState<string | null>(null);

  const handleModelSelect = useCallback((modelKey: string) => {
    setSelectedModelKey(modelKey);
    setCurrentView('details');
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentView('list');
    setSelectedModelKey(null);
  }, []);

  const handleShowInstall = useCallback(() => {
    setCurrentView('install');
  }, []);

  const handleInstallSuccess = useCallback(() => {
    setCurrentView('list');
  }, []);

  if (currentView === 'details' && selectedModelKey) {
    return <MobileModelDetails modelKey={selectedModelKey} onBack={handleBackToList} />;
  }

  if (currentView === 'install') {
    return <MobileModelInstallForm onBack={handleBackToList} onSuccess={handleInstallSuccess} />;
  }

  return (
    <Flex flexDirection="column" width="full" height="full" overflow="hidden">
      {/* Install button */}
      <Flex p={4} borderBottomWidth={1} borderColor="base.800">
        <Button leftIcon={<PiPlusBold />} onClick={handleShowInstall} colorScheme="blue" flex={1} size="lg">
          Install Model
        </Button>
      </Flex>

      {/* Models list */}
      <Flex flex={1} overflow="hidden">
        <MobileModelsList onModelSelect={handleModelSelect} />
      </Flex>
    </Flex>
  );
});

MobileModelsMode.displayName = 'MobileModelsMode';
