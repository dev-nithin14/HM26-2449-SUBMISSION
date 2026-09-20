import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export type RealtimeTable = 'reports' | 'collection_assignments' | 'processing_batches' | 'notifications' | 'profiles';

const syncEventTarget = new EventTarget();

export function triggerLocalSync(table?: RealtimeTable) {
  syncEventTarget.dispatchEvent(new CustomEvent('app:sync', { detail: { table } }));
}

/**
 * Hook for Supabase Realtime synchronization and tab-focus refetching.
 * Listens to postgres_changes on designated tables, window focus, visibility change, and local mutations.
 */
export function useRealtimeSync(
  tables: RealtimeTable[],
  onSync: () => void,
  options: { debounceMs?: number } = {}
) {
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;
  const timeoutRef = useRef<number | null>(null);

  const debouncedSync = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      onSyncRef.current();
    }, options.debounceMs || 200);
  };

  useEffect(() => {
    // 1. Initial trigger on mount
    debouncedSync();

    // 2. Tab focus and visibility refetching
    const handleFocus = () => debouncedSync();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        debouncedSync();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Local mutation event listener
    const handleLocalSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.table || tables.includes(detail.table)) {
        debouncedSync();
      }
    };
    syncEventTarget.addEventListener('app:sync', handleLocalSync);

    // 4. Supabase Realtime Channel
    const channelName = `realtime-sync-${tables.sort().join('-')}-${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase.channel(channelName);

    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          console.log(`[Supabase Realtime] Table '${table}' change received:`, payload.eventType);
          debouncedSync();
        }
      );
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Supabase Realtime] Subscribed to tables: ${tables.join(', ')}`);
      }
    });

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      syncEventTarget.removeEventListener('app:sync', handleLocalSync);
      supabase.removeChannel(channel);
    };
  }, [tables.join(','), options.debounceMs]);
}
