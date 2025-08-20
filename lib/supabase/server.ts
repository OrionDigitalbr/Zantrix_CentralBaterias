import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../database.types'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name)
          return cookie?.value ?? ''
        },
        async set(name: string, value: string, options: any) {
          try {
            await cookieStore.set({ 
              name, 
              value, 
              ...options,
              sameSite: 'lax',
              path: '/',
              secure: process.env.NODE_ENV === 'production'
            })
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        async remove(name: string, options: any) {
          try {
            await cookieStore.set({ 
              name, 
              value: '', 
              ...options, 
              maxAge: 0,
              sameSite: 'lax',
              path: '/',
              secure: process.env.NODE_ENV === 'production'
            })
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        },
      },
    }
  )
}
