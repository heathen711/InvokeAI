// src/features/ui/components/mobile/canvas/MobileCanvasView.tsx
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@invoke-ai/ui-library';
import { useFullscreen } from 'common/hooks/useFullscreen';
import { InvokeCanvasComponent } from 'features/controlLayers/components/InvokeCanvasComponent';
import { useSelectTool, useToolIsSelected } from 'features/controlLayers/components/Tool/hooks';
import { CanvasManagerProviderGate } from 'features/controlLayers/contexts/CanvasManagerProviderGate';
import type { Tool } from 'features/controlLayers/store/types';
import { navigationApi } from 'features/ui/layouts/navigation-api';
import type { ReactElement } from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  PiArrowsInSimpleBold,
  PiArrowsOutSimpleBold,
  PiBoundingBoxBold,
  PiEraserBold,
  PiEyedropperBold,
  PiGearBold,
  PiHandBold,
  PiPaintBrushBold,
  PiRectangleBold,
  PiStackBold,
  PiXBold,
} from 'react-icons/pi';
import { RxMove } from 'react-icons/rx';

import { MobileCanvasGenerateForm } from './MobileCanvasGenerateForm';
import { MobileLayers } from './MobileLayers';

/**
 * Mobile tool button that uses the real canvas tool system
 */
const MobileToolButton = memo(({ tool, icon, label }: { tool: Tool; icon: ReactElement; label: string }) => {
  const isSelected = useToolIsSelected(tool);
  const selectTool = useSelectTool(tool);

  return (
    <IconButton
      aria-label={label}
      icon={icon}
      variant={isSelected ? 'solid' : 'outline'}
      colorScheme={isSelected ? 'invokeBlue' : 'base'}
      onClick={selectTool}
      size="lg"
      minW="60px"
    />
  );
});

MobileToolButton.displayName = 'MobileToolButton';

/**
 * Mobile canvas view with full CanvasManager integration
 * Optimized for one-handed mobile UX with bottom-accessible controls
 */
