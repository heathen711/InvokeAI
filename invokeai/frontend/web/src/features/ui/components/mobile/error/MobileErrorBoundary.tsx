// src/features/ui/components/mobile/error/MobileErrorBoundary.tsx
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { MobileErrorFallback } from './MobileErrorFallback';

interface MobileErrorBoundaryProps {
  children: ReactNode;
}

interface MobileErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for mobile components
 * Catches errors and shows fallback UI
 */
export class MobileErrorBoundary extends Component<MobileErrorBoundaryProps, MobileErrorBoundaryState> {
  constructor(props: MobileErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): MobileErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    if (import.meta.env.MODE === 'development') {
      // eslint-disable-next-line no-console
      console.error('Mobile Error Boundary caught error:', error, errorInfo);
    }

    // In production, you might want to send to error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <MobileErrorFallback error={this.state.error} resetErrorBoundary={this.handleReset} />;
    }

    return this.props.children;
  }
}
