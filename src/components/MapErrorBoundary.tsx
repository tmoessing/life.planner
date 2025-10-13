import React, { Component, ReactNode } from 'react';
import { SimpleBucketlistMap } from './views/SimpleBucketlistMap';
import type { BucketlistItem } from '@/types';

interface Props {
  children: ReactNode;
  items: BucketlistItem[];
  onError?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Map component error caught by boundary:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <SimpleBucketlistMap items={this.props.items} />;
    }

    return this.props.children;
  }
}