export const MobileCanvasView = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPanelIndex, setSelectedPanelIndex] = useState<number>(1); // Start on Tools tab
  const [isGenerationDrawerOpen, setIsGenerationDrawerOpen] = useState(false);
  const [isLayersDrawerOpen, setIsLayersDrawerOpen] = useState(false);
  // View mode for staging area
  type ViewMode = 'normal' | 'staging';
  const [viewMode, setViewMode] = useState<ViewMode>('normal');

  // Set active tab to 'canvas' when component mounts to enable canvas generation
  useEffect(() => {
    navigationApi.switchToTab('canvas');
  }, []);

  // Fullscreen support
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  // Handle fullscreen toggle
  const handleFullscreen = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  // Handle tab change - open drawer for Generation and Layers
  const handleTabChange = useCallback((index: number) => {
    if (index === 0) {
      // Generation tab - open drawer instead
      setIsGenerationDrawerOpen(true);
    } else if (index === 2) {
      // Layers tab - open drawer instead
      setIsLayersDrawerOpen(true);
    } else {
      setSelectedPanelIndex(index);
    }
  }, []);

  // Close generation drawer
  const handleCloseGenerationDrawer = useCallback(() => {
    setIsGenerationDrawerOpen(false);
  }, []);

  // Close layers drawer
  const handleCloseLayersDrawer = useCallback(() => {
    setIsLayersDrawerOpen(false);
  }, []);

  // Enter staging mode when generation starts
  const handleGenerationStarted = useCallback(() => {
    setIsGenerationDrawerOpen(false);
    setViewMode('staging');
  }, []);

  // Exit staging mode when user accepts current image
  const handleStagingAccept = useCallback(() => {
    setViewMode('normal');
  }, []);

  // Exit staging mode when user discards all images
  const handleStagingDiscardAll = useCallback(() => {
    setViewMode('normal');
  }, []);

  return (
    <Flex ref={containerRef} flexDirection="column" width="full" height="full" overflow="hidden" position="relative">
      {/* Canvas area */}
      <Flex flex={1} position="relative" overflow="hidden" bg="base.900">
        {/* Real canvas component integrated with CanvasManager */}
        <Box width="full" height="full" position="relative" style={{ touchAction: 'none' }}>
          <InvokeCanvasComponent />
        </Box>

        {/* Minimal floating controls (top-right) - only fullscreen */}
        <Flex position="absolute" top={2} right={2} zIndex={10}>
          <IconButton
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            icon={isFullscreen ? <PiArrowsInSimpleBold /> : <PiArrowsOutSimpleBold />}
            onClick={handleFullscreen}
            variant="solid"
            colorScheme="base"
            size="sm"
            bg="blackAlpha.700"
            _hover={{ bg: 'blackAlpha.800' }}
          />
        </Flex>
      </Flex>

      {/* Bottom tabbed control panel - wrapped in CanvasManagerProviderGate */}
      <CanvasManagerProviderGate>
        <Box bg="base.900" borderTopWidth={1} borderColor="base.800" pb="calc(60px + 0.75rem)">
          <Tabs
            index={selectedPanelIndex}
            onChange={handleTabChange}
            variant="enclosed"
            colorScheme="invokeBlue"
            isFitted
          >
            <TabList px={2} pt={2} gap={1}>
              <Tab fontSize="sm" gap={1} _selected={{ bg: 'invokeBlue.500', color: 'white' }}>
                <PiGearBold /> Generation
              </Tab>
              <Tab fontSize="sm" gap={1} _selected={{ bg: 'invokeBlue.500', color: 'white' }}>
                <PiPaintBrushBold /> Tools
              </Tab>
              <Tab fontSize="sm" gap={1} _selected={{ bg: 'invokeBlue.500', color: 'white' }}>
                <PiStackBold /> Layers
              </Tab>
            </TabList>

            <TabPanels>
              {/* Generation Panel - Placeholder (opens drawer) */}
              <TabPanel p={0} />

              {/* Tools Panel */}
              <TabPanel p={0}>
                <Box maxH="200px" overflowY="auto">
                  <Flex gap={2} px={4} py={3} flexWrap="wrap">
                    <MobileToolButton tool="brush" icon={<PiPaintBrushBold />} label="Brush" />
                    <MobileToolButton tool="eraser" icon={<PiEraserBold />} label="Eraser" />
                    <MobileToolButton tool="rect" icon={<PiRectangleBold />} label="Rectangle" />
                    <MobileToolButton tool="move" icon={<RxMove />} label="Move Layer" />
                    <MobileToolButton tool="view" icon={<PiHandBold />} label="Pan & Zoom" />
                    <MobileToolButton tool="bbox" icon={<PiBoundingBoxBold />} label="Bounding Box" />
                    <MobileToolButton tool="colorPicker" icon={<PiEyedropperBold />} label="Color Picker" />
                  </Flex>
                </Box>
              </TabPanel>

              {/* Layers Panel - Opens full-screen drawer */}
              <TabPanel p={0} />
            </TabPanels>
          </Tabs>
        </Box>
      </CanvasManagerProviderGate>

      {/* Full-screen Generation Drawer */}
      <Drawer isOpen={isGenerationDrawerOpen} onClose={handleCloseGenerationDrawer} placement="bottom" size="full">
        <DrawerOverlay />
        <DrawerContent bg="base.900">
          <DrawerHeader borderBottomWidth={1} borderColor="base.800" display="flex" alignItems="center" gap={2}>
            Generation Settings
            <IconButton
              aria-label="Close generation settings"
              icon={<PiXBold />}
              onClick={handleCloseGenerationDrawer}
              variant="ghost"
              size="sm"
              ms="auto"
            />
          </DrawerHeader>
          <DrawerBody p={0}>
            <MobileCanvasGenerateForm onClose={handleCloseGenerationDrawer} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Full-screen Layers Drawer */}
      <CanvasManagerProviderGate>
        <MobileLayers isOpen={isLayersDrawerOpen} onClose={handleCloseLayersDrawer} />
      </CanvasManagerProviderGate>
    </Flex>
  );
});

MobileCanvasView.displayName = 'MobileCanvasView';
