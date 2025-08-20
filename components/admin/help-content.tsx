"use client"

import { useState } from "react"
import { Search, ChevronDown, ChevronUp, MessageSquare, Mail, Phone, FileText, Video } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export function HelpContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      id: 1,
      question: "Como adicionar um novo produto?",
      answer:
        "Para adicionar um novo produto, acesse o menu 'Produtos' no painel lateral e clique no botão 'Adicionar Produto'. Preencha todos os campos obrigatórios, adicione imagens e especificações do produto, e clique em 'Salvar Produto'.",
    },
    {
      id: 2,
      question: "Como editar os slides do carrossel da página inicial?",
      answer:
        "Para editar os slides, acesse o menu 'Slides' no painel lateral. Lá você poderá adicionar novos slides, editar os existentes, reordenar ou excluir. Para cada slide, você pode definir uma imagem, título, descrição e link.",
    },
    {
      id: 3,
      question: "Como adicionar um novo usuário ao sistema?",
      answer:
        "Para adicionar um novo usuário, acesse o menu 'Usuários' no painel lateral e clique no botão 'Adicionar Usuário'. Preencha os dados do usuário, defina um papel (nível de acesso) e clique em 'Salvar Usuário'.",
    },
    {
      id: 4,
      question: "Como alterar as informações de contato da empresa?",
      answer:
        "Para alterar as informações de contato, acesse o menu 'Configurações' no painel lateral. Na aba 'Geral', você encontrará campos para editar o nome da empresa, email, telefone, endereço e horário de funcionamento.",
    },
    {
      id: 5,
      question: "Como visualizar as estatísticas do site?",
      answer:
        "Para visualizar as estatísticas do site, acesse o menu 'Análise' no painel lateral. Lá você encontrará gráficos e dados sobre visualizações, produtos mais acessados, fontes de tráfego e taxa de conversão.",
    },
    {
      id: 6,
      question: "Esqueci minha senha. Como recuperá-la?",
      answer:
        "Na tela de login, clique no link 'Esqueceu sua senha?'. Você receberá um email com instruções para redefinir sua senha. Se não receber o email, verifique sua pasta de spam ou entre em contato com o administrador do sistema.",
    },
    {
      id: 7,
      question: "Como gerenciar as categorias de produtos?",
      answer:
        "Para gerenciar as categorias, acesse o menu 'Produtos' e depois 'Categorias'. Lá você poderá adicionar, editar ou excluir categorias e subcategorias. Lembre-se que uma categoria só pode ser excluída se não houver produtos associados a ela.",
    },
    {
      id: 8,
      question: "Como configurar as integrações com redes sociais?",
      answer:
        "Para configurar as integrações com redes sociais, acesse o menu 'Configurações' e depois a aba 'Integrações'. Você encontrará opções para conectar o site às principais redes sociais, como Facebook, Instagram e WhatsApp.",
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

  const handleStartChat = () => {
    toast({
      title: "Chat iniciado",
      description: "Um agente de suporte entrará em contato em breve.",
    })
  }

  const tutorials = [
    {
      id: 1,
      title: "Primeiros passos com o painel administrativo",
      description: "Aprenda a navegar e utilizar as principais funcionalidades do painel.",
      icon: FileText,
      type: "Guia",
    },
    {
      id: 2,
      title: "Como gerenciar produtos",
      description: "Tutorial completo sobre adição, edição e remoção de produtos.",
      icon: Video,
      type: "Vídeo",
    },
    {
      id: 3,
      title: "Configurando o sistema de vendas",
      description: "Aprenda a configurar preços, descontos e promoções.",
      icon: FileText,
      type: "Guia",
    },
    {
      id: 4,
      title: "Analisando relatórios de vendas",
      description: "Como interpretar e utilizar os dados de análise para melhorar seus resultados.",
      icon: Video,
      type: "Vídeo",
    },
  ]

  return (
    <Tabs defaultValue="faq" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="faq">Perguntas Frequentes</TabsTrigger>
        <TabsTrigger value="tutorials">Tutoriais</TabsTrigger>
        <TabsTrigger value="contact">Contato</TabsTrigger>
      </TabsList>

      <TabsContent value="faq">
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
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
                      <h3 className="text-lg font-medium text-gray-800">{faq.question}</h3>
                      {openFaq === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {openFaq === faq.id && (
                      <div className="p-4 bg-white">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum resultado encontrado para "{searchQuery}"</p>
                  <p className="text-gray-500 mt-2">Tente usar termos mais gerais ou entre em contato com o suporte</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tutorials">
        <Card>
          <CardHeader>
            <CardTitle>Tutoriais e Guias</CardTitle>
            <CardDescription>Aprenda a utilizar todas as funcionalidades do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map((tutorial) => (
                <Card key={tutorial.id} className="overflow-hidden">
                  <CardHeader className="p-4 bg-gray-50 flex flex-row items-center gap-3">
                    <tutorial.icon className="h-8 w-8 text-orange-500" />
                    <div>
                      <CardTitle className="text-base">{tutorial.title}</CardTitle>
                      <CardDescription className="text-xs">
                        <span className="inline-block bg-orange-100 text-orange-800 rounded-full px-2 py-0.5 text-xs font-medium">
                          {tutorial.type}
                        </span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-4">{tutorial.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      {tutorial.type === "Vídeo" ? "Assistir Vídeo" : "Ler Guia"}
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
                <p className="text-gray-600 mb-4">Ligue para nossa central de atendimento</p>
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
