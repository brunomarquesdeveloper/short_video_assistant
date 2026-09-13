'use client';

import { useWebPush } from '@/hooks/useWebPush';

export function ServiceWorkerRegister() {
  useWebPush();
  return null;
}