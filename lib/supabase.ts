import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Cliente público para uso no browser (client-side)
export function createClientSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Cliente admin para uso no servidor (server-side only)
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Cliente para uso no middleware
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Re-exportar tudo
export * from "./supabase-client"
export * from "./supabase-admin"
export { handleAuthError } from "./supabase-errors"

// Tipos para o banco de dados
export type User = {
  id: number
  name: string
  email: string
  password?: string
  role_id: number
  active: boolean
  created_at: string
  updated_at: string
  avatar_url?: string | null
  units?: number[]
}

export type Product = {
  id: number
  name: string
  slug: string
  sku: string
  description: string
  short_description: string
  price: number
  sale_price: number | null
  stock: number
  category_id: number
  brand: string
  featured: boolean
  active: boolean
  created_at: string
  updated_at: string
  video_url: string | null
  technical_specifications?: Array<{ name: string; value: string }>
  product_images?: ProductImage[]
}

export type ProductImage = {
  id: number
  product_id: number
  url: string
  alt_text: string
  is_main: boolean
  display_order: number
  created_at: string
}

export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  parent_id: number | null
  active: boolean
  created_at: string
  updated_at: string
  image_url: string | null
}

export type Slide = {
  id: number
  title: string
  subtitle: string | null
  image_url: string
  link_url: string | null
  button_text: string | null
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export type Notification = {
  id: number
  user_id: number
  title: string
  message: string
  read: boolean
  created_at: string
}

export type Role = {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export type Unit = {
  id: number
  name: string
  address: string
  city: string
  state: string
  postal_code: string
  phone: string
  email: string | null
  active: boolean
  created_at: string
  updated_at: string
  latitude: number | null
  longitude: number | null
}
