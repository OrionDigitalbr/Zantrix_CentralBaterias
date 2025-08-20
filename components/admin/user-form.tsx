"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PasswordStrength } from "@/components/ui/password-strength"
import { EmailSuggestions } from "@/components/ui/email-suggestions"
import { Loader2, Save, ArrowLeft, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useNotify } from "@/contexts/notification-context"
import { getRoles, getUnits, getUserById, createUser, updateUser } from "@/lib/db"
import { createClientSupabaseClient } from "@/lib/supabase"
import { createNotification } from "@/lib/notifications"
import type { User, Role, Unit } from "@/lib/supabase"

interface UserFormProps {
  userId?: string
}

export function UserForm({ userId }: UserFormProps) {
  const router = useRouter()
  const notify = useNotify()
  const isEditing = !!userId

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [units, setUnits] = useState<Unit[]>([])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
    active: true,
    sendWelcomeEmail: true,
    units: [] as string[],
    avatar: "/placeholder.svg?height=100&width=100&text=Avatar",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isPasswordValid, setIsPasswordValid] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Buscar papéis e unidades
        const rolesData = await getRoles()
        const unitsData = await getUnits()

        setRoles(rolesData)
        setUnits(unitsData)

        if (isEditing && userId) {
          // Buscar dados do usuário
          const userData = await getUserById(Number.parseInt(userId))

          setFormData({
            name: userData.name,
            email: userData.email,
            password: "",
            role_id: userData.role_id.toString(),
            active: userData.active,
            sendWelcomeEmail: false,
            units: userData.units?.map((u) => u.toString()) || [],
            avatar: userData.avatar_url || "/placeholder.svg?height=100&width=100&text=" + userData.name.charAt(0),
          })
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err)
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isEditing, userId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "O nome é obrigatório"
    }

    if (!formData.email.trim()) {
      newErrors.email = "O email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.role_id) {
      newErrors.role_id = "A função é obrigatória"
    }

    if (!isEditing && !formData.password) {
      newErrors.password = "A senha é obrigatória para novos usuários"
    } else if (!isEditing && formData.password && !isPasswordValid) {
      newErrors.password = "A senha não atende aos critérios de segurança"
    }

    if (formData.units.length === 0) {
      newErrors.units = "Selecione pelo menos uma unidade"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro quando o campo é preenchido
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro quando o campo é preenchido
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleUnitToggle = (unitId: string) => {
    setFormData((prev) => {
      const units = [...prev.units]
      if (units.includes(unitId)) {
        return { ...prev, units: units.filter((id) => id !== unitId) }
      } else {
        return { ...prev, units: [...units, unitId] }
      }
    })

    // Limpar erro quando pelo menos uma unidade é selecionada
    if (errors.units && formData.units.length === 0) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.units
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClientSupabaseClient()

      if (isEditing && userId) {
        // Atualizar usuário existente
        const { error: userError } = await supabase
          .from("users")
          .update({
            name: formData.name,
            email: formData.email,
            role_id: Number(formData.role_id),
            active: formData.active,
            avatar_url: formData.avatar !== "/placeholder.svg?height=100&width=100&text=Avatar" ? formData.avatar : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)

        if (userError) throw userError

        // Atualizar unidades do usuário
        // Primeiro, remover todas as unidades existentes
        await supabase
          .from("user_units")
          .delete()
          .eq("user_id", userId)

        // Depois, inserir as novas unidades selecionadas
        if (formData.units.length > 0) {
          const userUnits = formData.units.map(unitId => ({
            user_id: Number(userId),
            unit_id: Number(unitId)
          }))

          const { error: unitsError } = await supabase
            .from("user_units")
            .insert(userUnits)

          if (unitsError) throw unitsError
        }
      } else {
        // Criar novo usuário
        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert({
            name: formData.name,
            email: formData.email,
            password: formData.password, // Em produção, hash a senha
            role_id: Number(formData.role_id),
            active: formData.active,
            avatar_url: formData.avatar !== "/placeholder.svg?height=100&width=100&text=Avatar" ? formData.avatar : null,
          })
          .select()
          .single()

        if (userError) throw userError

        // Inserir unidades do usuário
        if (formData.units.length > 0 && newUser) {
          const userUnits = formData.units.map(unitId => ({
            user_id: newUser.id,
            unit_id: Number(unitId)
          }))

          const { error: unitsError } = await supabase
            .from("user_units")
            .insert(userUnits)

          if (unitsError) throw unitsError
        }
      }

      // Notificação de sucesso
      const notificationTitle = isEditing ? "Usuário Atualizado" : "Novo Usuário Criado"
      const notificationMessage = `O usuário "${formData.name}" foi ${isEditing ? 'atualizado' : 'criado'} com sucesso.`

      notify.success(notificationTitle, notificationMessage)

      // Criar notificação no sistema para o admin logado
      const { data: { user: adminUser } } = await supabase.auth.getUser()
      if (adminUser) {
        await createNotification({
          user_id: adminUser.id, // Usar o ID do usuário logado
          title: notificationTitle,
          message: notificationMessage,
          type: 'success'
        })
      } else {
        console.warn("Não foi possível obter o usuário admin para criar a notificação.")
      }

      toast({
        title: isEditing ? "Usuário atualizado" : "Usuário criado",
        description: isEditing
          ? `O usuário ${formData.name} foi atualizado com sucesso.`
          : `O usuário ${formData.name} foi criado com sucesso.`,
      })

      router.push("/admin/users")
    } catch (err: any) {
      console.error("Erro ao salvar usuário:", err)

      // Notificação de erro
      notify.error(
        "Erro ao Salvar Usuário",
        `Ocorreu um erro ao salvar o usuário: ${err.message || 'Erro desconhecido'}`
      )

      toast({
        title: "Erro ao salvar usuário",
        description: `Erro: ${err.message || 'Tente novamente.'}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const supabase = createClientSupabaseClient()
        const fileName = `avatar-${Date.now()}-${file.name}`

        const { data, error } = await supabase.storage
          .from('user-avatars')
          .upload(fileName, file)

        if (error) throw error

        const { data: urlData } = supabase.storage
          .from('user-avatars')
          .getPublicUrl(fileName)

        setFormData(prev => ({ ...prev, avatar: urlData.publicUrl }))

        toast({
          title: "Avatar atualizado",
          description: "Imagem do avatar foi carregada com sucesso.",
        })
      } catch (error) {
        console.error('Erro ao fazer upload do avatar:', error)
        toast({
          title: "Erro no upload",
          description: "Não foi possível fazer upload da imagem.",
          variant: "destructive",
        })
      }
    }
    input.click()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="info">
        <TabsList className="mb-4">
          <TabsTrigger value="info" className="transition-all duration-200 hover:scale-105">
            Informações Básicas
          </TabsTrigger>
          <TabsTrigger value="access" className="transition-all duration-200 hover:scale-105">
            Acesso e Permissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="border-orange-100 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-white">
              <CardTitle>Informações do Usuário</CardTitle>
              <CardDescription>Preencha as informações básicas do usuário.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-24 w-24 mb-4 border-4 border-orange-100 shadow-lg transition-all duration-200 hover:scale-105">
                  <AvatarImage src={formData.avatar || "/placeholder.svg"} alt="Avatar" />
                  <AvatarFallback className="bg-orange-500 text-white text-2xl">
                    {formData.name
                      ? formData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAvatarUpload}
                  className="transition-all duration-200 hover:scale-105 border-orange-200 hover:border-orange-300"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Alterar Avatar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`${errors.name ? "border-red-500" : "focus:border-orange-500 focus:ring-orange-500"} transition-all duration-200`}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>
                    E-mail
                  </Label>
                  <EmailSuggestions
                    value={formData.email}
                    onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                    onBlur={() => {
                      if (errors.email && formData.email) {
                        setErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.email
                          return newErrors
                        })
                      }
                    }}
                    required
                    placeholder="exemplo@gmail.com"
                    className={`w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-500" : "focus:border-orange-500 focus:ring-orange-500"} transition-all duration-200`}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
              </div>

              {!isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="password" className={errors.password ? "text-red-500" : ""}>
                    Senha
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditing}
                    className={`${errors.password ? "border-red-500" : "focus:border-orange-500 focus:ring-orange-500"} transition-all duration-200`}
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                  <PasswordStrength
                    password={formData.password}
                    onStrengthChange={(strength, isValid) => {
                      setPasswordStrength(strength)
                      setIsPasswordValid(isValid)
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card className="border-orange-100 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-white">
              <CardTitle>Acesso e Permissões</CardTitle>
              <CardDescription>Configure o nível de acesso e as permissões do usuário.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role_id" className={errors.role_id ? "text-red-500" : ""}>
                    Função
                  </Label>
                  <Select value={formData.role_id} onValueChange={(value) => handleSelectChange("role_id", value)}>
                    <SelectTrigger
                      className={`${errors.role_id ? "border-red-500" : "focus:border-orange-500 focus:ring-orange-500"} transition-all duration-200`}
                    >
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role_id && <p className="text-red-500 text-sm">{errors.role_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center space-x-3 pt-2">
                    <ToggleSwitch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => handleCheckboxChange("active", checked as boolean)}
                      className="transition-all duration-200"
                    />
                    <label
                      htmlFor="active"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Usuário ativo
                    </label>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <ToggleSwitch
                      id="sendWelcomeEmail"
                      checked={formData.sendWelcomeEmail}
                      onCheckedChange={(checked) => handleCheckboxChange("sendWelcomeEmail", checked as boolean)}
                      className="transition-all duration-200"
                    />
                    <label
                      htmlFor="sendWelcomeEmail"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Enviar e-mail de boas-vindas com instruções para definir senha
                    </label>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label className={errors.units ? "text-red-500" : ""}>Unidades de Acesso</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {units.length > 0 ? (
                    units.map((unit) => (
                      <div
                        key={unit.id}
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-orange-50 transition-all duration-200"
                      >
                        <Checkbox
                          id={`unit-${unit.id}`}
                          checked={formData.units.includes(unit.id.toString())}
                          onCheckedChange={() => handleUnitToggle(unit.id.toString())}
                          className="text-orange-500 focus:ring-orange-500 transition-all duration-200 hover:scale-110"
                        />
                        <label
                          htmlFor={`unit-${unit.id}`}
                          className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <div className="font-semibold">{unit.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {unit.address}, {unit.city} - {unit.state}
                          </div>
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-2">
                      Nenhuma unidade cadastrada. Adicione unidades em Configurações.
                    </p>
                  )}
                </div>
                {errors.units && <p className="text-red-500 text-sm">{errors.units}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/users")}
          className="transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

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
              {isEditing ? "Atualizar Usuário" : "Criar Usuário"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
