import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UnitSelector } from "@/components/unit-selector"
import Image from "next/image"
import Link from "next/link"
import { Check, Battery, BatteryCharging, Zap, MessageCircle, Star, Shield, Award } from "lucide-react"

export default function Baterias() {

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <div className="relative w-full h-[400px] md:h-[400px]">
        {/* Imagem para desktop (acima de 768px) */}
        <div className="hidden md:block h-full w-full">
          <Image 
            src="/images/Paginas/Zantrix_1920x448_Central_PC_PG_BATERIA.jpg" 
            alt="Baterias de Qualidade" 
            fill 
            className="object-cover" 
            priority
            sizes="100vw"
          />
        </div>
        
        {/* Imagem para mobile (abaixo de 768px) */}
        <div className="md:hidden h-full w-full">
          <Image 
            src="/images/Paginas/Zantrix_Central_Celular_PG_BATERIA.jpg" 
            alt="Baterias de Qualidade" 
            fill 
            className="object-cover" 
            priority
            sizes="100vw"
          />
        </div>
        
        <div className="absolute inset-0 from-black/70 to-black/30 flex items-end md:items-center justify-center pb-20 md:pb-0">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-6xl font-bold mb-2 md:mb-4">Baterias de Qualidade</h1>
            <p className="text-lg md:text-2xl font-light">Distribuidor oficial Júpiter, Moura e Bosch</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 bg-background">
        {/* Seção de Marcas */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">Marcas de Confiança</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-12">
            Trabalhamos com as melhores marcas do mercado para garantir qualidade, durabilidade e desempenho superior.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Bateria Júpiter */}
            <div className="bg-card rounded-2xl shadow-lg p-8 border hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-10 w-10 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">Bateria Júpiter</h3>
                <p className="text-muted-foreground mb-6">
                  Excelente custo-benefício com qualidade comprovada para veículos nacionais e importados.
                </p>
                <div className="flex justify-center space-x-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>Custo-Benefício</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-green-500 mr-1" />
                    <span>Garantia Nacional</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bateria Moura */}
            <div className="bg-card rounded-2xl shadow-lg p-8 border hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Battery className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">Bateria Moura</h3>
                <p className="text-muted-foreground mb-6">
                  Líder nacional em baterias automotivas, com mais de 60 anos de tradição e inovação.
                </p>
                <div className="flex justify-center space-x-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>Qualidade Premium</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-green-500 mr-1" />
                    <span>Garantia Estendida</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bateria Bosch */}
            <div className="bg-card rounded-2xl shadow-lg p-8 border hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BatteryCharging className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">Bateria Bosch</h3>
                <p className="text-muted-foreground mb-6">
                  Tecnologia alemã de ponta, reconhecida mundialmente pela excelência e durabilidade.
                </p>
                <div className="flex justify-center space-x-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-purple-500 mr-1" />
                    <span>Tecnologia Alemã</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 text-orange-500 mr-1" />
                    <span>Alta Performance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Vantagens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">

            <Image 
            src="/images/Paginas/Zantrix_pg_Baterias_01.jpg" 
            alt="Baterias Premium" 
            fill 
            className="object-cover" 
            priority
            sizes="100vw"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center">
              <Zap className="mr-3 " />
              Por que escolher nossas baterias?
            </h2>

            <ul className="space-y-6">
              <li className="flex items-start">
                <Check className="mr-3 text-green-500 mt-1 flex-shrink-0" size={24} />
                <span className="text-muted-foreground">
                  <strong className="font-semibold text-lg text-foreground">Alta Durabilidade:</strong> Projetadas para durar mais tempo, mesmo
                  em condições adversas e climas extremos.
                </span>
              </li>

              <li className="flex items-start">
                <Check className="mr-3 text-green-500 mt-1 flex-shrink-0" size={24} />
                <span className="text-muted-foreground">
                  <strong className="font-semibold text-lg text-foreground">Tecnologia Avançada:</strong> Utilizam a mais moderna tecnologia
                  para garantir desempenho superior e partida confiável.
                </span>
              </li>

              <li className="flex items-start">
                <Check className="mr-3 text-green-500 mt-1 flex-shrink-0" size={24} />
                <span className="text-muted-foreground">
                  <strong className="font-semibold text-lg text-foreground">Garantia Estendida:</strong> Oferecemos garantia superior à média do
                  mercado com suporte técnico especializado.
                </span>
              </li>

              <li className="flex items-start">
                <Check className="mr-3 text-green-500 mt-1 flex-shrink-0" size={24} />
                <span className="text-muted-foreground">
                  <strong className="font-semibold text-lg text-foreground">Baixa Manutenção:</strong> Reduzem a necessidade de manutenção
                  frequente, economizando tempo e dinheiro.
                </span>
              </li>

              <li className="flex items-start">
                <Check className="mr-3 text-green-500 mt-1 flex-shrink-0" size={24} />
                <span className="text-muted-foreground">
                  <strong className="font-semibold text-lg text-foreground">Assistência Técnica:</strong> Suporte técnico especializado em todas
                  as nossas unidades com equipe qualificada.
                </span>
              </li>
            </ul>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/loja?categoria=baterias"
                className="inline-flex items-center justify-center bg-cliente hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold text-lg"
              >
                Ver Todas as Baterias
              </Link>

              <UnitSelector
                trigger={
                  <button className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold text-lg">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Falar com Consultor
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {/* Seção de Serviços */}

        <div className="bg-muted p-8 rounded-lg shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Serviços para Baterias</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <BatteryCharging className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center text-card-foreground">Teste de Bateria</h3>
              <p className="text-muted-foreground text-center">
                Realizamos testes gratuitos para verificar o estado da sua bateria e prevenir problemas.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center text-card-foreground">Troca de Bateria</h3>
              <p className="text-muted-foreground text-center">
                Serviço rápido e eficiente de substituição de baterias, com descarte adequado da bateria antiga.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center text-card-foreground">Garantia Estendida</h3>
              <p className="text-muted-foreground text-center">
                Oferecemos garantia estendida para todas as baterias, proporcionando maior tranquilidade.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="text-center bg-gradient-to-r bg-cliente to-orange-600 rounded-2xl p-12 text-black">
          <h2 className="text-black text-3xl font-bold mb-6">Precisa de Ajuda para Escolher a Bateria Ideal?</h2>
          <p className="text-black max-w-3xl mx-auto mb-8 text-lg">
            Nossa equipe especializada está pronta para ajudar você a encontrar a bateria perfeita para o seu veículo ou
            equipamento. Entre em contato conosco ou visite uma de nossas unidades.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <UnitSelector
              trigger={
                <button className="bg-white text-black-600 hover:bg-gray-100 px-8 py-4 rounded-lg transition-colors font-semibold text-lg">
                  <MessageCircle className="inline mr-2 h-5 w-5" />
                  Falar com Consultor
                </button>
              }
            />

            <Link
              href="/unidades"
              className="bg-black text-white px-8 py-4 rounded-lg transition-colors font-semibold text-lg"
            >
              Nossas Unidades
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
