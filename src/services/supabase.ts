import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { PlotStatusMap, PlotStatus } from '../types/plot';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/**
 * Clean Supabase Browser Client
 * Configured via environment variables VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
 * If credentials are not yet set in .env.local, `supabase` is null and `isSupabaseConfigured` is false.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!)
  : null;

/**
 * Fetch plot status map from public.plots table
 */
export async function fetchPlotStatuses(): Promise<PlotStatusMap> {
  if (!supabase) return {};

  try {
    const { data, error } = await supabase
      .from('plots')
      .select('id, status');

    if (error || !data) {
      console.warn('Unable to fetch plot statuses from Supabase:', error);
      return {};
    }

    const map: PlotStatusMap = {};
    for (const row of data) {
      if (row.id && (row.status === 'available' || row.status === 'sold')) {
        map[row.id] = row.status;
      }
    }
    return map;
  } catch (err) {
    console.warn('Error fetching plot statuses:', err);
    return {};
  }
}

/**
 * Check if a user ID is authorized as an Admin in public.admin_users
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Admin check warning:', error.message);
      return false;
    }
    return Boolean(data);
  } catch (err) {
    console.warn('Admin check error:', err);
    return false;
  }
}

/**
 * Update plot status in public.plots table (Requires Admin authorization via RLS)
 */
export async function updatePlotStatus(
  plotId: number,
  newStatus: PlotStatus
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const { error } = await supabase
      .from('plots')
      .update({ status: newStatus })
      .eq('id', plotId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update plot status.' };
  }
}

/**
 * Subscribe to realtime updates on public.plots table
 */
export function subscribeToPlotChanges(onChange: () => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('public:plots')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'plots' },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

