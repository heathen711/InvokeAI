// src/features/ui/components/mobile/models/MobileModelsList.test.tsx
import { ChakraProvider } from '@invoke-ai/ui-library';
import { render, screen } from '@testing-library/react';
import { createStore } from 'app/store/store';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import { MobileModelsList } from './MobileModelsList';

// Mock the API hook
const mockUseGetModelConfigsQuery = vi.fn();
vi.mock('services/api/endpoints/models', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = (await importOriginal()) as typeof import('services/api/endpoints/models');
  return {
    ...actual,
    useGetModelConfigsQuery: () => mockUseGetModelConfigsQuery(),
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

describe('MobileModelsList', () => {
  it('renders loading state', () => {
    mockUseGetModelConfigsQuery.mockReturnValue({
      models: [],
      isLoading: true,
    });

    renderWithProviders(<MobileModelsList onModelSelect={vi.fn()} />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('renders empty state when no models', () => {
    mockUseGetModelConfigsQuery.mockReturnValue({
      models: [],
      isLoading: false,
    });

    renderWithProviders(<MobileModelsList onModelSelect={vi.fn()} />);
    expect(screen.getByText(/no models/i)).toBeDefined();
  });

  it('renders model items', () => {
    mockUseGetModelConfigsQuery.mockReturnValue({
      models: [
        {
          key: 'model1',
          name: 'Test Model 1',
          base: 'sdxl',
          type: 'main',
          format: 'diffusers',
        },
        {
          key: 'model2',
          name: 'Test Model 2',
          base: 'sd-1',
          type: 'main',
          format: 'checkpoint',
        },
      ],
      isLoading: false,
    });

    renderWithProviders(<MobileModelsList onModelSelect={vi.fn()} />);

    expect(screen.getByText('Test Model 1')).toBeDefined();
    expect(screen.getByText('Test Model 2')).toBeDefined();
  });
});
