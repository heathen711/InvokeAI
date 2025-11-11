// src/features/ui/components/mobile/MobileActionBar.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MobileActionBar } from './MobileActionBar';

describe('MobileActionBar', () => {
  it('should render children content', () => {
    render(
      <MobileActionBar>
        <button>Test Button</button>
      </MobileActionBar>
    );

    expect(screen.getByRole('button', { name: /test button/i })).toBeDefined();
  });
});
