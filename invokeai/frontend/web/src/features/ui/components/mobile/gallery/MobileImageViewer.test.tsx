// src/features/ui/components/mobile/gallery/MobileImageViewer.test.tsx
import { ChakraProvider } from '@invoke-ai/ui-library';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createStore } from 'app/store/store';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import type { ImageDTO } from 'services/api/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MobileImageViewer } from './MobileImageViewer';

const mockImages: ImageDTO[] = [
  {
    image_name: 'img1',
    thumbnail_url: '/thumb1.jpg',
    image_url: '/img1.jpg',
    width: 512,
    height: 512,
    starred: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    is_intermediate: false,
    image_origin: 'internal',
    image_category: 'general',
    has_workflow: false,
  },
  {
    image_name: 'img2',
    thumbnail_url: '/thumb2.jpg',
    image_url: '/img2.jpg',
    width: 1024,
    height: 768,
    starred: true,
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
    is_intermediate: false,
    image_origin: 'internal',
    image_category: 'general',
    has_workflow: false,
  },
  {
    image_name: 'img3',
    thumbnail_url: '/thumb3.jpg',
    image_url: '/img3.jpg',
    width: 800,
    height: 600,
    starred: false,
    created_at: '2024-01-03',
    updated_at: '2024-01-03',
    is_intermediate: false,
    image_origin: 'internal',
    image_category: 'general',
    has_workflow: false,
  },
];

const renderWithProviders = (ui: ReactElement) => {
  const store = createStore();
  return render(
    <Provider store={store}>
      <ChakraProvider>{ui}</ChakraProvider>
    </Provider>
  );
};

describe('MobileImageViewer', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the current image', () => {
    renderWithProviders(<MobileImageViewer images={mockImages} currentIndex={0} onClose={vi.fn()} />);

    expect(screen.getByAltText('img1')).toBeDefined();
  });

  it('shows image counter', () => {
    renderWithProviders(<MobileImageViewer images={mockImages} currentIndex={1} onClose={vi.fn()} />);

    expect(screen.getByText('2 / 3')).toBeDefined();
  });

  it('shows close button', () => {
    renderWithProviders(<MobileImageViewer images={mockImages} currentIndex={0} onClose={vi.fn()} />);

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(<MobileImageViewer images={mockImages} currentIndex={0} onClose={onClose} />);

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    const closeButton = closeButtons[closeButtons.length - 1];
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(onClose).toHaveBeenCalled();
  });

  it('renders starting at specified index', () => {
    // Test starting at index 1
    renderWithProviders(<MobileImageViewer images={mockImages} currentIndex={1} onClose={vi.fn()} />);
    expect(screen.getByAltText('img2')).toBeDefined();
    expect(screen.getByText('2 / 3')).toBeDefined();

    cleanup();

    // Test starting at index 2
    renderWithProviders(<MobileImageViewer images={mockImages} currentIndex={2} onClose={vi.fn()} />);
    expect(screen.getByAltText('img3')).toBeDefined();
    expect(screen.getByText('3 / 3')).toBeDefined();
  });

  it('renders with zoom and pan capabilities', () => {
    renderWithProviders(<MobileImageViewer images={mockImages} currentIndex={0} onClose={vi.fn()} />);

    // Verify the dialog is rendered
    const containers = screen.getAllByRole('dialog');
    expect(containers.length).toBeGreaterThan(0);

    // Verify zoom indicator is present
    expect(screen.getByText('Zoom: 100%')).toBeDefined();
  });
});
