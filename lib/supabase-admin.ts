import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Cliente admin para uso no servidor (server-side only) - NUNCA no client
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!  // NUNCA no client
  return createClient<Database>(url, service, { 
    auth: { 
      autoRefreshToken: false, 
      persistSession: false 
    } 
  })
}
