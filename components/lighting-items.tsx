import Link from "next/link"
import Image from "next/image"

export function LightingItems() {
  return (
    <section className="relative py-16 min-h-[900px] md:min-h-0">
      <div className="absolute inset-0 z-0">
      <div className="hidden md:block h-full w-full">
        <Image
          src="/images/home/Zantrix-GrupoCentral_Banner_PC_Iluminacao---1920x448.jpg"
          alt="Itens de Iluminação - Desktop"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>
      {/* Versão para mobile (visível apenas em telas pequenas) */}
      <div className="md:hidden h-full w-full">
        <Image
          src="/images/home/Zantrix-GrupoCentral_Banner_Celular_Iluminacao.jpg"
          alt="Itens de Iluminação - Mobile"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>
    
      </div>
      <div className="container mx-auto px-4 relative z-10 flex flex-col min-h-[800px] md:min-h-0 h-full">
        {/* Layout mobile: conteúdo no final | Desktop: conteúdo à esquerda (4ª seção) */}
        <div className="flex-1 flex flex-col justify-end md:justify-start">
          <div className="max-w-xl w-full pb-8 md:pb-0">
            <h2 className="text-3xl font-bold text-black mb-4">ITENS DE ILUMINAÇÃO</h2>
            <p className="text-black text-lg mb-6">
              Oferecemos uma linha completa de produtos de iluminação para veículos leves e pesados, com tecnologia LED e
              alta durabilidade.
            </p>
            <ul className="text-black mb-8 space-y-2">
              <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 "
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Maior visibilidade e segurança
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 "
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Tecnologia LED de última geração
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 "
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Baixo consumo de energia
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 "
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Alta durabilidade
            </li>
            </ul>
            <Link
              href="/loja?categoria=iluminacao"
              className="inline-flex items-center bg-black hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
            >
              Ver Produtos de Iluminação
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
