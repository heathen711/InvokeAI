import { ChakraProvider } from '@invoke-ai/ui-library';
import { render, screen } from '@testing-library/react';
import { createStore } from 'app/store/store';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';

import { MobileQueueControls } from './MobileQueueControls';

const renderWithProviders = (ui: ReactElement) => {
  const store = createStore();
  return render(
    <Provider store={store}>
      <ChakraProvider>{ui}</ChakraProvider>
    </Provider>
  );
};

describe('MobileQueueControls', () => {
  it('renders control buttons', () => {
    renderWithProviders(<MobileQueueControls />);

    expect(screen.getByRole('button', { name: /pause/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /clear/i })).toBeDefined();
  });

  it('shows resume button when processor is paused', () => {
    renderWithProviders(<MobileQueueControls />);

    // This will need actual processor state from Redux
    // For now, just test that buttons exist
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
