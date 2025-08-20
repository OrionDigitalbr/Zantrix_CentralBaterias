import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

// Cliente público para uso no browser (client-side) - SEGURO
export function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createBrowserClient<Database>(url, anon)
}
