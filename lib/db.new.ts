import { createServerSupabaseClient } from "./supabase"
import type { User, Product, Category, Slide, Notification, Role, Unit } from "./supabase"

// Função auxiliar para executar consultas com tratamento de erro
async function executeQuery<T>(
  query: (client: Awaited<ReturnType<typeof createServerSupabaseClient>>) => Promise<{ data: T | null; error: any }>
): Promise<T> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await query(supabase)
  
  if (error) {
    console.error('Database error:', error)
    throw error
  }
  
  if (!data) {
    throw new Error('No data returned from query')
  }
  
  return data
}

// Funções para usuários
export async function getUsers(): Promise<User[]> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("users")
      .select("*")
      .order("name")
  })
}

export async function getUserById(id: number): Promise<User> {
  return executeQuery(async (supabase) => {
    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        user_units (
          unit_id
        )
      `)
      .eq("id", id)
      .single()

    if (data) {
      // Mapear o resultado para o formato esperado
      return {
        data: {
          ...data,
          units: data.user_units?.map((uu: any) => uu.unit_id) || []
        },
        error: null
      }
    }

    return { data: null, error }
  })
}

export async function createUser(user: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("users")
      .insert([user])
      .select()
      .single()
  })
}

export async function updateUser(id: number, user: Partial<User>): Promise<User> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("users")
      .update(user)
      .eq("id", id)
      .select()
      .single()
  })
}

export async function deleteUser(id: number): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)

  if (error) throw error
  return true
}

// Funções para papéis (roles)
export async function getRoles(): Promise<Role[]> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("roles")
      .select("*")
      .order("name")
  })
}

// Funções para unidades
export async function getUnits(): Promise<Unit[]> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("units")
      .select("*")
      .order("name")
  })
}

export async function getUnitById(id: number): Promise<Unit> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("units")
      .select("*")
      .eq("id", id)
      .single()
  })
}

// Funções para produtos
export async function getProducts(): Promise<Product[]> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("products")
      .select("*")
      .order("name")
  })
}

export async function getProductById(id: number): Promise<Product> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()
  })
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single()
  })
}

export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("products")
      .insert([product])
      .select()
      .single()
  })
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<Product> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("products")
      .update(product)
      .eq("id", id)
      .select()
      .single()
  })
}

export async function deleteProduct(id: number): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)

  if (error) throw error
  return true
}

// Funções para categorias
export async function getCategories(): Promise<Category[]> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("categories")
      .select("*")
      .order("name")
  })
}

export async function getCategoryById(id: number): Promise<Category> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single()
  })
}

export async function createCategory(category: Omit<Category, "id" | "created_at" | "updated_at">): Promise<Category> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("categories")
      .insert([category])
      .select()
      .single()
  })
}

export async function updateCategory(id: number, category: Partial<Category>): Promise<Category> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("categories")
      .update(category)
      .eq("id", id)
      .select()
      .single()
  })
}

export async function deleteCategory(id: number): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)

  if (error) throw error
  return true
}

// Funções para slides
export async function getSlides(): Promise<Slide[]> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("slides")
      .select("*")
      .order("order")
  })
}

export async function getActiveSlides(): Promise<Slide[]> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("slides")
      .select("*")
      .eq("is_active", true)
      .order("order")
  })
}

export async function getSlideById(id: number): Promise<Slide> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("slides")
      .select("*")
      .eq("id", id)
      .single()
  })
}

export async function createSlide(slide: Omit<Slide, "id" | "created_at" | "updated_at">): Promise<Slide> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("slides")
      .insert([slide])
      .select()
      .single()
  })
}

export async function updateSlide(id: number, slide: Partial<Slide>): Promise<Slide> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("slides")
      .update(slide)
      .eq("id", id)
      .select()
      .single()
  })
}

export async function deleteSlide(id: number): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from("slides")
    .delete()
    .eq("id", id)

  if (error) throw error
  return true
}

// Funções para notificações
export async function getNotifications(userId: number): Promise<Notification[]> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
  })
}

export async function getUnreadNotifications(userId: number): Promise<Notification[]> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
  })
}

export async function markNotificationAsRead(id: number): Promise<Notification> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .select()
      .single()
  })
}

export async function markAllNotificationsAsRead(userId: number): Promise<{ count: number }> {
  const supabase = await createServerSupabaseClient()
  const { count, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false)

  if (error) throw error
  return { count: count || 0 }
}

export async function createNotification(notification: Omit<Notification, "id" | "created_at">): Promise<Notification> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from("notifications")
      .insert([notification])
      .select()
      .single()
  })
}

export async function deleteNotification(id: number): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)

  if (error) throw error
  return true
}
