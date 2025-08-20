import Link from "next/link"
import Image from "next/image"

export function PointsProgram() {
  return (
    <section className="relative py-16 min-h-[800px] md:min-h-0">
      <div className="absolute inset-0 z-0">
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
        {/* Versão para mobile (visível apenas em telas pequenas) */}
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
      </div>
      <div className="container mx-auto px-4 relative z-10 flex flex-col min-h-[800px] md:min-h-0 h-full">
        {/* Layout mobile: conteúdo no final | Desktop: conteúdo centralizado */}
        <div className="flex-1 flex flex-col justify-end md:justify-center md:items-center">
          <div className="bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 p-8 rounded-lg shadow-lg max-w-3xl text-center w-full mb-8 md:mb-0">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">PROGRAMA DE PONTOS</h2>
            <div className="py-8">
              <span className="text-2xl font-bold ">EM BREVE</span>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                Estamos desenvolvendo um programa de fidelidade exclusivo para nossos clientes. Aguarde novidades!
              </p>
            </div>
            <Link
              href="/programa-pontos"
              className="inline-flex items-center bg-black hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Saiba Mais
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
