import { ChakraProvider } from '@invoke-ai/ui-library';
import { render, screen } from '@testing-library/react';
import { createStore } from 'app/store/store';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import { MobileQueueStatus } from './MobileQueueStatus';

// Mock the API hook
const mockUseGetQueueStatusQuery = vi.fn();
vi.mock('services/api/endpoints/queue', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = (await importOriginal()) as typeof import('services/api/endpoints/queue');
  return {
    ...actual,
    useGetQueueStatusQuery: () => mockUseGetQueueStatusQuery(),
  };
});

const renderWithProviders = (ui: ReactElement) => {
  const store = createStore();
  return render(
    <Provider store={store}>
      <ChakraProvider>{ui}</ChakraProvider>
    </Provider>
  );
};

describe('MobileQueueStatus', () => {
  it('renders loading state', () => {
    mockUseGetQueueStatusQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderWithProviders(<MobileQueueStatus />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('renders queue statistics', () => {
    mockUseGetQueueStatusQuery.mockReturnValue({
      data: {
        queue: {
          pending: 5,
          in_progress: 1,
          completed: 10,
          failed: 2,
          canceled: 0,
          total: 18,
        },
      },
      isLoading: false,
    });

    renderWithProviders(<MobileQueueStatus />);

    expect(screen.getByText('5')).toBeDefined(); // pending
    expect(screen.getByText('10')).toBeDefined(); // completed
    expect(screen.getByText(/completed/i)).toBeDefined();
  });
});
