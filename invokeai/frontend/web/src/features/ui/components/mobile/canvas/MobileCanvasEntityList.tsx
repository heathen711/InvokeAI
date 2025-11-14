import { Flex, Text } from '@invoke-ai/ui-library';
import { createMemoizedSelector } from 'app/store/createMemoizedSelector';
import { useAppSelector } from 'app/store/storeHooks';
import { CanvasEntityStateGate } from 'features/controlLayers/contexts/CanvasEntityStateGate';
import {
  ControlLayerAdapterGate,
  InpaintMaskAdapterGate,
  RasterLayerAdapterGate,
  RegionalGuidanceAdapterGate,
} from 'features/controlLayers/contexts/EntityAdapterContext';
import { EntityIdentifierContext } from 'features/controlLayers/contexts/EntityIdentifierContext';
import { selectCanvasSlice } from 'features/controlLayers/store/selectors';
import type { CanvasEntityIdentifier } from 'features/controlLayers/store/types';
import { getEntityIdentifier } from 'features/controlLayers/store/types';
import { MobileCanvasLayerHeader } from 'features/ui/components/mobile/canvas/MobileCanvasLayerItem';
import type { FC, ReactNode } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Mobile-optimized layer item wrapper
 * Provides context and renders mobile header
 */
const MobileLayerItem = memo(
  ({
    entityIdentifier,
    AdapterGate,
  }: {
    entityIdentifier: CanvasEntityIdentifier;
    AdapterGate: FC<{ children: ReactNode }>;
  }) => {
    return (
      <EntityIdentifierContext.Provider value={entityIdentifier}>
        <AdapterGate>
          <CanvasEntityStateGate entityIdentifier={entityIdentifier}>
            <MobileCanvasLayerHeader />
          </CanvasEntityStateGate>
        </AdapterGate>
      </EntityIdentifierContext.Provider>
    );
  }
);

MobileLayerItem.displayName = 'MobileLayerItem';

/**
 * Mobile Inpaint Mask List
 */
const selectInpaintMaskIds = createMemoizedSelector(selectCanvasSlice, (canvas) => {
  return canvas.inpaintMasks.entities.map(getEntityIdentifier).toReversed();
});

const MobileInpaintMaskList = memo(() => {
  const { t } = useTranslation();
  const entityIdentifiers = useAppSelector(selectInpaintMaskIds);

  if (entityIdentifiers.length === 0) {
    return null;
  }

  return (
    <Flex flexDirection="column" gap={3}>
      <Text fontSize="sm" fontWeight="bold" color="base.400" px={1}>
        {t('controlLayers.inpaintMask_withCount_other')} ({entityIdentifiers.length})
      </Text>
      <Flex flexDirection="column" gap={2}>
        {entityIdentifiers.map((entityIdentifier) => (
          <MobileLayerItem
            key={entityIdentifier.id}
            entityIdentifier={entityIdentifier}
            AdapterGate={InpaintMaskAdapterGate}
          />
        ))}
      </Flex>
    </Flex>
  );
});

MobileInpaintMaskList.displayName = 'MobileInpaintMaskList';

/**
 * Mobile Regional Guidance List
 */
const selectRegionalGuidanceIds = createMemoizedSelector(selectCanvasSlice, (canvas) => {
  return canvas.regionalGuidance.entities.map(getEntityIdentifier).toReversed();
});

const MobileRegionalGuidanceList = memo(() => {
  const { t } = useTranslation();
  const entityIdentifiers = useAppSelector(selectRegionalGuidanceIds);

  if (entityIdentifiers.length === 0) {
    return null;
  }

  return (
    <Flex flexDirection="column" gap={3}>
      <Text fontSize="sm" fontWeight="bold" color="base.400" px={1}>
        {t('controlLayers.regionalGuidance')} ({entityIdentifiers.length})
      </Text>
      <Flex flexDirection="column" gap={2}>
        {entityIdentifiers.map((entityIdentifier) => (
          <MobileLayerItem
            key={entityIdentifier.id}
            entityIdentifier={entityIdentifier}
            AdapterGate={RegionalGuidanceAdapterGate}
          />
        ))}
      </Flex>
    </Flex>
  );
});

MobileRegionalGuidanceList.displayName = 'MobileRegionalGuidanceList';

/**
 * Mobile Control Layer List
 */
const selectControlLayerIds = createMemoizedSelector(selectCanvasSlice, (canvas) => {
  return canvas.controlLayers.entities.map(getEntityIdentifier).toReversed();
});

const MobileControlLayerList = memo(() => {
  const { t } = useTranslation();
  const entityIdentifiers = useAppSelector(selectControlLayerIds);

  if (entityIdentifiers.length === 0) {
    return null;
  }

  return (
    <Flex flexDirection="column" gap={3}>
      <Text fontSize="sm" fontWeight="bold" color="base.400" px={1}>
        {t('controlLayers.controlLayers')} ({entityIdentifiers.length})
      </Text>
      <Flex flexDirection="column" gap={2}>
        {entityIdentifiers.map((entityIdentifier) => (
          <MobileLayerItem
            key={entityIdentifier.id}
            entityIdentifier={entityIdentifier}
            AdapterGate={ControlLayerAdapterGate}
          />
        ))}
      </Flex>
    </Flex>
  );
});

MobileControlLayerList.displayName = 'MobileControlLayerList';

/**
 * Mobile Raster Layer List
 */
const selectRasterLayerIds = createMemoizedSelector(selectCanvasSlice, (canvas) => {
  return canvas.rasterLayers.entities.map(getEntityIdentifier).toReversed();
});

const MobileRasterLayerList = memo(() => {
  const { t } = useTranslation();
  const entityIdentifiers = useAppSelector(selectRasterLayerIds);

  if (entityIdentifiers.length === 0) {
    return null;
  }

  return (
    <Flex flexDirection="column" gap={3}>
      <Text fontSize="sm" fontWeight="bold" color="base.400" px={1}>
        {t('controlLayers.rasterLayer_withCount_other')} ({entityIdentifiers.length})
      </Text>
      <Flex flexDirection="column" gap={2}>
        {entityIdentifiers.map((entityIdentifier) => (
          <MobileLayerItem
            key={entityIdentifier.id}
            entityIdentifier={entityIdentifier}
            AdapterGate={RasterLayerAdapterGate}
          />
        ))}
      </Flex>
    </Flex>
  );
});

MobileRasterLayerList.displayName = 'MobileRasterLayerList';

/**
 * Mobile Canvas Entity List
 * All layer types with mobile-optimized rendering
 */
export const MobileCanvasEntityList = memo(() => {
  return (
    <Flex flexDirection="column" gap={4} w="full">
      <MobileInpaintMaskList />
      <MobileRegionalGuidanceList />
      <MobileControlLayerList />
      <MobileRasterLayerList />
    </Flex>
  );
});

MobileCanvasEntityList.displayName = 'MobileCanvasEntityList';
