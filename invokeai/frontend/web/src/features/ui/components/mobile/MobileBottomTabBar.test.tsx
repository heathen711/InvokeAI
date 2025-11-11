// src/features/ui/components/mobile/MobileBottomTabBar.test.tsx
import { ChakraProvider } from '@invoke-ai/ui-library';
import { render, screen } from '@testing-library/react';
import { createStore } from 'app/store/store';
import { describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';

import { MobileBottomTabBar } from './MobileBottomTabBar';

describe('MobileBottomTabBar', () => {
  it('should render three tab buttons', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ChakraProvider>
          <MobileBottomTabBar />
        </ChakraProvider>
      </Provider>
    );

    expect(screen.getByRole('button', { name: /create/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /view/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /manage/i })).toBeDefined();
  });
});
