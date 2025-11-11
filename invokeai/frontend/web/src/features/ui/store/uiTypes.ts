import { isPlainObject } from 'es-toolkit';
import { z } from 'zod';

const zTabName = z.enum(['generate', 'canvas', 'upscaling', 'workflows', 'models', 'queue']);
export type TabName = z.infer<typeof zTabName>;

// Add after existing TabName type
const zMobileMainTab = z.enum(['create', 'view', 'manage']);
export type MobileMainTab = z.infer<typeof zMobileMainTab>;

const zMobileCreateMode = z.enum(['generate', 'canvas', 'upscaling', 'workflows']);
export type MobileCreateMode = z.infer<typeof zMobileCreateMode>;

const zMobileManageMode = z.enum(['queue', 'models']);
export type MobileManageMode = z.infer<typeof zMobileManageMode>;

const zMobilePanels = z.object({
  layers: z.boolean(),
  toolSettings: z.boolean(),
});

const zPartialDimensions = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
});

const zSerializable = z.any().refine(isPlainObject);
export type Serializable = z.infer<typeof zSerializable>;

export const zUIState = z.object({
  _version: z.literal(4),
  activeTab: zTabName,
  shouldShowItemDetails: z.boolean(),
  shouldShowProgressInViewer: z.boolean(),
  accordions: z.record(z.string(), z.boolean()),
  expanders: z.record(z.string(), z.boolean()),
  textAreaSizes: z.record(z.string(), zPartialDimensions),
  panels: z.record(z.string(), zSerializable),
  shouldShowNotificationV2: z.boolean(),
  pickerCompactViewStates: z.record(z.string(), z.boolean()),
  // Add mobile state
  mobile: z.object({
    activeMainTab: zMobileMainTab,
    activeCreateMode: zMobileCreateMode,
    activeManageMode: zMobileManageMode,
    panelsOpen: zMobilePanels,
  }),
});
export type UIState = z.infer<typeof zUIState>;
export const getInitialUIState = (): UIState => ({
  _version: 4 as const,
  activeTab: 'generate' as const,
  shouldShowItemDetails: false,
  shouldShowProgressInViewer: true,
  accordions: {},
  expanders: {},
  textAreaSizes: {},
  panels: {},
  shouldShowNotificationV2: true,
  pickerCompactViewStates: {},
  // Add mobile initial state
  mobile: {
    activeMainTab: 'create' as const,
    activeCreateMode: 'generate' as const,
    activeManageMode: 'queue' as const,
    panelsOpen: {
      layers: false,
      toolSettings: false,
    },
  },
});
