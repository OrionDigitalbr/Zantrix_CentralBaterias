"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function NotificationSettings() {
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    productUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
    orderUpdates: true,
    newsletterFrequency: "weekly",
  })

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulando envio de dados
    setTimeout(() => {
      console.log("Configurações de notificação:", settings)
      setIsSaving(false)
      toast({
        title: "Configurações atualizadas",
        description: "Suas preferências de notificação foram atualizadas com sucesso.",
      })
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Preferências de Notificação</CardTitle>
          <CardDescription>Gerencie como e quando você recebe notificações</CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notificações por E-mail</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Receber notificações por e-mail</Label>
                <p className="text-sm text-gray-500">Habilitar ou desabilitar todas as notificações por e-mail</p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
              />
            </div>

            <div className="space-y-4 pl-6 border-l-2 border-gray-100">
              <div className="flex items-center justify-between">
                <Label htmlFor="product-updates" className={!settings.emailNotifications ? "text-gray-400" : ""}>
                  Atualizações de produtos
                </Label>
                <Switch
                  id="product-updates"
                  checked={settings.productUpdates}
                  onCheckedChange={(checked) => handleSwitchChange("productUpdates", checked)}
                  disabled={!settings.emailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="security-alerts" className={!settings.emailNotifications ? "text-gray-400" : ""}>
                  Alertas de segurança
                </Label>
                <Switch
                  id="security-alerts"
                  checked={settings.securityAlerts}
                  onCheckedChange={(checked) => handleSwitchChange("securityAlerts", checked)}
                  disabled={!settings.emailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="marketing-emails" className={!settings.emailNotifications ? "text-gray-400" : ""}>
                  E-mails de marketing
                </Label>
                <Switch
                  id="marketing-emails"
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => handleSwitchChange("marketingEmails", checked)}
                  disabled={!settings.emailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="order-updates" className={!settings.emailNotifications ? "text-gray-400" : ""}>
                  Atualizações de pedidos
                </Label>
                <Switch
                  id="order-updates"
                  checked={settings.orderUpdates}
                  onCheckedChange={(checked) => handleSwitchChange("orderUpdates", checked)}
                  disabled={!settings.emailNotifications}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium">Frequência da Newsletter</h3>

            <RadioGroup
              value={settings.newsletterFrequency}
              onValueChange={(value) => handleRadioChange("newsletterFrequency", value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Diária</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Semanal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Mensal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="never" />
                <Label htmlFor="never">Nunca</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving} className="bg-orange-600 hover:bg-orange-700">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Preferências
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
