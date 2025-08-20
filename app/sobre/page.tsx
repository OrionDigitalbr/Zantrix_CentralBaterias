import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"

export default function SobreNos() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="relative w-full h-[300px] md:h-[400px]">
        {/* Imagem para desktop (acima de 768px) */}
        <div className="hidden md:block h-full w-full">
          <Image 
            src="/images/Paginas/Zantrix_1920x448_Central_PC_PG_Sobre.jpg" 
            alt="Sobre o Grupo Central" 
            fill 
            className="object-cover" 
            priority
            sizes="100vw"
          />
        </div>
        
        {/* Imagem para mobile (abaixo de 768px) */}
        <div className="md:hidden h-full w-full">
          <Image 
            src="/images/Paginas/Zantrix_300x400_Central_Cell_PG_Sobre.jpg" 
            alt="Sobre o Grupo Central" 
            fill 
            className="object-cover" 
            priority
            sizes="100vw"
          />
        </div>
        
        <div className="absolute inset-0 from-black/70 to-black/30 flex items-center justify-center pb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Sobre Nós</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Nossa História</h2>
            <p className="text-muted-foreground mb-4">
              Inaugurada em março de 2005, a Central Distribuidora Autopeças e Baterias nasceu com o objetivo de
              oferecer produtos de alta qualidade para o setor automotivo na região de Mato Grosso.
            </p>
            <p className="text-muted-foreground mb-4">
              Ao longo dos anos, expandimos nossas operações para três cidades estratégicas: Rondonópolis, Primavera do
              Leste e Barra do Garças, consolidando nossa presença no mercado e ampliando nosso alcance.
            </p>
            <p className="text-muted-foreground">
              Hoje, o Grupo Central é reconhecido como referência no fornecimento de peças e baterias, atendendo não
              apenas Mato Grosso, mas também outros estados brasileiros.
            </p>
          </div>
          <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-lg ">
            <Image
              src="/images/Paginas/Sobre_Foto_Capa.jpg"
              alt="História do Grupo Central"
              fill
              style={{
                objectFit: 'cover',
                objectPosition: '90% center'
              }}
              sizes="100vw"
              priority
            />
          </div>
        </div>

        <div className="bg-muted p-8 rounded-lg shadow-sm mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Nossa Missão</h2>
          <p className="text-muted-foreground text-lg text-center max-w-3xl mx-auto">
            Fornecer soluções completas em autopeças e baterias, com produtos de qualidade e atendimento diferenciado,
            contribuindo para a segurança e satisfação de nossos clientes.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">O Que Oferecemos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center text-card-foreground">Qualidade Garantida</h3>
              <p className="text-muted-foreground text-center">
                Trabalhamos com as melhores marcas do mercado, oferecendo produtos de alta qualidade e com garantia.
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center text-card-foreground">Atendimento Especializado</h3>
              <p className="text-muted-foreground text-center">
                Nossa equipe é treinada para oferecer o melhor atendimento e encontrar a solução ideal para cada
                cliente.
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
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center text-card-foreground">Ampla Cobertura</h3>
              <p className="text-muted-foreground text-center">
                Com três unidades estrategicamente localizadas, atendemos todo o estado de Mato Grosso e regiões
                vizinhas.
              </p>
            </div>
          </div>
        </div>


      </div>

      <Footer />
    </main>
  )
}
