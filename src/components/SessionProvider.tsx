'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const initSession = useAuthStore(s => s.initSession);

  useEffect(() => {
    initSession();
  }, [initSession]);

  return <>{children}</>;
}
