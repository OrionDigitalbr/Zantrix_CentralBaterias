import Image from "next/image"
import Link from "next/link"
export function BatteryAdvantages() {
  return (
    <section className="relative py-16 min-h-[850px] md:min-h-0">
        <div className="absolute inset-0 z-0">
              <div className="hidden md:block h-full w-full">
                <Image
                  src="/images/home/Zantrix-GrupoCentral_Banner_PC_Bateria-Jupter---1280x448.jpg"
                  alt="Vantagens das Baterias Jupiter"
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              </div>
              {/* Versão para mobile (visível apenas em telas pequenas) */}
              <div className="md:hidden h-full w-full">
                <Image
                  src="/images/home/Zantrix-GrupoCentral_Banner_Cell_Bateria-Jupter.jpg"
                  alt="Vantagens das Baterias Jupiter - Mobile"
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              </div>
      </div> 
      <div className="container mx-auto px-4 relative z-10 flex flex-col min-h-[750px] md:min-h-0 h-full">
        {/* Layout mobile: conteúdo no final | Desktop: conteúdo à esquerda */}
        <div className="flex-1 flex flex-col justify-end md:justify-start md:items-end">
          <div className="max-w-xl w-full pb-8 md:pb-0">
            <h2 className="text-3xl font-bold text-white mb-4">VANTAGENS DAS BATERIAS JUPITER</h2>
            <p className="text-white text-lg mb-6">
              Excelente custo-benefício com qualidade comprovada para veículos nacionais e importados. Projetadas para durar mais tempo, mesmo em condições adversas e climas extremos.
            </p>
            <ul className="text-white mb-8 space-y-2">
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
                Alta durabilidade e resistência
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
                Tecnologia avançada
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
                Garantia estendida
              </li>
            </ul>
            <Link
              href="https://wa.me/5566999999999"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Falar com Consultor
          </Link>
          </div>
        </div>
      </div>
    </section>
  )
}