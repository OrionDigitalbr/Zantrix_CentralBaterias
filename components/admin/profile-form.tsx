"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { uploadUserAvatar, getFileNameFromUrl, deleteFile } from "@/lib/storage"

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientSupabaseClient()

  const [formData, setFormData] = useState({
    id: "",
    full_name: "",
    email: "",
    avatar_url: "",
  })

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoading(true)
        setError(null)

        // Obter sessão atual
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!session) {
          setError("Sessão não encontrada. Por favor, faça login novamente.")
          setIsLoading(false)
          return
        }

        // Buscar dados do usuário na tabela profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          if (profileError.code === "PGRST116") {
            // Perfil não encontrado - criar um novo
            const { error: createError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || "",
                avatar_url: session.user.user_metadata?.avatar_url || "",
              })

            if (createError) {
              console.error("Erro ao criar perfil:", createError)
              setError("Erro ao criar perfil. Por favor, contate o administrador.")
            } else {
              // Buscar novamente após criar
              const { data: newProfileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single()

              if (newProfileData) {
                setFormData({
                  id: newProfileData.id,
                  full_name: newProfileData.full_name || "",
                  email: session.user.email || "",
                  avatar_url: newProfileData.avatar_url || "",
                })
              }
            }
          } else {
            console.error("Erro ao buscar perfil:", profileError)
            setError("Erro ao carregar dados do perfil. Por favor, tente novamente.")
          }
        } else if (profileData) {
          setFormData({
            id: profileData.id,
            full_name: profileData.full_name || "",
            email: session.user.email || "",
            avatar_url: profileData.avatar_url || "",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
        setError("Ocorreu um erro ao carregar seu perfil. Por favor, tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Atualizar perfil no banco de dados (tabela profiles) - apenas campos existentes
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
        })
        .eq("id", formData.id)

      if (error) throw error

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      toast({
        title: "Erro ao salvar perfil",
        description: "Ocorreu um erro ao salvar suas informações.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setIsUploading(true)
      const file = files[0]

      // Excluir avatar anterior se existir
      if (formData.avatar_url) {
        const fileName = getFileNameFromUrl(formData.avatar_url)
        await deleteFile("user-avatars", fileName)
      }

      // Upload do novo avatar
      const fileExt = file.name.split(".").pop()
      const timestamp = Date.now()
      const fileName = `avatar-${formData.id}-${timestamp}.${fileExt}`

      const { url, error } = await uploadUserAvatar(file, fileName)

      if (error) throw error

      if (url) {
        // Atualizar URL no estado
        setFormData((prev) => ({ ...prev, avatar_url: url }))

        // Atualizar no banco de dados (tabela profiles)
        await supabase.from("profiles").update({ avatar_url: url }).eq("id", formData.id)

        toast({
          title: "Avatar atualizado",
          description: "Sua foto de perfil foi atualizada com sucesso.",
        })
      }
    } catch (error) {
      console.error("Erro ao fazer upload do avatar:", error)
      toast({
        title: "Erro ao atualizar avatar",
        description: "Ocorreu um erro ao fazer upload da imagem.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md">
        <h3 className="text-lg font-medium mb-2">Erro ao carregar perfil</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize suas informações pessoais e profissionais</CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={formData.avatar_url || "/placeholder.svg"} alt="Avatar" />
                <AvatarFallback>
                  {formData.full_name
                    ? formData.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "?"}
                </AvatarFallback>
              </Avatar>

              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAvatarUpload}
                disabled={isUploading}
                className="transition-all duration-200 hover:scale-105"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Alterar Avatar
                  </>
                )}
              </Button>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled
                  />
                  <p className="text-xs text-gray-500">O e-mail não pode ser alterado</p>
                </div>
              </div>

              {/* Campos removidos: phone, position, department, bio - não existem na tabela profiles */}
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                <p>📋 <strong>Campos disponíveis:</strong> Nome completo e foto de perfil</p>
                <p>💡 <strong>Nota:</strong> Outros campos como telefone, cargo e biografia podem ser adicionados futuramente conforme necessário.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-orange-600 hover:bg-orange-700 transition-all duration-200 hover:scale-105"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
