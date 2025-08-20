import { createServerSupabaseClient } from "./supabase"
import type { User, Product, Category, Slide, Notification, Role, Unit } from "./supabase"

// Função para obter o cliente Supabase do servidor
type SupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>

const getSupabase = async (): Promise<SupabaseClient> => {
  return createServerSupabaseClient()
}

// Funções para usuários
export async function getUsers() {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("users").select("*").order("name")

  if (error) throw error
  return data as User[]
}

export async function getUserById(id: number) {
  const supabase = await getSupabase()
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

  if (error) throw error

  // Mapear o resultado para o formato esperado
  const user = {
    ...data,
    units: data.user_units.map((uu: any) => uu.unit_id)
  }

  return user as User
}

export async function createUser(user: Omit<User, "id" | "created_at" | "updated_at">) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("users").insert([user]).select()

  if (error) throw error
  return data[0] as User
}

export async function updateUser(id: number, user: Partial<User>) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("users").update(user).eq("id", id).select()

  if (error) throw error
  return data[0] as User
}

export async function deleteUser(id: number) {
  const supabase = await getSupabase()
  const { error } = await supabase.from("users").delete().eq("id", id)

  if (error) throw error
  return true
}

// Funções para papéis (roles)
export async function getRoles() {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("roles").select("*").order("name")

  if (error) throw error
  return data as Role[]
}

export async function getRoleById(id: number) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("roles").select("*").eq("id", id).single()

  if (error) throw error
  return data as Role
}

// Funções para unidades
export async function getUnits() {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("units").select("*").order("name")

  if (error) throw error
  return data as Unit[]
}

export async function getUnitById(id: number) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("units").select("*").eq("id", id).single()

  if (error) throw error
  return data as Unit
}

// Funções para produtos
export async function getProducts() {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("products").select("*").order("name")

  if (error) throw error
  return data as Product[]
}

export async function getProductById(id: number) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) throw error
  return data as Product
}

export async function getProductBySlug(slug: string) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).single()

  if (error) throw error
  return data as Product
}

export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("products").insert([product]).select()

  if (error) throw error
  return data[0] as Product
}

export async function updateProduct(id: number, product: Partial<Product>) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("products").update(product).eq("id", id).select()

  if (error) throw error
  return data[0] as Product
}

export async function deleteProduct(id: number) {
  const supabase = await getSupabase()
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) throw error
  return true
}

// Funções para categorias
export async function getCategories() {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) throw error
  return data as Category[]
}

export async function getCategoryById(id: number) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).single()

  if (error) throw error
  return data as Category
}

export async function createCategory(category: Omit<Category, "id" | "created_at" | "updated_at">) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("categories").insert([category]).select()

  if (error) throw error
  return data[0] as Category
}

export async function updateCategory(id: number, category: Partial<Category>) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("categories").update(category).eq("id", id).select()

  if (error) throw error
  return data[0] as Category
}

export async function deleteCategory(id: number) {
  const supabase = await getSupabase()
  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) throw error
  return true
}

// Funções para slides
export async function getSlides() {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("slides").select("*").order("display_order")

  if (error) throw error
  return data as Slide[]
}

export async function getActiveSlides() {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("slides").select("*").eq("active", true).order("display_order")

  if (error) throw error
  return data as Slide[]
}

export async function getSlideById(id: number) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("slides").select("*").eq("id", id).single()

  if (error) throw error
  return data as Slide
}

export async function createSlide(slide: Omit<Slide, "id" | "created_at" | "updated_at">) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("slides").insert([slide]).select()

  if (error) throw error
  return data[0] as Slide
}

export async function updateSlide(id: number, slide: Partial<Slide>) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("slides").update(slide).eq("id", id).select()

  if (error) throw error
  return data[0] as Slide
}

export async function deleteSlide(id: number) {
  const supabase = await getSupabase()
  const { error } = await supabase.from("slides").delete().eq("id", id)

  if (error) throw error
  return true
}

// Funções para notificações
export async function getNotifications(userId: number) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Notification[]
}

export async function getUnreadNotifications(userId: number) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("read", false)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Notification[]
}

export async function markNotificationAsRead(id: number) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("notifications").update({ read: true }).eq("id", id).select()

  if (error) throw error
  return data[0] as Notification
}

export async function markAllNotificationsAsRead(userId: number) {
  const supabase = await getSupabase()
  const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false)

  if (error) throw error
  return true
}

export async function createNotification(notification: Omit<Notification, "id" | "created_at">) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("notifications").insert([notification]).select()

  if (error) throw error
  return data[0] as Notification
}

export async function deleteNotification(id: number) {
  const supabase = await getSupabase()
  const { error } = await supabase.from("notifications").delete().eq("id", id)

  if (error) throw error
  return true
}
