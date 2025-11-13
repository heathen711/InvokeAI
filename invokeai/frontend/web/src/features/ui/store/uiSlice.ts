import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from 'app/store/store';
import type { SliceConfig } from 'app/store/types';
import { isPlainObject } from 'es-toolkit';
import { assert } from 'tsafe';

import { getInitialUIState, type UIState, zUIState } from './uiTypes';

const slice = createSlice({
  name: 'ui',
  initialState: getInitialUIState(),
  reducers: {
    setActiveTab: (state, action: PayloadAction<UIState['activeTab']>) => {
      state.activeTab = action.payload;
    },
    setShouldShowItemDetails: (state, action: PayloadAction<UIState['shouldShowItemDetails']>) => {
      state.shouldShowItemDetails = action.payload;
    },
    setShouldShowProgressInViewer: (state, action: PayloadAction<UIState['shouldShowProgressInViewer']>) => {
      state.shouldShowProgressInViewer = action.payload;
    },
    accordionStateChanged: (
      state,
      action: PayloadAction<{
        id: keyof UIState['accordions'];
        isOpen: UIState['accordions'][keyof UIState['accordions']];
      }>
    ) => {
      const { id, isOpen } = action.payload;
      state.accordions[id] = isOpen;
    },
    expanderStateChanged: (
      state,
      action: PayloadAction<{
        id: keyof UIState['expanders'];
        isOpen: UIState['expanders'][keyof UIState['expanders']];
      }>
    ) => {
      const { id, isOpen } = action.payload;
      state.expanders[id] = isOpen;
    },
    textAreaSizesStateChanged: (
      state,
      action: PayloadAction<{
        id: keyof UIState['textAreaSizes'];
        size: UIState['textAreaSizes'][keyof UIState['textAreaSizes']];
      }>
    ) => {
      const { id, size } = action.payload;
      state.textAreaSizes[id] = size;
    },
    dockviewStorageKeyChanged: (
      state,
      action: PayloadAction<{
        id: keyof UIState['panels'];
        state: UIState['panels'][keyof UIState['panels']] | undefined;
      }>
    ) => {
      const { id, state: panelState } = action.payload;
      if (panelState) {
        state.panels[id] = panelState;
      } else {
        delete state.panels[id];
      }
    },
    shouldShowNotificationChanged: (state, action: PayloadAction<UIState['shouldShowNotificationV2']>) => {
      state.shouldShowNotificationV2 = action.payload;
    },
    pickerCompactViewStateChanged: (state, action: PayloadAction<{ pickerId: string; isCompact: boolean }>) => {
      state.pickerCompactViewStates[action.payload.pickerId] = action.payload.isCompact;
    },
    // Add these reducers in the reducers object
    setMobileMainTab: (state, action: PayloadAction<UIState['mobile']['activeMainTab']>) => {
      state.mobile.activeMainTab = action.payload;
    },
    setMobileCreateMode: (state, action: PayloadAction<UIState['mobile']['activeCreateMode']>) => {
      state.mobile.activeCreateMode = action.payload;
    },
    setMobileManageMode: (state, action: PayloadAction<UIState['mobile']['activeManageMode']>) => {
      state.mobile.activeManageMode = action.payload;
    },
    toggleMobilePanel: (state, action: PayloadAction<keyof UIState['mobile']['panelsOpen']>) => {
      const panel = action.payload;
      state.mobile.panelsOpen[panel] = !state.mobile.panelsOpen[panel];
    },
    setMobilePanelOpen: (
      state,
      action: PayloadAction<{ panel: keyof UIState['mobile']['panelsOpen']; isOpen: boolean }>
    ) => {
      state.mobile.panelsOpen[action.payload.panel] = action.payload.isOpen;
    },
  },
});

export const {
  setActiveTab,
  setShouldShowItemDetails,
  setShouldShowProgressInViewer,
  accordionStateChanged,
  expanderStateChanged,
  shouldShowNotificationChanged,
  textAreaSizesStateChanged,
  dockviewStorageKeyChanged,
  pickerCompactViewStateChanged,
  /** @knipignore - accessed via uiSlice.actions.setMobileMainTab */
  setMobileMainTab,
  /** @knipignore - accessed via uiSlice.actions.setMobileCreateMode */
  setMobileCreateMode,
  /** @knipignore - accessed via uiSlice.actions.setMobileManageMode */
  setMobileManageMode,
  /** @knipignore - accessed via uiSlice.actions.toggleMobilePanel */
  toggleMobilePanel,
  /** @knipignore - accessed via uiSlice.actions.setMobilePanelOpen */
  setMobilePanelOpen,
} = slice.actions;

export const selectUiSlice = (state: RootState) => state.ui;

export const uiSlice = slice;

export const uiSliceConfig: SliceConfig<typeof slice> = {
  slice,
  schema: zUIState,
  getInitialState: getInitialUIState,
  persistConfig: {
    migrate: (state) => {
      assert(isPlainObject(state));
      if (!('_version' in state)) {
        state._version = 1;
      }
      if (state._version === 1) {
        state.activeTab = 'generation';
        state._version = 2;
      }
      if (state._version === 2) {
        state.activeTab = 'canvas';
        state._version = 3;
      }
      if (state._version === 3) {
        state.panels = {};
        state._version = 4;
      }
      if (state._version === 4) {
        state.mobile = {
          activeMainTab: 'create',
          activeCreateMode: 'generate',
          activeManageMode: 'queue',
          panelsOpen: {
            layers: false,
            toolSettings: false,
          },
        };
        state._version = 5;
      }
      return zUIState.parse(state);
    },
    persistDenylist: ['shouldShowItemDetails'],
  },
};
