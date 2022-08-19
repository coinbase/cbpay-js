import { EventMetadata } from 'types/events';
import { broadcastPostMessage, SdkTarget } from './postMessage';

export function broadcastEvent(sdkTarget: SdkTarget, event: EventMetadata): void {
  broadcastPostMessage(sdkTarget, 'event', {
    data: event,
  });
}
