// src/features/ui/components/mobile/gallery/MobileGalleryGrid.test.tsx
import { ChakraProvider } from '@invoke-ai/ui-library';
import { fireEvent, render, screen } from '@testing-library/react';
import { createStore } from 'app/store/store';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MobileGalleryGrid } from './MobileGalleryGrid';

// Mock the API hook
const mockUseListImagesQuery = vi.fn();
vi.mock('services/api/endpoints/images', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = (await importOriginal()) as typeof import('services/api/endpoints/images');
  return {
    ...actual,
    useListImagesQuery: () => mockUseListImagesQuery(),
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

describe('MobileGalleryGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading state', () => {
    mockUseListImagesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
    });

    renderWithProviders(<MobileGalleryGrid onImageSelect={vi.fn()} />);
    expect(screen.getByLabelText('Loading gallery images')).toBeDefined();
  });

  it('renders empty state when no images', () => {
    mockUseListImagesQuery.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      isFetching: false,
    });

    renderWithProviders(<MobileGalleryGrid onImageSelect={vi.fn()} />);
    expect(screen.getByText(/no images/i)).toBeDefined();
  });

  it('renders grid of images', () => {
    const mockImages = [
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
        width: 512,
        height: 512,
        starred: true,
        created_at: '2024-01-02',
        updated_at: '2024-01-02',
        is_intermediate: false,
        image_origin: 'internal',
        image_category: 'general',
        has_workflow: false,
      },
    ];

    mockUseListImagesQuery.mockReturnValue({
      data: { items: mockImages, total: 2 },
      isLoading: false,
      isFetching: false,
    });

    renderWithProviders(<MobileGalleryGrid onImageSelect={vi.fn()} />);

    // Should render images with alt text
    expect(screen.getByAltText('img1')).toBeDefined();
    expect(screen.getByAltText('img2')).toBeDefined();
  });

  it('calls onImageSelect when image is tapped', () => {
    const mockImage = {
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
    };

    mockUseListImagesQuery.mockReturnValue({
      data: { items: [mockImage], total: 1 },
      isLoading: false,
      isFetching: false,
    });

    const onImageSelect = vi.fn();
    renderWithProviders(<MobileGalleryGrid onImageSelect={onImageSelect} />);

    const images = screen.getAllByAltText('img1');
    const lastImage = images[images.length - 1];
    if (lastImage) {
      fireEvent.click(lastImage);
    }

    expect(onImageSelect).toHaveBeenCalledWith(mockImage);
  });
});
