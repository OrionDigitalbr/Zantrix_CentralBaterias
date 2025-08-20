import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"

export default function ProgramaPontos() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="relative w-full h-[300px] md:h-[400px]">
        {/* Imagem para desktop (acima de 768px) */}
        <div className="hidden md:block h-full w-full">
          <Image
            src="/images/home/Zantrix-GrupoCentral_Banner_PC_Programa-De-Pontos---1920x448.jpg"
            alt="Programa de Pontos"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        
        {/* Imagem para mobile (abaixo de 768px) */}
        <div className="md:hidden h-full w-full">
          <Image
            src="/images/home/Modelo_Mobile.jpg"
            alt="Programa de Pontos - Mobile"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        
        <div className="absolute inset-0 from-black/70 to-black/30 flex items-center justify-center pb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-black">Programa de Pontos</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-card p-12 rounded-lg shadow-lg">
            <h2 className="text-4xl font-bold mb-8">EM BREVE</h2>
            <p className="text-xl  mb-8">
              Estamos trabalhando no desenvolvimento do nosso programa de fidelidade exclusivo para clientes do Grupo
              Central.
            </p>
            <p className="text-lg  mb-12">
              Com o Programa de Pontos do Grupo Central, você acumulará pontos a cada compra e poderá trocá-los por
              descontos, produtos ou serviços exclusivos. Fique atento às nossas redes sociais para ser um dos primeiros
              a participar!
            </p>
            <div className="flex justify-center">
              <Link
                href="/"
                className="bg-cliente hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Voltar para a Página Inicial
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
