import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact-form"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"

export default async function Contato() {
  const supabase = createServerSupabaseClient()
  const { data: units, error } = await supabase.from("units").select("*").eq("active", true)

  if (error) {
    console.error("Erro ao buscar unidades:", error)
  }

  const hasUnits = units && units.length > 0

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="relative w-full h-[300px] md:h-[400px]">
        {/* Imagem para desktop (acima de 768px) */}
        <div className="hidden md:block h-full w-full">
          <Image 
            src="/images/Paginas/Zantrix_1920x448_Central_PC_PG_CONTATO.jpg" 
            alt="Contato" 
            fill 
            className="object-cover" 
            priority
            sizes="100vw"
          />
        </div>
        
        {/* Imagem para mobile (abaixo de 768px) */}
        <div className="md:hidden h-full w-full">
          <Image 
            src="/images/Paginas/Modelo_loja.jpg" 
            alt="Contato" 
            fill 
            className="object-cover" 
            priority
            sizes="100vw"
          />
        </div>
        
        <div className="absolute inset-0 from-black/70 to-black/30 flex items-end md:items-center justify-center pb-8 md:pb-0">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white">Contato</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">Entre em Contato Conosco</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Estamos à disposição para atender suas dúvidas, solicitações e fornecer informações sobre nossos produtos e
            serviços. Utilize o formulário abaixo ou entre em contato diretamente conosco.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 relative">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Envie uma Mensagem</h3>
            <div className="lg:sticky lg:top-32">
              <ContactForm />
            </div>
          </div>

          {hasUnits && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Nossas Unidades</h3>

              <div className="space-y-6">
                {units.map((unit) => (
                  <div key={unit.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h4 className="text-xl font-semibold mb-4 flex items-center text-gray-800 dark:text-gray-200">
                      <MapPin className="mr-2 text-orange-500" />
                      Unidade {unit.name}
                    </h4>

                    <div className="space-y-3">
                      <p className="text-gray-700 dark:text-gray-300 flex items-start">
                        <MapPin className="mr-2 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" size={18} />
                        <span>{unit.address}</span>
                      </p>

                      <p className="text-gray-700 dark:text-gray-300 flex items-center">
                        <Phone className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" size={18} />
                        <span>{unit.phone}</span>
                      </p>

                      <p className="text-gray-700 dark:text-gray-300 flex items-center">
                        <Mail className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" size={18} />
                        <span>{unit.email}</span>
                      </p>

                      <div className="text-gray-700 dark:text-gray-300 flex items-start">
                        <Clock className="mr-2 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" size={18} />
                        <div className="whitespace-pre-line">
                          {unit.working_hours || 'Segunda a Sexta: 08:00 às 18:00\nSábado: 08:00 às 12:00'}
                        </div>
                      </div>

                      <div className="pt-2">
                        <a
                          href={`https://wa.me/55${unit.phone?.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vim do site (página de Contato) e tenho algumas dúvidas.')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <MessageSquare className="mr-2" size={18} />
                          Falar pelo WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">Perguntas Frequentes</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Quais formas de pagamento são aceitas?</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Aceitamos pagamento em dinheiro, cartões de crédito e débito, PIX, transferência bancária e boleto. Para
                compras corporativas, oferecemos condições especiais de pagamento.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Vocês realizam entregas?</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Sim, realizamos entregas em toda a região. O prazo e valor do frete variam conforme a localidade e o
                volume da compra. Para mais informações, entre em contato conosco.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Como funciona a garantia dos produtos?</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Todos os nossos produtos possuem garantia do fabricante. As baterias Jupiter possuem garantia estendida.
                Em caso de problemas, basta trazer o produto e a nota fiscal para análise.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Vocês trabalham com peças importadas?</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Sim, trabalhamos com peças genuínas e similares dos principais fabricantes nacionais e importados.
                Consulte nossa equipe para verificar a disponibilidade do item que você procura.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
