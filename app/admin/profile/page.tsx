"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useNotify } from "@/contexts/notification-context"
import { PasswordStrength } from "@/components/password-strength"
import { User, Mail, Shield, Calendar, Save, Loader2, Eye, EyeOff } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const notify = useNotify()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)

      // Buscar usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!user) throw new Error("Usuário não encontrado")

      // Primeiro, tentar buscar na tabela users customizada
      const { data: userData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      // Se não encontrar na tabela users, buscar na tabela profiles
      let profileData = null
      if (usersError) {
        const { data: profileResult, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (!profileError) {
          profileData = profileResult
        }
      }

      const userProfile: UserProfile = {
        id: user.id,
        email: userData?.email || user.email || "",
        full_name: userData?.name || profileData?.full_name || user.user_metadata?.full_name || "",
        avatar_url: userData?.avatar_url || profileData?.avatar_url || user.user_metadata?.avatar_url || null,
        role: userData?.role_id ? "admin" : (profileData?.role || "admin"),
        created_at: userData?.created_at || user.created_at,
        last_sign_in_at: user.last_sign_in_at || null,
      }

      setProfile(userProfile)
      setFormData({
        full_name: userProfile.full_name || "",
        email: userProfile.email,
      })

    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
      notify.error("Erro", "Não foi possível carregar os dados do perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile?.id) {
      notify.error("Erro", "Usuário não identificado")
      return
    }

    try {
      setSaving(true)

      // Tentar atualizar na tabela users primeiro
      const { error: usersError } = await supabase
        .from("users")
        .update({
          name: formData.full_name,
          email: formData.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      // Se não conseguir atualizar users, atualizar profiles
      if (usersError) {
        console.log("Atualizando tabela profiles...")
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: profile.id,
            full_name: formData.full_name,
            updated_at: new Date().toISOString(),
          })

        if (profileError) {
          console.error("Erro ao atualizar profiles:", profileError)
          throw profileError
        }
      }

      // Atualizar auth metadata também
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
        }
      })

      if (authError) {
        console.error("Erro ao atualizar auth metadata:", authError)
      }

      notify.success("Sucesso", "Perfil atualizado com sucesso!")
      await loadProfile() // Recarregar dados

    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      notify.error("Erro", "Não foi possível atualizar o perfil")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPasswordValid) {
      notify.error("Erro", "A senha não atende aos critérios de segurança")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notify.error("Erro", "As senhas não coincidem")
      return
    }

    try {
      setSaving(true)

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      notify.success("Sucesso", "Senha alterada com sucesso!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setShowPasswordForm(false)

    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      notify.error("Erro", "Não foi possível alterar a senha")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Informações do Perfil */}
            <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {profile?.full_name || "Usuário"}
                    </h1>
                    <p className="text-muted-foreground">{profile?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500 font-medium">
                        {profile?.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Membro desde</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Último acesso</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário de Edição */}
            <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-6">Editar Informações</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full bg-transparent border border-input rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    disabled
                    className="w-full border-input rounded-md py-2 px-3 bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">O email não pode ser alterado</p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </form>
            </div>

            {/* Alterar Senha */}
            <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Segurança</h2>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-2 text-primary hover:text-primary/90"
                >
                  {showPasswordForm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPasswordForm ? "Ocultar" : "Alterar Senha"}
                </button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  {/* Componente de Validação de Senha Forte */}
                  <PasswordStrength
                    password={passwordData.newPassword}
                    onPasswordChange={(password) => setPasswordData(prev => ({ ...prev, newPassword: password }))}
                    onValidChange={setIsPasswordValid}
                    label="Nova Senha"
                    placeholder="Digite sua nova senha"
                  />

                  {/* Campo de Confirmação */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full bg-transparent border border-input rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Confirme a nova senha"
                      required
                    />
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-destructive text-sm">As senhas não coincidem</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        })
                      }}
                      className="px-4 py-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !isPasswordValid || passwordData.newPassword !== passwordData.confirmPassword}
                      className="flex items-center gap-2 px-6 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {saving ? "Alterando..." : "Alterar Senha"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
