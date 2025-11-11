import { createSelector } from '@reduxjs/toolkit';
import { selectUiSlice } from 'features/ui/store/uiSlice';

export const selectActiveTab = createSelector(selectUiSlice, (ui) => ui.activeTab);
export const selectShouldShowItemDetails = createSelector(selectUiSlice, (ui) => ui.shouldShowItemDetails);
export const selectShouldShowProgressInViewer = createSelector(selectUiSlice, (ui) => ui.shouldShowProgressInViewer);
export const selectPickerCompactViewStates = createSelector(selectUiSlice, (ui) => ui.pickerCompactViewStates);

// Mobile selectors
export const selectMobileState = createSelector(selectUiSlice, (ui) => ui.mobile);
export const selectMobileMainTab = createSelector(selectMobileState, (mobile) => mobile.activeMainTab);
export const selectMobileCreateMode = createSelector(selectMobileState, (mobile) => mobile.activeCreateMode);
export const selectMobileManageMode = createSelector(selectMobileState, (mobile) => mobile.activeManageMode);
export const selectMobilePanelsOpen = createSelector(selectMobileState, (mobile) => mobile.panelsOpen);
