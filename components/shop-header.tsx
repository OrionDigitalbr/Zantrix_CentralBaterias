import Image from "next/image"
import { cn } from "@/lib/utils"

interface ShopHeaderProps {
  title: string
  description?: string
  /**
   * URL da imagem para desktop (acima de 768px)
   */
  desktopImageUrl?: string
  /**
   * URL da imagem para mobile (abaixo de 768px)
   * Se não for fornecida, usará a imagem de desktop
   */
  mobileImageUrl?: string
}

export function ShopHeader({
  title,
  description,
  desktopImageUrl = "/images/Paginas/Zantrix_1920x448_Central_PC_PG_LOJA.jpg",
  mobileImageUrl,
}: ShopHeaderProps) {
  const defaultMobileImage = "/images/Paginas/Modelo_Loja.jpg" // Você pode adicionar uma imagem específica para mobile aqui
  
  return (
    <div className="relative w-full h-[350px] md:h-[350px] mb-8 overflow-hidden rounded-lg">
      {/* Imagem para desktop (acima de 768px) */}
      <div className="hidden md:block">
        <Image 
          src={desktopImageUrl} 
          alt={title} 
          fill 
          className="object-cover" 
          priority 
          sizes="100vw"
        />
      </div>
      
      {/* Imagem para mobile (abaixo de 768px) */}
      <div className="md:hidden">
        <Image 
          src={mobileImageUrl || defaultMobileImage} 
          alt={title} 
          fill 
          className="object-cover" 
          priority
          sizes="100vw"
        />
      </div>
      
      {/* Sobreposição de gradiente e conteúdo */}
      <div className="absolute inset-0 from-black/70 to-black/30 flex items-end md:items-center">
        <div className="container mx-auto px-4 mb-4 md:mb-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{title}</h1>
          {description && <p className="text-lg text-white/90 max-w-2xl">{description}</p>}
        </div>
      </div>
    </div>
  )
}
