"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Facebook, Instagram, Linkedin, Twitter, Trash2, MapPin, Edit, Loader2, Mail, Youtube, Link as LinkIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useNotify } from "@/contexts/notification-context"
import { uploadUnitImage, deletePublicFile } from "@/lib/storage"
import { addUnitImage, getPrimaryUnitImage, getMultipleUnitsPrimaryImages, replacePrimaryUnitImage } from "@/lib/unit-images"
import { DebugSystem } from "@/components/admin/debug-system"
import { createNotification } from "@/lib/notifications"

export function SettingsForm() {
  const notify = useNotify()
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const unitImageInputRef = useRef<HTMLInputElement>(null)

  // Estado para controlar uploads
  const [uploadingUnitImage, setUploadingUnitImage] = useState(false)
  const [uploadingUnitId, setUploadingUnitId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // Adicionar novos estados para SMTP e rastreamento
  const [activeTab, setActiveTab] = useState("general")
  const [smtpLogs, setSmtpLogs] = useState<string[]>([])
  const [testingConnection, setTestingConnection] = useState(false)
  const [sendingTestEmail, setSendingTestEmail] = useState(false)
  const [connectionSuccess, setConnectionSuccess] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [showTestEmailModal, setShowTestEmailModal] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "Grupo Central",
    email: "contato@grupocentral.com.br",
    phone: "(66) 3421-5555",
    address: "Av. Principal, 1234 - Centro, Rondonópolis - MT",
    workingHours: "Segunda a Sexta: 8h às 18h | Sábado: 8h às 12h",
    facebook: "https://facebook.com/grupocentral",
    instagram: "https://instagram.com/grupocentral",
    linkedin: "https://linkedin.com/company/grupocentral",
    twitter: "",
    youtube: "",
    otherSocial: "",
    facebook_enabled: true,
    instagram_enabled: true,
    linkedin_enabled: true,
    twitter_enabled: false,
    youtube_enabled: false,
    otherSocial_enabled: false,
    siteTitle: "Grupo Central - Distribuidora de Autopeças e Baterias",
    siteDescription:
      "Distribuidora de autopeças e baterias com o que há de mais moderno em peças para seu veículo. Presente em Rondonópolis, Primavera do Leste e Barra do Garças.",
    siteKeywords: "autopeças, baterias, peças automotivas, caminhões, jupiter, rondonópolis",
    notificationEmail: "notificacoes@grupocentral.com.br",
    emailSender: "Grupo Central <noreply@grupocentral.com.br>",

    // Adicionar dados SMTP
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    smtpSecure: "tls",

    // Adicionar dados de rastreamento
    googleAnalyticsId: "",
    facebookPixelId: "",

    // Adicionar dados de layout
    showPrices: true,
    themeColor: "#f97316",

    // Adicionar dados de branding
    favicon: "",
    logo: "",
    logo_dark: "", // Adicionado campo para logo do modo escuro
    icon: "",
  })

  // Estado para gerenciar as unidades
  const [units, setUnits] = useState<any[]>([])

  // Estado para o formulário de nova unidade
  const [newUnit, setNewUnit] = useState({
    name: "",
    address: "",
    email: "",
    workingHours: "",
    whatsapp: "",
    googleMapsLink: "",
    image: "/placeholder.svg?height=400&width=600&text=Nova Unidade",
    operating_hours: {
      monday: [{ open: '07:30', close: '17:30' }],
      tuesday: [{ open: '07:30', close: '17:30' }],
      wednesday: [{ open: '07:30', close: '17:30' }],
      thursday: [{ open: '07:30', close: '17:30' }],
      friday: [{ open: '07:30', close: '17:30' }],
      saturday: [{ open: '07:30', close: '11:30' }],
      sunday: 'closed'
    }
  })

  // Estado para controlar se estamos editando uma unidade existente
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null)

  // Buscar configurações do banco de dados
  useEffect(() => {
    async function loadSettings() {
      try {
        console.log('🔄 Carregando configurações do banco...')

        const { data, error } = await supabase
          .from('settings')
          .select('*')

        if (error) {
          console.error('❌ Erro ao carregar configurações:', error)
          return
        }

        console.log('📋 Configurações carregadas:', data)

        // Aplicar configurações carregadas ao formData
        if (data && data.length > 0) {
          const settingsMap = data.reduce((acc: any, setting: any) => {
            acc[setting.key] = setting.value
            return acc
          }, {})

          console.log('🗂️ Mapa de configurações:', settingsMap)

          setFormData(prev => ({
            ...prev,
            companyName: settingsMap.site_name || prev.companyName,
            email: settingsMap.contact_email || prev.email,
            phone: settingsMap.contact_phone || prev.phone,
            address: settingsMap.contact_address || prev.address,
            workingHours: settingsMap.working_hours || prev.workingHours,
            facebook: settingsMap.facebook_url || prev.facebook,
            instagram: settingsMap.instagram_url || prev.instagram,
            linkedin: settingsMap.linkedin_url || prev.linkedin,
            twitter: settingsMap.twitter_url || prev.twitter,
            youtube: settingsMap.youtube_url || "",
            otherSocial: settingsMap.other_social_url || "",
            facebook_enabled: settingsMap.facebook_enabled === 'true',
            instagram_enabled: settingsMap.instagram_enabled === 'true',
            linkedin_enabled: settingsMap.linkedin_enabled === 'true',
            twitter_enabled: settingsMap.twitter_enabled === 'true',
            youtube_enabled: settingsMap.youtube_enabled === 'true',
            otherSocial_enabled: settingsMap.other_social_enabled === 'true',
            siteDescription: settingsMap.site_description || prev.siteDescription,
            siteKeywords: settingsMap.site_keywords || prev.siteKeywords,
            notificationEmail: settingsMap.notification_email || prev.notificationEmail,
            emailSender: settingsMap.email_sender || prev.emailSender,
            smtpHost: settingsMap.smtp_host || prev.smtpHost,
            smtpPort: settingsMap.smtp_port || prev.smtpPort,
            smtpUser: settingsMap.smtp_user || prev.smtpUser,
            smtpPassword: settingsMap.smtp_password || prev.smtpPassword,
            smtpSecure: settingsMap.smtp_secure || prev.smtpSecure,
            googleAnalyticsId: settingsMap.google_analytics_id || prev.googleAnalyticsId,
            facebookPixelId: settingsMap.facebook_pixel_id || prev.facebookPixelId,
            showPrices: settingsMap.show_prices === 'true' || settingsMap.show_prices === true,
            themeColor: settingsMap.theme_color || prev.themeColor,
            // Campos de branding
            siteTitle: settingsMap.site_title || prev.siteTitle,
            favicon: settingsMap.favicon || prev.favicon,
            logo: settingsMap.logo || prev.logo,
            logo_dark: settingsMap.logo_dark || prev.logo_dark || '', // Adicionado campo para logo do modo escuro
            icon: settingsMap.icon || prev.icon,
          }))

          console.log('✅ Configurações aplicadas ao formulário')
        }
      } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error)
      }
    }

    loadSettings()
  }, [supabase])

  // Buscar unidades do banco de dados
  useEffect(() => {
    async function fetchUnits() {
      try {
        const { data, error } = await supabase.from("units").select("*")

        if (error) {
          console.error("Erro ao buscar unidades:", error)
          return
        }

        if (data) {
          // Buscar imagens primárias de todas as unidades
          const unitIds = data.map(unit => unit.id)
          const unitImages = await getMultipleUnitsPrimaryImages(unitIds)

          setUnits(
            data.map((unit) => ({
              id: unit.id,
              name: unit.name,
              address: unit.address,
              email: unit.email,
              workingHours: unit.working_hours,
              whatsapp: unit.phone || "",
              googleMapsLink: unit.maps_url || "",
              // Priorizar imagem da tabela unit_images
              image: unitImages[unit.id]?.image_url || unit.image_url || "/placeholder.svg?height=400&width=600&text=Unidade",
              operating_hours: unit.operating_hours || {
                monday: [{ open: '07:30', close: '17:30' }],
                tuesday: [{ open: '07:30', close: '17:30' }],
                wednesday: [{ open: '07:30', close: '17:30' }],
                thursday: [{ open: '07:30', close: '17:30' }],
                friday: [{ open: '07:30', close: '17:30' }],
                saturday: [{ open: '07:30', close: '11:30' }],
                sunday: 'closed'
              },
              // Manter referência aos dados originais
              ...unit
            }))
          )
        }
      } catch (error) {
        console.error("Erro ao buscar unidades:", error)
      }
    }

    fetchUnits()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Função para adicionar log SMTP
  const addSmtpLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR')
    const logEntry = `[${timestamp}] ${message}`
    setSmtpLogs(prev => [...prev, logEntry])
  }

  // Função para limpar logs SMTP
  const clearSmtpLogs = () => {
    setSmtpLogs([])
  }

  // Função para testar conexão SMTP
  const testSmtpConnection = async () => {
    if (!formData.smtpHost || !formData.smtpPort || !formData.smtpUser || !formData.smtpPassword) {
      addSmtpLog("❌ Erro: Preencha todos os campos SMTP antes de testar a conexão")
      return
    }

    setTestingConnection(true)
    setConnectionSuccess(false)
    addSmtpLog("🔄 Tentando conectar ao servidor SMTP...")

    try {
      const response = await fetch('/api/admin/smtp-test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: formData.smtpHost,
          port: formData.smtpPort,
          user: formData.smtpUser,
          pass: formData.smtpPassword,
          encryption: formData.smtpSecure
        })
      })

      const result = await response.json()

      if (result.success) {
        addSmtpLog("✅ " + result.message)
        setConnectionSuccess(true)
      } else {
        addSmtpLog("❌ " + result.message)
        setConnectionSuccess(false)
      }
    } catch (error: any) {
      addSmtpLog("❌ Erro na requisição: " + error.message)
      setConnectionSuccess(false)
    } finally {
      setTestingConnection(false)
    }
  }

  // Função para enviar e-mail de teste
  const sendTestEmail = async () => {
    if (!testEmail) {
      addSmtpLog("❌ Erro: Digite um e-mail para teste")
      return
    }

    setSendingTestEmail(true)
    addSmtpLog(`📧 Enviando e-mail de teste para ${testEmail}...`)

    try {
      const response = await fetch('/api/admin/smtp-send-test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: formData.smtpHost,
          port: formData.smtpPort,
          user: formData.smtpUser,
          pass: formData.smtpPassword,
          encryption: formData.smtpSecure,
          testEmail: testEmail
        })
      })

      const result = await response.json()

      if (result.success) {
        addSmtpLog("✅ " + result.message)
        setShowTestEmailModal(false)
        setTestEmail("")
      } else {
        addSmtpLog("❌ " + result.message)
      }
    } catch (error: any) {
      addSmtpLog("❌ Erro na requisição: " + error.message)
    } finally {
      setSendingTestEmail(false)
    }
  }

  // Função para testar diferentes domínios
  const testDomains = async () => {
    if (!testEmail) {
      addSmtpLog("❌ Erro: Digite um e-mail para teste")
      return
    }

    setSendingTestEmail(true)
    addSmtpLog(`🧪 Testando diferentes domínios para ${testEmail}...`)

    try {
      const response = await fetch('/api/admin/smtp-test-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: formData.smtpHost,
          port: formData.smtpPort,
          user: formData.smtpUser,
          pass: formData.smtpPassword,
          encryption: formData.smtpSecure,
          testEmail: testEmail
        })
      })

      const result = await response.json()

      if (result.success) {
        addSmtpLog("✅ Teste de domínios concluído:")
        result.results.forEach((test: any) => {
          if (test.success) {
            addSmtpLog(`  ✅ ${test.sender} - Sucesso (${test.messageId})`)
          } else {
            addSmtpLog(`  ❌ ${test.sender} - Erro: ${test.error}`)
          }
        })
      } else {
        addSmtpLog("❌ " + result.message)
      }
    } catch (error: any) {
      addSmtpLog("❌ Erro na requisição: " + error.message)
    } finally {
      setSendingTestEmail(false)
    }
  }

  // Função para teste simples (máxima entregabilidade)
  const testSimpleEmail = async () => {
    if (!testEmail) {
      addSmtpLog("❌ Erro: Digite um e-mail para teste")
      return
    }

    setSendingTestEmail(true)
    addSmtpLog(`📧 Enviando teste simples para ${testEmail}...`)

    try {
      const response = await fetch('/api/admin/smtp-test-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: formData.smtpHost,
          port: formData.smtpPort,
          user: formData.smtpUser,
          pass: formData.smtpPassword,
          encryption: formData.smtpSecure,
          testEmail: testEmail
        })
      })

      const result = await response.json()

      if (result.success) {
        addSmtpLog("✅ " + result.message)
      } else {
        addSmtpLog("❌ " + result.message)
      }
    } catch (error: any) {
      addSmtpLog("❌ Erro na requisição: " + error.message)
    } finally {
      setSendingTestEmail(false)
    }
  }

  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Se for o campo de link do Google Maps, garantir que comece com http
    if (name === 'googleMapsLink' && value && !value.startsWith('http')) {
      return // Não atualizar se não for uma URL válida
    }
    
    setNewUnit((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Funções para gerenciar horários de funcionamento
  const handleOperatingHoursChange = (day: string, value: any) => {
    setNewUnit((prev) => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: value
      }
    }))
  }

  const handleScheduleTimeChange = (day: string, index: number, field: 'open' | 'close', value: string) => {
    setNewUnit((prev) => {
      const daySchedule = prev.operating_hours[day as keyof typeof prev.operating_hours]
      if (Array.isArray(daySchedule)) {
        const newSchedule = [...daySchedule]
        newSchedule[index] = { ...newSchedule[index], [field]: value }
        return {
          ...prev,
          operating_hours: {
            ...prev.operating_hours,
            [day]: newSchedule
          }
        }
      }
      return prev
    })
  }

  const addScheduleTime = (day: string) => {
    setNewUnit((prev) => {
      const daySchedule = prev.operating_hours[day as keyof typeof prev.operating_hours]
      if (Array.isArray(daySchedule)) {
        return {
          ...prev,
          operating_hours: {
            ...prev.operating_hours,
            [day]: [...daySchedule, { open: '07:30', close: '17:30' }]
          }
        }
      }
      return prev
    })
  }

  const removeScheduleTime = (day: string, index: number) => {
    setNewUnit((prev) => {
      const daySchedule = prev.operating_hours[day as keyof typeof prev.operating_hours]
      if (Array.isArray(daySchedule) && daySchedule.length > 1) {
        const newSchedule = daySchedule.filter((_, i) => i !== index)
        return {
          ...prev,
          operating_hours: {
            ...prev.operating_hours,
            [day]: newSchedule
          }
        }
      }
      return prev
    })
  }

  const handleAddUnit = async () => {
    try {
      console.log('🏢 [FRONTEND] Iniciando cadastro de unidade...')
      console.log('📋 [FRONTEND] Dados da unidade:', newUnit)

      // Validar campos obrigatórios no frontend
      if (!newUnit.name || !newUnit.address || !newUnit.email) {
        console.log('❌ [FRONTEND] Campos obrigatórios ausentes')
        notify.error(
          "Campos Obrigatórios",
          "Por favor, preencha todos os campos obrigatórios (Nome, Endereço e Email)."
        )
        return
      }

      if (editingUnitId) {
        // Lógica para atualizar unidade existente
        console.log('🔄 [FRONTEND] Atualizando unidade existente:', editingUnitId);
        console.log('📝 [FRONTEND] Dados da unidade para atualização:', {
          id: editingUnitId,
          name: newUnit.name,
          address: newUnit.address,
          email: newUnit.email,
          phone: newUnit.whatsapp,
          maps_url: newUnit.googleMapsLink,
          image_url: newUnit.image,
          operating_hours: newUnit.operating_hours
        });

        try {
          const response = await fetch('/api/admin/units', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editingUnitId,
              name: newUnit.name,
              address: newUnit.address,
              city: 'Cuiabá',
              state: 'MT',
              email: newUnit.email,
              phone: newUnit.whatsapp,
              postal_code: null,
              latitude: null,
              longitude: null,
              maps_url: newUnit.googleMapsLink,
              operating_hours: newUnit.operating_hours
            })
          });

          console.log('📡 [FRONTEND] Response status:', response.status);

          if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch (e) {
              errorData = { error: 'Erro de comunicação com o servidor', details: `Status: ${response.status}` };
            }
            console.error('❌ [FRONTEND] Erro na API (PUT):', errorData);
            notify.error(
              "Erro ao Atualizar",
              `Erro: ${errorData.error || 'Erro desconhecido'}\nDetalhes: ${errorData.details || 'Nenhum detalhe disponível'}`
            );
            return;
          }

          const result = await response.json();
          console.log('✅ [FRONTEND] Unidade atualizada:', result);

          // Salvar imagem na tabela unit_images se houver uma nova imagem
          if (newUnit.image && !newUnit.image.includes("placeholder.svg")) {
            console.log('💾 [UNIT IMAGE] Substituindo imagem primária da unidade:', editingUnitId)

            const savedImage = await replacePrimaryUnitImage(
              editingUnitId,
              newUnit.image,
              `Imagem da unidade ${newUnit.name}`
            )

            if (savedImage) {
              console.log('✅ [UNIT IMAGE] Imagem substituída com sucesso:', savedImage)
              notify.success(
                "Imagem Atualizada",
                "Imagem da unidade foi atualizada com sucesso!"
              )
            } else {
              console.warn('⚠️ [UNIT IMAGE] Falha ao salvar imagem, mas unidade foi atualizada')
              notify.warning(
                "Aviso",
                "Unidade atualizada, mas houve problema ao salvar a imagem."
              )
            }
          }

          // Atualizar estado local com os dados retornados da API
          setUnits(prevUnits =>
            prevUnits.map(unit =>
              unit.id === editingUnitId ? {
                ...result,
                id: editingUnitId,
                // Usar a imagem do estado local (que pode ser nova)
                image: newUnit.image || "/placeholder.svg?height=400&width=600&text=Unidade"
              } : unit
            )
          );
          
          // Resetar formulário
          setNewUnit({
            name: "",
            address: "",
            email: "",
            workingHours: "",
            whatsapp: "",
            googleMapsLink: "",
            image: "/placeholder.svg?height=400&width=600&text=Nova Unidade",
            operating_hours: {
              monday: [{ open: '07:30', close: '17:30' }],
              tuesday: [{ open: '07:30', close: '17:30' }],
              wednesday: [{ open: '07:30', close: '17:30' }],
              thursday: [{ open: '07:30', close: '17:30' }],
              friday: [{ open: '07:30', close: '17:30' }],
              saturday: [{ open: '07:30', close: '11:30' }],
              sunday: 'closed'
            }
          });
          
          setEditingUnitId(null);

          notify.success(
            "Unidade Atualizada",
            `A unidade "${newUnit.name}" foi atualizada com sucesso!`
          );
          
          // Recarregar a lista de unidades
          router.refresh();
          
        } catch (error) {
          console.error('❌ [FRONTEND] Erro ao atualizar unidade:', error);
          notify.error(
            "Erro ao Atualizar",
            "Ocorreu um erro ao atualizar a unidade. Tente novamente."
          );
        }
      } else {
        // Lógica para criar nova unidade
        console.log('➕ [FRONTEND] Criando nova unidade com dados:', {
          name: newUnit.name,
          address: newUnit.address,
          email: newUnit.email,
          phone: newUnit.whatsapp,
          maps_url: newUnit.googleMapsLink,
          image_url: newUnit.image,
          operating_hours: newUnit.operating_hours
        });

        try {
          const response = await fetch('/api/admin/units', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newUnit.name,
              address: newUnit.address,
              city: 'Cuiabá',
              state: 'MT',
              email: newUnit.email,
              phone: newUnit.whatsapp,
              postal_code: null,
              latitude: null,
              longitude: null,
              maps_url: newUnit.googleMapsLink,
              operating_hours: newUnit.operating_hours,
              image_url: newUnit.image !== "/placeholder.svg?height=400&width=600&text=Nova Unidade" ? newUnit.image : null
            })
          });

          console.log('📡 [FRONTEND] Response status:', response.status);

          if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch (e) {
              errorData = { error: 'Erro de comunicação com o servidor', details: `Status: ${response.status}` };
            }
            console.error('❌ [FRONTEND] Erro na API (POST):', errorData);
            notify.error(
              "Erro ao Criar",
              `Erro: ${errorData.error || 'Erro desconhecido'}\nDetalhes: ${errorData.details || 'Nenhum detalhe disponível'}`
            );
            return;
          }

          const result = await response.json();
          console.log('✅ [FRONTEND] Nova unidade criada:', result);

          // Salvar imagem na tabela unit_images se houver uma nova imagem
          if (newUnit.image && !newUnit.image.includes("placeholder.svg")) {
            console.log('💾 [UNIT IMAGE] Salvando imagem da nova unidade:', result.id)

            const savedImage = await addUnitImage(
              result.id,
              newUnit.image,
              `Imagem da unidade ${newUnit.name}`,
              true // Definir como imagem primária
            )

            if (savedImage) {
              console.log('✅ [UNIT IMAGE] Imagem da nova unidade salva com sucesso:', savedImage)
            } else {
              console.warn('⚠️ [UNIT IMAGE] Falha ao salvar imagem da nova unidade')
            }
          }

          // Atualizar estado local
          setUnits(prevUnits => [...prevUnits, {
            ...result,
            // Usar a imagem do estado local se houver
            image: newUnit.image || "/placeholder.svg?height=400&width=600&text=Unidade"
          }]);
          
          // Resetar formulário
          setNewUnit({
            name: "",
            address: "",
            email: "",
            workingHours: "",
            whatsapp: "",
            googleMapsLink: "",
            image: "/placeholder.svg?height=400&width=600&text=Nova Unidade",
            operating_hours: {
              monday: [{ open: '07:30', close: '17:30' }],
              tuesday: [{ open: '07:30', close: '17:30' }],
              wednesday: [{ open: '07:30', close: '17:30' }],
              thursday: [{ open: '07:30', close: '17:30' }],
              friday: [{ open: '07:30', close: '17:30' }],
              saturday: [{ open: '07:30', close: '11:30' }],
              sunday: 'closed'
            }
          });

          notify.success(
            "Nova Unidade Criada",
            `A unidade "${result.name}" foi adicionada com sucesso!`
          );
          
          // Recarregar a lista de unidades
          router.refresh();
          
        } catch (error) {
          console.error('❌ [FRONTEND] Erro ao criar unidade:', error);
          notify.error(
            "Erro ao Criar",
            "Ocorreu um erro ao criar a unidade. Tente novamente."
          );
        }
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Erro inesperado:', error);
      notify.error(
        "Erro",
        "Ocorreu um erro inesperado. Por favor, tente novamente."
      );
    }
  }

  const handleEditUnit = async (id: number) => {
    const unitToEdit = units.find((unit) => unit.id === id)
    if (unitToEdit) {
      console.log('🔍 [DEBUG] Unidade para edição:', unitToEdit);

      // Buscar imagem primária da unidade
      const primaryImage = await getPrimaryUnitImage(id)
      console.log('🖼️ [DEBUG] Imagem primária encontrada:', primaryImage)

      setNewUnit({
        name: unitToEdit.name || '',
        address: unitToEdit.address || '',
        email: unitToEdit.email || '',
        workingHours: unitToEdit.workingHours || '',
        // Garantir que o link do Google Maps seja definido corretamente
        googleMapsLink: unitToEdit.maps_url || unitToEdit.googleMapsLink || '',
        // Usar imagem da tabela unit_images ou fallback
        image: primaryImage?.image_url || "/placeholder.svg?height=400&width=600&text=Unidade",
        // Garantir que o whatsapp seja definido corretamente
        whatsapp: unitToEdit.phone || unitToEdit.whatsapp || '',
        // Garantir que os horários de funcionamento sejam definidos corretamente
        operating_hours: unitToEdit.operating_hours || {
          monday: [{ open: '07:30', close: '17:30' }],
          tuesday: [{ open: '07:30', close: '17:30' }],
          wednesday: [{ open: '07:30', close: '17:30' }],
          thursday: [{ open: '07:30', close: '17:30' }],
          friday: [{ open: '07:30', close: '17:30' }],
          saturday: [{ open: '07:30', close: '11:30' }],
          sunday: 'closed'
        }
      })
      setEditingUnitId(id)

      // Rolar para o topo do formulário
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDeleteUnit = async (id: number) => {
    const unitToDelete = units.find((unit) => unit.id === id)

    if (window.confirm(`Tem certeza que deseja excluir a unidade "${unitToDelete?.name}"?`)) {
      try {
        // Deletar do banco de dados
        const { error } = await supabase.from("units").delete().eq("id", id)

        if (error) throw error

        // Atualizar estado local
        setUnits(units.filter((unit) => unit.id !== id))
        notify.success("Unidade Excluída", `A unidade "${unitToDelete?.name}" foi excluída com sucesso!`)
      } catch (error) {
        console.error("Erro ao excluir unidade:", error)
        notify.error("Erro ao Excluir", "Ocorreu um erro ao excluir a unidade. Tente novamente.")
      }
    }
  }

  const handleUnitImageUpload = (unitId: number) => {
    setUploadingUnitId(unitId)
    unitImageInputRef.current?.click()
  }

  const handleUnitImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || uploadingUnitId === null) return

    try {
      setUploadingUnitImage(true)
      const file = files[0]

      // Encontrar a unidade atual
      const currentUnit = editingUnitId !== null ? newUnit : units.find((unit) => unit.id === uploadingUnitId)

      if (!currentUnit) return

      // Excluir imagem anterior se não for placeholder
      if (currentUnit.image && !currentUnit.image.includes("placeholder.svg")) {
        try {
          await deletePublicFile("unit-images", currentUnit.image)
        } catch (error) {
          console.warn("Erro ao deletar imagem anterior:", error)
        }
      }

      // Upload da nova imagem
      const fileExt = file.name.split(".").pop()
      const fileName = `unit-${uploadingUnitId}-${Date.now()}.${fileExt}`

      const { url, error } = await uploadUnitImage(file, fileName)

      if (error) throw error

      if (url) {
        // Apenas atualizar preview no estado local (não salvar ainda)
        if (editingUnitId !== null) {
          setNewUnit((prev) => ({ ...prev, image: url }))
        } else {
          setUnits(units.map((unit) => (unit.id === uploadingUnitId ? { ...unit, image: url } : unit)))
        }

        notify.success(
          "Imagem Carregada",
          "Imagem carregada com sucesso! Clique em 'Atualizar Unidade' para salvar."
        )

        toast({
          title: "Imagem carregada",
          description: "Imagem carregada com sucesso! Clique em 'Atualizar Unidade' para salvar.",
        })
      }
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error)

      // Notificação de erro para upload
      notify.error(
        "Erro no Upload",
        "Ocorreu um erro ao fazer upload da imagem. Tente novamente."
      )

      toast({
        title: "Erro ao atualizar imagem",
        description: "Ocorreu um erro ao fazer upload da imagem.",
        variant: "destructive",
      })
    } finally {
      setUploadingUnitImage(false)
      setUploadingUnitId(null)
      if (unitImageInputRef.current) {
        unitImageInputRef.current.value = ""
      }
    }
  }

  const getSettingsForTab = (tab: string) => {
    switch (tab) {
      case 'general':
        return [
          { key: 'site_name', value: formData.companyName },
          { key: 'contact_email', value: formData.email },
          { key: 'contact_phone', value: formData.phone },
          { key: 'contact_address', value: formData.address },
          { key: 'working_hours', value: formData.workingHours }
        ]
      case 'social':
        return [
          { key: 'facebook_url', value: formData.facebook },
          { key: 'instagram_url', value: formData.instagram },
          { key: 'instagram_enabled', value: formData.instagram_enabled.toString() },
          { key: 'linkedin_url', value: formData.linkedin },
          { key: 'linkedin_enabled', value: formData.linkedin_enabled.toString() },
          { key: 'twitter_url', value: formData.twitter },
          { key: 'twitter_enabled', value: formData.twitter_enabled.toString() },
          { key: 'youtube_url', value: formData.youtube },
          { key: 'youtube_enabled', value: formData.youtube_enabled.toString() },
          { key: 'other_social_url', value: formData.otherSocial },
          { key: 'other_social_enabled', value: formData.otherSocial_enabled.toString() }
        ]
      case 'seo':
        return [
          { key: 'site_title', value: formData.siteTitle },
          { key: 'site_description', value: formData.siteDescription },
          { key: 'site_keywords', value: formData.siteKeywords }
        ]
      case 'email':
        return [
          { key: 'notification_email', value: formData.notificationEmail },
          { key: 'email_sender', value: formData.emailSender }
        ]
      case 'smtp':
        return [
          { key: 'smtp_host', value: formData.smtpHost },
          { key: 'smtp_port', value: formData.smtpPort },
          { key: 'smtp_user', value: formData.smtpUser },
          { key: 'smtp_password', value: formData.smtpPassword },
          { key: 'smtp_secure', value: formData.smtpSecure }
        ]
      case 'tracking':
        return [
          { key: 'google_analytics_id', value: formData.googleAnalyticsId },
          { key: 'facebook_pixel_id', value: formData.facebookPixelId }
        ]
      case 'layout':
        return [
          { key: 'show_prices', value: formData.showPrices.toString() },
          { key: 'theme_color', value: formData.themeColor },
          { key: 'site_title', value: formData.siteTitle },
          { key: 'favicon', value: formData.favicon },
          { key: 'logo', value: formData.logo },
          { key: 'logo_dark', value: formData.logo_dark || '' }, // Adicionado logo_dark
          { key: 'icon', value: formData.icon }
        ]
      default:
        return []
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔗 [SETTINGS FORM] handleSubmit invocado')
    console.log('📋 [SETTINGS FORM] Aba ativa:', activeTab)
    console.log('📋 [SETTINGS FORM] Dados do formulário:', formData)

    setSaving(true)

    try {
      console.log(`💾 [SETTINGS FORM] Salvando configurações da aba: ${activeTab}`)

      // Obter apenas as configurações da aba ativa
      const settingsToSave = getSettingsForTab(activeTab)

      console.log('📋 [SETTINGS FORM] Configurações a serem salvas:', settingsToSave)

      // Salvar cada configuração da aba ativa
      for (const setting of settingsToSave) {
        console.log(`🔧 [SETTINGS FORM] Salvando: ${setting.key} = ${setting.value}`)

        const { data, error } = await supabase
          .from('settings')
          .upsert(setting, { onConflict: 'key' })
          .select()

        if (error) {
          console.error(`❌ [SETTINGS FORM] Erro ao salvar ${setting.key}:`, error)
          throw error
        }

        console.log(`✅ [SETTINGS FORM] ${setting.key} salvo com sucesso:`, data)
      }

      // Notificação de sucesso específica para a aba
      const tabNames = {
        general: 'Gerais',
        social: 'Redes Sociais',
        seo: 'SEO',
        email: 'Email',
        smtp: 'SMTP',
        tracking: 'Rastreamento',
        layout: 'Layout'
      }

      const tabName = tabNames[activeTab as keyof typeof tabNames] || activeTab

      const notificationTitle = "Configurações Salvas"
      const notificationMessage = `As configurações de ${tabName} foram salvas com sucesso!`
      notify.success(notificationTitle, notificationMessage)

      // Criar notificação no sistema
      const adminUserId = 'uuid-do-admin'; // SUBSTITUIR PELA LÓGICA REAL
      await createNotification({
        user_id: adminUserId,
        title: notificationTitle,
        message: notificationMessage,
        type: 'success'
      })

      toast({
        title: "Configurações salvas",
        description: `As configurações de ${tabName} foram salvas com sucesso.`,
      })

      // Recarregar configurações após salvar para confirmar persistência
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      notify.error(
        "Erro ao Salvar",
        "Ocorreu um erro ao salvar as configurações. Tente novamente."
      )

      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border ">
      <div className="border-b  dark:border-gray-700">
        <div className="p-4">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "general" ? "bg-orange-100 text-orange-500 dark:bg-orange-900/50 dark:text-orange-400" : " hover: hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"}`}
              onClick={() => setActiveTab("general")}
            >
              Geral
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "units" ? "bg-orange-100 text-orange-500 dark:bg-orange-900/50 dark:text-orange-400" : " hover: hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"}`}
              onClick={() => setActiveTab("units")}
            >
              Unidades
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "social" ? "bg-orange-100 text-orange-500 dark:bg-orange-900/50 dark:text-orange-400" : " hover: hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"}`}
              onClick={() => setActiveTab("social")}
            >
              Redes Sociais
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "seo" ? "bg-orange-100 text-orange-500 dark:bg-orange-900/50 dark:text-orange-400" : " hover: hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"}`}
              onClick={() => setActiveTab("seo")}
            >
              SEO
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "email" ? "bg-orange-100 text-orange-500 dark:bg-orange-900/50 dark:text-orange-400" : " hover: hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"}`}
              onClick={() => setActiveTab("email")}
            >
              Email
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "smtp" ? "bg-orange-100 text-orange-500 dark:bg-orange-900/50 dark:text-orange-400" : " hover: hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"}`}
              onClick={() => setActiveTab("smtp")}
            >
              SMTP
            </button>

            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "tracking" ? "bg-orange-100 text-orange-500 dark:bg-orange-900/50 dark:text-orange-400" : " hover: hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"}`}
              onClick={() => setActiveTab("tracking")}
            >
              Rastreamento
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "layout" ? "bg-orange-100 text-orange-500 dark:bg-orange-900/50 dark:text-orange-400" : " hover: hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"}`}
              onClick={() => setActiveTab("layout")}
            >
              Layout
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "debug" ? "bg-orange-100 text-orange-500 dark:bg-orange-900/50 dark:text-orange-400" : " hover: hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"}`}
              onClick={() => setActiveTab("debug")}
            >
              Debug
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium mb-1">
                  Nome da Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email de Contato <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">
                  Endereço <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="workingHours" className="block text-sm font-medium mb-1">
                  Horário de Funcionamento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="workingHours"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  required
                />
              </div>
            </div>
          )}

          {activeTab === "units" && (
            <div className="space-y-6">
              {/* Formulário de Adicionar/Editar Unidade */}
              <div className="bg-zantrix border rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b ">
                  <h3 className="text-lg font-medium ">
                    {editingUnitId ? "Editar Unidade" : "Adicionar Nova Unidade"}
                  </h3>
                </div>

                <div className="p-6">
                  {/* Container das duas colunas principais */}
                  <div className="form-columns-wrapper flex flex-col lg:flex-row gap-8 mb-8">

                    {/* Coluna Esquerda - Informações Básicas */}
                    <div className="form-column flex-1 min-w-0">
                      <div className="card-panel bg-card border  rounded-lg p-6">
                        <h4 className="text-md font-semibold  mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Informações Básicas
                        </h4>

                        <div className="space-y-4">
                          <div className="form-group">
                            <label htmlFor="unitName" className="block text-sm font-medium  mb-2">
                              Nome da Unidade <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="unitName"
                              name="name"
                              value={newUnit.name}
                              onChange={handleUnitChange}
                              className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="unitAddress" className="block text-sm font-medium  mb-2">
                              Endereço <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="unitAddress"
                              name="address"
                              value={newUnit.address}
                              onChange={handleUnitChange}
                              className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="unitEmail" className="block text-sm font-medium  mb-2">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              id="unitEmail"
                              name="email"
                              value={newUnit.email}
                              onChange={handleUnitChange}
                              className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="unitWhatsapp" className="block text-sm font-medium  mb-2">
                              Número de WhatsApp <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="unitWhatsapp"
                              name="whatsapp"
                              value={newUnit.whatsapp}
                              onChange={handleUnitChange}
                              className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                              placeholder="5566999999999"
                              required
                            />
                            <p className="mt-1 text-xs ">
                              Formato: código do país + DDD + número (ex: 5566999999999)
                            </p>
                          </div>

                          <div className="form-group">
                            <label htmlFor="unitGoogleMapsLink" className="block text-sm font-medium  mb-2">
                              Link para Google Maps <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="url"
                              id="unitGoogleMapsLink"
                              name="googleMapsLink"
                              value={newUnit.googleMapsLink}
                              onChange={handleUnitChange}
                              className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>




                    {/* Coluna Direita - Horários de Funcionamento */}
                    <div className="form-column flex-1 min-w-0">
                      <div className="card-panel bg-card border  rounded-lg p-6">
                        <h4 className="text-md font-semibold  mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Horários de Funcionamento
                        </h4>

                        <div className="space-y-3">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                            const dayNames = {
                              monday: 'Segunda-feira',
                              tuesday: 'Terça-feira',
                              wednesday: 'Quarta-feira',
                              thursday: 'Quinta-feira',
                              friday: 'Sexta-feira',
                              saturday: 'Sábado',
                              sunday: 'Domingo'
                            };

                            const daySchedule = newUnit.operating_hours?.[day as keyof typeof newUnit.operating_hours] || [];
                            const isClosed = daySchedule === 'closed' || (Array.isArray(daySchedule) && daySchedule.length === 0);

                            return (
                              <div key={day} className="flex items-center space-x-4 bg-zantrix p-3 rounded border ">
                                <div className="w-24 text-sm font-medium ">
                                  {dayNames[day as keyof typeof dayNames]}
                                </div>

                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={isClosed}
                                    onChange={(e) => handleOperatingHoursChange(day, e.target.checked ? 'closed' : [{ open: '07:30', close: '17:30' }])}
                                    className="mr-2 h-4 w-4 text-orange-500 focus:ring-orange-500  rounded"
                                  />
                                  <span className="text-sm ">Fechado</span>
                                </label>

                                {!isClosed && (
                                  <div className="flex-1 space-y-2">
                                    {Array.isArray(daySchedule) && daySchedule.map((schedule, index) => (
                                      <div key={index} className="flex items-center space-x-2">
                                        <input
                                          type="time"
                                          value={schedule.open}
                                          onChange={(e) => handleScheduleTimeChange(day, index, 'open', e.target.value)}
                                          className="border  rounded px-2 py-1 text-sm focus:ring-orange-500 focus:border-orange-500"
                                        />
                                        <span className="">às</span>
                                        <input
                                          type="time"
                                          value={schedule.close}
                                          onChange={(e) => handleScheduleTimeChange(day, index, 'close', e.target.value)}
                                          className="border  rounded px-2 py-1 text-sm focus:ring-orange-500 focus:border-orange-500"
                                        />
                                        {daySchedule.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => removeScheduleTime(day, index)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => addScheduleTime(day)}
                                      className="text-orange-500 hover:text-orange-700 text-sm font-medium"
                                    >
                                      + Adicionar horário
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção da Foto da Unidade */}
                  <div className="form-section">
                    <div className="card-panel bg-card border  rounded-lg p-6">
                      <h4 className="text-md font-semibold  mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Foto da Unidade
                      </h4>

                      <div className="flex items-center space-x-4">
                        <div className="relative h-32 w-48 border  rounded-md overflow-hidden bg-gray-100">
                          <Image
                            src={newUnit.image || "/placeholder.svg"}
                            alt={`Foto da unidade ${newUnit.name || 'Nova unidade'}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            ref={unitImageInputRef}
                            onChange={handleUnitImageChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleUnitImageUpload(editingUnitId || 0)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-all duration-200 hover:scale-105 flex items-center"
                            disabled={uploadingUnitImage}
                          >
                            {uploadingUnitImage && uploadingUnitId === (editingUnitId || 0) ? (
                              <>
                                <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Selecionar Imagem
                              </>
                            )}
                          </button>
                          <p className="mt-2 text-xs ">
                            Tamanho recomendado: 600x400px<br />
                            Formatos aceitos: JPG, PNG, WebP
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="form-actions mt-8 pt-6 border-t  flex justify-end space-x-3">
                    {editingUnitId && (
                      <button
                        type="button"
                        className="px-6 py-2 border  rounded-md  hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                        onClick={() => {
                          setEditingUnitId(null)
                          setNewUnit({
                            name: "",
                            address: "",
                            email: "",
                            workingHours: "",
                            whatsapp: "",
                            googleMapsLink: "",
                            image: "/placeholder.svg?height=400&width=600&text=Nova Unidade",
                            operating_hours: {
                              monday: [{ open: '07:30', close: '17:30' }],
                              tuesday: [{ open: '07:30', close: '17:30' }],
                              wednesday: [{ open: '07:30', close: '17:30' }],
                              thursday: [{ open: '07:30', close: '17:30' }],
                              friday: [{ open: '07:30', close: '17:30' }],
                              saturday: [{ open: '07:30', close: '11:30' }],
                              sunday: 'closed'
                            }
                          })
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddUnit}
                      className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-all duration-200 hover:scale-105 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {editingUnitId ? "Atualizar Unidade" : "Adicionar Unidade"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-zantrix border rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium  mb-4">Unidades Cadastradas</h3>
                {units.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y ">
                      <thead className="bg-card">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider"
                          >
                            Unidade
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider"
                          >
                            Endereço
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider"
                          >
                            Contato
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider"
                          >
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y">
                        {units.map((unit) => (
                          <tr key={unit.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 relative">
                                  <Image
                                    src={unit.image || "/placeholder.svg"}
                                    alt={`Foto da unidade ${unit.name}`}
                                    fill
                                    className="object-cover rounded-md"
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium ">{unit.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm ">{unit.address}</div>
                              <div className="text-sm  flex items-center mt-1">
                                <MapPin size={14} className="mr-1" />
                                <a
                                  href={unit.googleMapsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-500 hover:text-orange-600"
                                >
                                  Ver no mapa
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm ">{unit.email}</div>
                              <div className="text-sm ">WhatsApp: {unit.whatsapp}</div>
                              <div className="text-sm ">{unit.workingHours}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => handleUnitImageUpload(unit.id)}
                                className="text-blue-500 hover:text-blue-600 mr-3 transition-all duration-200 hover:scale-110"
                                disabled={uploadingUnitImage}
                              >
                                {uploadingUnitImage && uploadingUnitId === unit.id ? (
                                  <Loader2 size={18} className="animate-spin" />
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                                    <line x1="16" y1="5" x2="22" y2="5"></line>
                                    <line x1="19" y1="2" x2="19" y2="8"></line>
                                    <circle cx="9" cy="9" r="2"></circle>
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                                  </svg>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleEditUnit(unit.id);
                                }}
                                className="text-orange-500 hover:text-orange-600 mr-3 transition-all duration-200 hover:scale-110"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteUnit(unit.id)}
                                className="text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="">Nenhuma unidade cadastrada no momento.</p>
                    <p className=" text-sm mt-1">
                      Use o formulário acima para adicionar uma nova unidade.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "social" && (
            <div className="space-y-4">
              {[
                { name: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
                { name: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
                { name: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
                { name: 'twitter', label: 'Twitter', icon: Twitter, color: 'text-blue-400' },
                { name: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
                { name: 'otherSocial', label: 'Outra Rede', icon: LinkIcon, color: '' }
              ].map((social) => {
                const key = social.name as keyof typeof formData
                const enabledKey = `${social.name}_enabled` as keyof typeof formData

                return (
                  <div key={social.name} className="flex items-center justify-between p-4 border  rounded-md">
                    <div className="flex-1 pr-4">
                      <label htmlFor={social.name} className="block text-sm font-medium mb-1">
                        <social.icon className={`inline-block mr-2 ${social.color}`} size={18} />
                        {social.label}
                      </label>
                      <input
                        type="url"
                        id={social.name}
                        name={social.name}
                        value={formData[key] as string}
                        onChange={handleChange}
                        className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 disabled:bg-card"
                        disabled={!(formData[enabledKey] as boolean)}
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id={enabledKey}
                          name={enabledKey}
                          checked={formData[enabledKey] as boolean}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after: after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-6">
              <div>
                <label htmlFor="siteTitle" className="block text-sm font-medium mb-1">
                  Título do Site <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="siteTitle"
                  name="siteTitle"
                  value={formData.siteTitle}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  required
                />
                <p className="mt-1 text-sm ">
                  Recomendado: até 60 caracteres. Atual: {formData.siteTitle.length}
                </p>
              </div>

              <div>
                <label htmlFor="siteDescription" className="block text-sm font-medium mb-1">
                  Descrição do Site <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={formData.siteDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  required
                ></textarea>
                <p className="mt-1 text-sm ">
                  Recomendado: até 160 caracteres. Atual: {formData.siteDescription.length}
                </p>
              </div>

              <div>
                <label htmlFor="siteKeywords" className="block text-sm font-medium mb-1">
                  Palavras-chave
                </label>
                <input
                  type="text"
                  id="siteKeywords"
                  name="siteKeywords"
                  value={formData.siteKeywords}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                />
                <p className="mt-1 text-sm ">Separe as palavras-chave por vírgulas</p>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-6">
              <div>
                <label htmlFor="notificationEmail" className="block text-sm font-medium mb-1">
                  Email para Notificações <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="notificationEmail"
                  name="notificationEmail"
                  value={formData.notificationEmail}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  required
                />
                <p className="mt-1 text-sm ">Email para onde serão enviadas as notificações do sistema</p>
              </div>

              <div>
                <label htmlFor="emailSender" className="block text-sm font-medium mb-1">
                  Nome do Remetente <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="emailSender"
                  name="emailSender"
                  value={formData.emailSender}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  required
                />
                <p className="mt-1 text-sm ">Formato: Nome &lt;email@exemplo.com&gt;</p>
              </div>
            </div>
          )}

          {activeTab === "smtp" && (
            <div className="space-y-6">
              <div>
                <label htmlFor="smtpHost" className="block text-sm font-medium mb-1">
                  Servidor SMTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="smtpHost"
                  name="smtpHost"
                  value={formData.smtpHost}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  placeholder="Ex: smtp.gmail.com"
                />
              </div>

              <div>
                <label htmlFor="smtpPort" className="block text-sm font-medium mb-1">
                  Porta SMTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="smtpPort"
                  name="smtpPort"
                  value={formData.smtpPort}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  placeholder="Ex: 587"
                />
              </div>

              <div>
                <label htmlFor="smtpUser" className="block text-sm font-medium mb-1">
                  Usuário SMTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="smtpUser"
                  name="smtpUser"
                  value={formData.smtpUser}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  placeholder="Ex: seu.email@gmail.com"
                />
              </div>

              <div>
                <label htmlFor="smtpPassword" className="block text-sm font-medium mb-1">
                  Senha SMTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="smtpPassword"
                  name="smtpPassword"
                  value={formData.smtpPassword}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="smtpSecure" className="block text-sm font-medium mb-1">
                  Segurança <span className="text-red-500">*</span>
                </label>
                <select
                  id="smtpSecure"
                  name="smtpSecure"
                  value={formData.smtpSecure}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                >
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">Nenhuma</option>
                </select>
              </div>

              {/* Seção de Teste de Conexão SMTP */}
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium  mb-4 flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Teste de Conexão SMTP
                </h3>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={testSmtpConnection}
                    disabled={testingConnection}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {testingConnection ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Testando Conexão...
                      </span>
                    ) : (
                      "Testar Conexão"
                    )}
                  </button>

                  {connectionSuccess && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="Digite um e-mail para teste"
                          className="flex-1 border  rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={sendTestEmail}
                          disabled={sendingTestEmail || !testEmail}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {sendingTestEmail ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Enviando...
                            </span>
                          ) : (
                            "Enviar E-mail de Teste"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção de Logs SMTP */}
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium  flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Logs do SMTP
                  </h4>
                  <button
                    type="button"
                    onClick={clearSmtpLogs}
                    className="text-xs  hover: px-2 py-1 border  rounded"
                  >
                    Limpar
                  </button>
                </div>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono max-h-60 overflow-y-auto">
                  {smtpLogs.length === 0 ? (
                    <div className="">Nenhum log disponível. Execute um teste de conexão para ver os logs.</div>
                  ) : (
                    smtpLogs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "tracking" && (
            <div className="space-y-6">
              <div>
                <label htmlFor="googleAnalyticsId" className="block text-sm font-medium mb-1">
                  ID do Google Analytics (GTM)
                </label>
                <input
                  type="text"
                  id="googleAnalyticsId"
                  name="googleAnalyticsId"
                  value={formData.googleAnalyticsId}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  placeholder="Ex: GTM-XXXXXXX"
                />
                <p className="mt-1 text-sm ">
                  Insira o ID do Google Tag Manager para rastrear as visitas do site.
                </p>
              </div>

              <div>
                <label htmlFor="facebookPixelId" className="block text-sm font-medium mb-1">
                  ID do Pixel do Facebook
                </label>
                <input
                  type="text"
                  id="facebookPixelId"
                  name="facebookPixelId"
                  value={formData.facebookPixelId}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  placeholder="Ex: 123456789012345"
                />
                <p className="mt-1 text-sm ">
                  Insira o ID do Pixel do Facebook para rastrear conversões e eventos.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium  mb-2">Códigos de Rastreamento</h3>
                <p className="text-sm  mb-4">
                  Os códigos de rastreamento serão automaticamente inseridos nas páginas do seu site quando você salvar
                  as configurações.
                </p>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm ">
                      {formData.googleAnalyticsId ? "Google Analytics ativo" : "Google Analytics inativo"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm ">
                      {formData.facebookPixelId ? "Facebook Pixel ativo" : "Facebook Pixel inativo"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "layout" && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-md">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Configurações de Layout</h3>
                <p className="text-sm text-blue-600">
                  Configure a aparência e comportamento visual do site.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border  rounded-md">
                <div>
                  <label htmlFor="showPrices" className="block text-sm font-medium ">
                    Exibir Preços dos Produtos
                  </label>
                  <p className="text-sm  mt-1">
                    Quando desabilitado, será exibida a mensagem "Consulte com a unidade"
                  </p>
                </div>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="showPrices"
                      name="showPrices"
                      checked={formData.showPrices || false}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after: after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="themeColor" className="block text-sm font-medium mb-1">
                  Cor Principal do Tema
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    id="themeColor"
                    name="themeColor"
                    value={formData.themeColor || "#f97316"}
                    onChange={handleChange}
                    className="h-10 w-20 border  rounded-md"
                  />
                  <input
                    type="text"
                    value={formData.themeColor || "#f97316"}
                    onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                    className="flex-1 border  rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="#f97316"
                  />
                </div>
                <p className="mt-1 text-sm ">
                  Esta cor será usada em botões, links e elementos de destaque do site.
                </p>
              </div>

              {/* Seção de Branding Global */}
              <div className="p-4 bg-orange-50 rounded-md">
                <h3 className="text-sm font-medium text-orange-700 mb-2">🎨 Branding Global</h3>
                <p className="text-sm text-orange-600">
                  Configure a identidade visual do site que será aplicada globalmente.
                </p>
              </div>

              <div>
                <label htmlFor="siteTitle" className="block text-sm font-medium mb-1">
                  Título do Site <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="siteTitle"
                  name="siteTitle"
                  value={formData.siteTitle}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  placeholder="Ex: Grupo Central - Distribuidora de Autopeças"
                  required
                />
                <p className="mt-1 text-sm ">
                  Título que aparecerá na aba do navegador e nos resultados de busca.
                </p>
              </div>

              <div>
                <label htmlFor="favicon" className="block text-sm font-medium mb-1">
                  Favicon (Ícone da Aba)
                </label>
                <input
                  type="url"
                  id="favicon"
                  name="favicon"
                  value={formData.favicon}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  placeholder="https://exemplo.com/favicon.ico"
                />
                <p className="mt-1 text-sm ">
                  URL do ícone que aparecerá na aba do navegador (16x16px ou 32x32px, formato .ico ou .png).
                </p>
              </div>

              <div>
                <label htmlFor="logo" className="block text-sm font-medium mb-1">
                  Logo Principal
                </label>
                <input
                  type="url"
                  id="logo"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  placeholder="https://exemplo.com/logo.png"
                />
                <p className="mt-1 text-sm ">
                  URL do logotipo principal usado no header e outras áreas importantes (recomendado: 200x60px).
                  Use uma versão branca ou clara do logo para melhor visibilidade em fundos escuros.
                </p>
              </div>

              <div>
                <label htmlFor="logo_dark" className="block text-sm font-medium mb-1">
                  Logo Principal Modo Escuro
                </label>
                <input
                  type="url"
                  id="logo_dark"
                  name="logo_dark"
                  value={formData.logo_dark || ""}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  placeholder="https://exemplo.com/logo-dark.png"
                />
                <p className="mt-1 text-sm ">
                  URL do logotipo para modo escuro (recomendado: 200x60px).
                  Use uma versão escura ou com cores invertidas para melhor contraste em fundos claros.
                </p>
                <div className="mt-2 p-3 bg-gray-100 rounded-md">
                  <p className="text-xs text-gray-600">
                    <strong>Dica:</strong> Se não for especificada uma logo para modo escuro, a logo principal será usada em todos os temas.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="icon" className="block text-sm font-medium mb-1">
                  Ícone da Marca
                </label>
                <input
                  type="url"
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  placeholder="https://exemplo.com/icon.png"
                />
                <p className="mt-1 text-sm ">
                  URL do ícone menor usado em menus mobile e elementos compactos (recomendado: 40x40px).
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium  mb-2">Prévia das Configurações</h3>
                <div className="bg-zantrix p-3 rounded border">
                  <p className="font-medium">Bateria Jupiter 60Ah</p>
                  {formData.showPrices ? (
                    <p className="text-lg font-bold" style={{ color: formData.themeColor || "#f97316" }}>
                      R$ 299,90
                    </p>
                  ) : (
                    <p className="text-sm ">Consulte com a unidade</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "debug" && (
            <DebugSystem />
          )}
        </div>

        <div className="p-6 border-t  flex justify-end">
          <button
            type="submit"
            disabled={saving || activeTab === 'debug'}
            onClick={(e) => {
              console.log('🖱️ [SETTINGS FORM] Botão submit clicado!')
              console.log('📋 [SETTINGS FORM] Aba ativa no clique:', activeTab)
              console.log('📋 [SETTINGS FORM] Dados no clique:', formData)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Salvando...
              </>
            ) : (
              (() => {
                const tabNames = {
                  general: 'Configurações Gerais',
                  social: 'Redes Sociais',
                  seo: 'Configurações SEO',
                  email: 'Configurações de Email',
                  smtp: 'Configurações SMTP',
                  tracking: 'Configurações de Rastreamento',
                  layout: 'Configurações de Layout',
                  units: 'Configurações de Unidades',
                  debug: 'Debug (Somente Leitura)'
                }
                return `Salvar ${tabNames[activeTab as keyof typeof tabNames] || 'Configurações'}`
              })()
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
