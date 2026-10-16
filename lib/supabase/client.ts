import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for Client Components.
 * Reads environment variables configured for public client access.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Graceful fallback during build / preliminary setup before env vars are populated
    return createBrowserClient(
      supabaseUrl || "https://placeholder-project.supabase.co",
      supabaseKey || "placeholder-anon-key"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
