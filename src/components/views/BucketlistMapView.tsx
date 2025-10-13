import { InteractiveMapWrapper } from '../InteractiveMapWrapper';
import type { BucketlistItem } from '@/types';

interface BucketlistMapViewProps {
  items: BucketlistItem[];
}

export function BucketlistMapView({ items }: BucketlistMapViewProps) {
  // Use the interactive map wrapper that handles React 19 compatibility
  return <InteractiveMapWrapper items={items} />;
}
