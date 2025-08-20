"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function SecuritySettings() {
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionNotificationsEnabled, setSessionNotificationsEnabled] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro quando o campo é preenchido
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "A senha atual é obrigatória"
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "A nova senha é obrigatória"
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "A senha deve ter pelo menos 8 caracteres"
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Confirme a nova senha"
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm()) {
      return
    }

    setIsChangingPassword(true)

    // Simulando envio de dados
    setTimeout(() => {
      setIsChangingPassword(false)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      })
    }, 1500)
  }

  const handleSecuritySettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulando envio de dados
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Configurações de segurança atualizadas",
        description: "Suas configurações de segurança foram atualizadas com sucesso.",
      })
    }, 1500)
  }

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      // Simulando ativação de 2FA
      toast({
        title: "Autenticação de dois fatores",
        description: "Funcionalidade será implementada em breve.",
      })
    }
    setTwoFactorEnabled(!twoFactorEnabled)
  }

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Atualize sua senha para manter sua conta segura</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className={errors.currentPassword ? "text-red-500" : ""}>
                Senha Atual
              </Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={errors.currentPassword ? "border-red-500" : ""}
              />
              {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className={errors.newPassword ? "text-red-500" : ""}>
                Nova Senha
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={errors.newPassword ? "border-red-500" : ""}
              />
              {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={errors.confirmPassword ? "text-red-500" : ""}>
                Confirmar Nova Senha
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isChangingPassword} className="bg-orange-600 hover:bg-orange-700">
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  "Alterar Senha"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Configurações de Segurança</CardTitle>
          <CardDescription>Gerencie as configurações de segurança da sua conta</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSecuritySettingsSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Autenticação de dois fatores</Label>
                <p className="text-sm text-gray-500">Adicione uma camada extra de segurança à sua conta</p>
              </div>
              <Switch id="two-factor" checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="session-notifications">Notificações de sessão</Label>
                <p className="text-sm text-gray-500">
                  Receba notificações quando sua conta for acessada em um novo dispositivo
                </p>
              </div>
              <Switch
                id="session-notifications"
                checked={sessionNotificationsEnabled}
                onCheckedChange={setSessionNotificationsEnabled}
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center"
                onClick={() => {
                  toast({
                    title: "Sessões ativas",
                    description: "Funcionalidade será implementada em breve.",
                  })
                }}
              >
                <Shield className="mr-2 h-4 w-4" />
                Ver Sessões Ativas
              </Button>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving} className="bg-orange-600 hover:bg-orange-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
