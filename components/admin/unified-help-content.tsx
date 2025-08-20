"use client"

import { useState } from "react"
import { Search, ChevronDown, ChevronUp, MessageSquare, Mail, Phone, FileText, Video, Book, HelpCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export function UnifiedHelpContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [openGuideSection, setOpenGuideSection] = useState<string | null>("getting-started")

  const faqs = [
    {
      id: 1,
      question: "Como adicionar um novo produto?",
      answer: "Para adicionar um novo produto, acesse o menu 'Produtos' no painel lateral e clique no botão 'Adicionar Produto'. Preencha todos os campos obrigatórios, adicione imagens e especificações do produto, e clique em 'Salvar Produto'.",
    },
    {
      id: 2,
      question: "Como editar os slides do carrossel da página inicial?",
      answer: "Para editar os slides, acesse o menu 'Slides' no painel lateral. Lá você poderá adicionar novos slides, editar os existentes, reordenar ou excluir. Para cada slide, você pode definir uma imagem, título, descrição e link.",
    },
    {
      id: 3,
      question: "Como adicionar um novo usuário ao sistema?",
      answer: "Para adicionar um novo usuário, acesse o menu 'Usuários' no painel lateral e clique no botão 'Adicionar Usuário'. Preencha os dados do usuário, defina um papel (nível de acesso) e clique em 'Salvar Usuário'.",
    },
    {
      id: 4,
      question: "Como alterar as informações de contato da empresa?",
      answer: "Para alterar as informações de contato, acesse o menu 'Configurações' no painel lateral. Na aba 'Geral', você encontrará campos para editar o nome da empresa, email, telefone, endereço e horário de funcionamento.",
    },
    {
      id: 5,
      question: "Como configurar as redes sociais?",
      answer: "Para configurar as redes sociais, acesse o menu 'Configurações' no painel lateral e vá para a aba 'Redes Sociais'. Lá você pode adicionar os links para Facebook, Instagram, LinkedIn e Twitter.",
    },
    {
      id: 6,
      question: "Como visualizar os relatórios de analytics?",
      answer: "Para visualizar os relatórios, acesse o menu 'Analytics' no painel lateral. Lá você encontrará dados sobre tráfego, produtos mais visualizados, conversões e muito mais.",
    },
    {
      id: 7,
      question: "Como gerenciar categorias de produtos?",
      answer: "Para gerenciar categorias, acesse o menu 'Produtos' e depois 'Categorias'. Você pode criar categorias principais e subcategorias para organizar melhor seus produtos.",
    },
    {
      id: 8,
      question: "Como configurar o sistema de notificações?",
      answer: "Para configurar notificações, acesse o menu 'Configurações' e vá para a aba 'Email'. Lá você pode definir o email para receber notificações e configurar o remetente.",
    }
  ]

  const tutorials = [
    {
      id: 1,
      title: "Primeiros passos com o painel administrativo",
      description: "Aprenda a navegar e utilizar as principais funcionalidades do painel.",
      icon: FileText,
      type: "Guia",
      status: "Em breve"
    },
    {
      id: 2,
      title: "Como gerenciar produtos",
      description: "Tutorial completo sobre adição, edição e remoção de produtos.",
      icon: Video,
      type: "Vídeo",
      status: "Em breve"
    },
    {
      id: 3,
      title: "Configurando o sistema de vendas",
      description: "Aprenda a configurar preços, descontos e promoções.",
      icon: FileText,
      type: "Guia",
      status: "Em breve"
    },
    {
      id: 4,
      title: "Analisando relatórios de vendas",
      description: "Como interpretar e utilizar os dados de análise para melhorar seus resultados.",
      icon: Video,
      type: "Vídeo",
      status: "Em breve"
    },
  ]

  const guideContent = [
    {
      id: "getting-started",
      title: "Primeiros Passos",
      content: (
        <div className="space-y-4">
          <p>
            Bem-vindo ao Painel Administrativo do Grupo Central. Este guia irá ajudá-lo a entender as funcionalidades
            disponíveis e como utilizá-las de forma eficiente.
          </p>
          <p>
            O painel administrativo é dividido em várias seções, cada uma responsável por um aspecto específico do site.
            No menu lateral, você encontrará links para todas as seções disponíveis.
          </p>
        </div>
      ),
    },
    {
      id: "products",
      title: "Gerenciamento de Produtos",
      content: (
        <div className="space-y-4">
          <p>
            Na seção de Produtos, você pode adicionar, editar e excluir produtos do catálogo. Cada produto pode ter
            várias imagens, especificações técnicas e características.
          </p>
          <h3 className="text-lg font-semibold mt-4">Adicionando um Produto</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Acesse a seção "Produtos" no menu lateral</li>
            <li>Clique no botão "Adicionar Produto"</li>
            <li>Preencha todos os campos obrigatórios (marcados com *)</li>
            <li>Adicione imagens do produto</li>
            <li>Defina as características e especificações técnicas</li>
            <li>Clique em "Salvar Produto"</li>
          </ol>
        </div>
      ),
    },
    {
      id: "analytics",
      title: "Análise e Relatórios",
      content: (
        <div className="space-y-4">
          <p>
            A seção de Análise fornece insights sobre o desempenho do site, incluindo visualizações de página, produtos
            mais acessados e conversões.
          </p>
          <h3 className="text-lg font-semibold mt-4">Relatórios Disponíveis</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Visão geral do tráfego (diário, semanal, mensal)</li>
            <li>Produtos mais visualizados</li>
            <li>Taxa de conversão (visualizações vs. contatos)</li>
            <li>Origem do tráfego (direto, orgânico, redes sociais)</li>
            <li>Dispositivos utilizados (desktop, mobile, tablet)</li>
          </ul>
        </div>
      ),
    },
    {
      id: "settings",
      title: "Configurações do Sistema",
      content: (
        <div className="space-y-4">
          <p>
            Na seção de Configurações, você pode personalizar diversos aspectos do site, como informações de contato,
            redes sociais e configurações de SEO.
          </p>
          <h3 className="text-lg font-semibold mt-4">Configurações Disponíveis</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Informações da empresa (nome, endereço, telefone, email)</li>
            <li>Links para redes sociais</li>
            <li>Configurações de SEO (título do site, descrição, palavras-chave)</li>
            <li>Configurações de email para notificações</li>
            <li>Horário de funcionamento</li>
          </ul>
        </div>
      ),
    },
  ]

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  const toggleGuideSection = (section: string) => {
    setOpenGuideSection(openGuideSection === section ? null : section)
  }

  const handleStartChat = () => {
    toast({
      title: "Chat iniciado",
      description: "Um agente de suporte entrará em contato em breve.",
    })
  }

  return (
    <Tabs defaultValue="guide" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="guide">Guia do Sistema</TabsTrigger>
        <TabsTrigger value="faq">Perguntas Frequentes</TabsTrigger>
        <TabsTrigger value="tutorials">Tutoriais</TabsTrigger>
        <TabsTrigger value="contact">Contato</TabsTrigger>
      </TabsList>

      <TabsContent value="guide">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-orange-500" />
              Guia do Sistema
            </CardTitle>
            <CardDescription>Instruções detalhadas para utilizar o painel administrativo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {guideContent.map((section) => (
                <div key={section.id} className="border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                    onClick={() => toggleGuideSection(section.id)}
                  >
                    <h2 className="text-lg font-semibold text-gray-800">{section.title}</h2>
                    {openGuideSection === section.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {openGuideSection === section.id && <div className="p-4">{section.content}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="faq">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-orange-500" />
              Perguntas Frequentes
            </CardTitle>
            <CardDescription>Encontre respostas para as dúvidas mais comuns</CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar na ajuda..."
                className="w-full border border-gray-300 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div key={faq.id} className="border rounded-lg overflow-hidden">
                    <button
                      className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none text-left"
                      onClick={() => toggleFaq(faq.id)}
                    >
                      <h3 className="font-medium text-gray-800">{faq.question}</h3>
                      {openFaq === faq.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {openFaq === faq.id && (
                      <div className="p-4 bg-white border-t">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhuma pergunta encontrada para "{searchQuery}"</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tutorials">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-orange-500" />
              Tutoriais e Guias
            </CardTitle>
            <CardDescription>Aprenda a utilizar todas as funcionalidades do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map((tutorial) => (
                <Card key={tutorial.id} className="overflow-hidden">
                  <CardHeader className="p-4 bg-gray-50 flex flex-row items-center gap-3">
                    <tutorial.icon className="h-8 w-8 text-orange-500" />
                    <div className="flex-1">
                      <CardTitle className="text-base">{tutorial.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        <span className="inline-block bg-orange-100 text-orange-800 rounded-full px-2 py-0.5 text-xs font-medium mr-2">
                          {tutorial.type}
                        </span>
                        <span className="inline-block bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                          {tutorial.status}
                        </span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-3">{tutorial.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled
                      className="w-full"
                    >
                      {tutorial.status}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contact">
        <Card>
          <CardHeader>
            <CardTitle>Precisa de mais ajuda?</CardTitle>
            <CardDescription>Entre em contato com nossa equipe de suporte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="flex justify-center mb-4">
                  <MessageSquare className="h-10 w-10 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Chat ao Vivo</h3>
                <p className="text-gray-600 mb-4">Converse com nossa equipe de suporte em tempo real</p>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleStartChat}>
                  Iniciar Chat
                </Button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="flex justify-center mb-4">
                  <Mail className="h-10 w-10 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Email</h3>
                <p className="text-gray-600 mb-4">Envie sua dúvida para nossa equipe de suporte</p>
                <a
                  href="mailto:suporte@grupocentral.com.br"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block"
                >
                  suporte@grupocentral.com.br
                </a>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="flex justify-center mb-4">
                  <Phone className="h-10 w-10 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Telefone</h3>
                <p className="text-gray-600 mb-4">Fale diretamente com nossa equipe de suporte</p>
                <a
                  href="tel:+556634215555"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block"
                >
                  (66) 3421-5555
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
