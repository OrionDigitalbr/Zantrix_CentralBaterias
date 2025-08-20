export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Tipos específicos para componentes
export interface ProductImage {
  id?: number
  url: string
  alt_text: string
  is_main: boolean
  display_order: number
  product_id?: number
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Unit {
  id: number
  name: string
  address: string
  city: string
  state: string
  email: string
  phone?: string | null
  postal_code?: string | null
  latitude?: number | null
  longitude?: number | null
  google_maps_url?: string | null
  maps_url?: string | null
  image_url?: string | null
  active: boolean
  created_at: string
  updated_at: string
  operating_hours?: Json | null
}

export interface User {
  id: number
  name: string
  email: string
  password?: string
  role_id: number
  active: boolean
  created_at: string
  updated_at: string
  avatar_url?: string | null
  phone?: string | null
  position?: string | null
  department?: string | null
  bio?: string | null
}

export interface Role {
  id: number
  name: string
  description?: string
  permissions?: Json | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  slug: string
  sku?: string
  description?: string
  short_description?: string
  price: number
  sale_price?: number | null
  stock: number
  category_id: number
  brand?: string
  featured: boolean
  active: boolean
  video_url?: string | null
  created_at: string
  updated_at: string
}

export interface Slide {
  id: number
  title: string
  subtitle?: string
  description?: string
  image_url: string
  link_url?: string
  active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  type: 'user' | 'product' | 'slide' | 'setting' | 'system'
  action: 'create' | 'update' | 'delete'
  title: string
  description: string
  entity_id?: string | null
  entity_name?: string | null
  user_id?: string | null
  user_name?: string | null
  user_role?: string | null
  read: boolean
  created_at: string
  updated_at?: string
}

export interface Database {
  public: {
    Tables: {
      units: {
        Row: Unit
        Insert: Omit<Unit, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Unit, 'id' | 'created_at'>>
      },
      
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      },

      roles: {
        Row: Role
        Insert: Omit<Role, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Role, 'id' | 'created_at'>>
      },

      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      },

      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at'>>
      },

      product_images: {
        Row: ProductImage
        Insert: Omit<ProductImage, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ProductImage, 'id' | 'created_at'>>
      },

      product_units: {
        Row: {
          id: number
          product_id: number
          unit_id: number
          created_at: string
        }
        Insert: {
          id?: number
          product_id: number
          unit_id: number
          created_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          unit_id?: number
          created_at?: string
        }
      },

      slides: {
        Row: Slide
        Insert: Omit<Slide, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Slide, 'id' | 'created_at'>>
      },

      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
      }
    }
  }
}
