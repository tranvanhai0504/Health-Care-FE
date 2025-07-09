import { useEffect, useState } from 'react';
import { useServiceList } from '@/stores/service-list';

/**
 * A safe wrapper around useServiceList that prevents hydration mismatches
 * by ensuring data is only available after client-side hydration is complete
 */
export function useServiceListSafe() {
  const [isClient, setIsClient] = useState(false);
  const serviceList = useServiceList();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return safe versions of the methods that only work after hydration
  return {
    ...serviceList,
    // Safe getters that return 0/empty during SSR
    getTotalServices: () => isClient ? serviceList.getTotalServices() : 0,
    getTotalPrice: () => isClient ? serviceList.getTotalPrice() : 0,
    items: isClient ? serviceList.items : [],
    // Keep the original state setters and actions as they are
    isClient,
  };
} 