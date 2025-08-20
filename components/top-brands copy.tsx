"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"

interface Brand {
  id: number
  name: string
  logoLight: string
  logoDark: string
}

export function TopBrands() {
  const { theme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Lista de marcas com versões para tema claro e escuro
  const brands: Brand[] = [
    {
      id: 1,
      name: "Fabricante - 1",
      logoLight: "/images/brands/Logo-FABRICANTES-1.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-1.jpg"
    },
    {
      id: 2,
      name: "Fabricante - 2",
      logoLight: "/images/brands/Logo-FABRICANTES-2.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-2.jpg"
    },
    {
      id: 3,
      name: "Fabricante - 3",
      logoLight: "/images/brands/Logo-FABRICANTES-3.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-3.jpg"
    },
    {
      id: 4,
      name: "Fabricante - 4",
      logoLight: "/images/brands/Logo-FABRICANTES-4.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-4.jpg"
    },
    {
      id: 5,
      name: "Fabricante - 5",
      logoLight: "/images/brands/Logo-FABRICANTES-5.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-5.jpg"
    },
    {
      id: 6,
      name: "Fabricante - 6",
      logoLight: "/images/brands/Logo-FABRICANTES-6.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-6.jpg"
    }
  ]

  // Duplicar as marcas para criar um efeito de loop contínuo
  const duplicatedBrands = [...brands, ...brands]

  // Efeito para garantir que o componente está montado (necessário para o tema)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Efeito para a animação do carrossel
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    let animationId: number
    let isPaused = false
    let position = 0
    const speed = 0.8 // velocidade do carrossel (pixels por frame)

    const animate = () => {
      if (!isPaused && carousel) {
        position += speed

        // Quando chegar na metade, voltar para o início para criar efeito infinito
        const halfWidth = carousel.scrollWidth / 2
        if (position >= halfWidth) {
          position = 0
        }

        carousel.scrollLeft = position
      }
      animationId = requestAnimationFrame(animate)
    }
    
    // Iniciar animação
    animationId = requestAnimationFrame(animate)

    // Pausar no hover
    const handleMouseEnter = () => { isPaused = true }
    const handleMouseLeave = () => { isPaused = false }

    carousel.addEventListener("mouseenter", handleMouseEnter)
    carousel.addEventListener("mouseleave", handleMouseLeave)

    // Limpar animação quando o componente for desmontado
    return () => {
      cancelAnimationFrame(animationId)
      carousel.removeEventListener("mouseenter", handleMouseEnter)
      carousel.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  // Função para obter a logo correta com base no tema
  const getLogo = useCallback((brand: Brand) => {
    if (!isMounted) return brand.logoLight // Retorna a logo clara por padrão até que o tema seja carregado
    return theme === 'dark' ? brand.logoDark : brand.logoLight
  }, [theme, isMounted])

  if (!isMounted) {
    return (
      <section className="py-12 bg-white dark:bg-background">
        <div className="h-20 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Carregando marcas...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-background transition-colors duration-300">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          As melhores marcas automotivas você encontra aqui!
        </h2>
        
        <div className="relative">
          <div 
            ref={carouselRef}
            className="flex items-center gap-8 overflow-hidden py-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {duplicatedBrands.map((brand, index) => (
              <div 
                key={`${brand.id}-${index}`}
                className="flex-shrink-0 w-40 h-20 relative transition-opacity hover:opacity-100"
              >
                <Image
                  src={getLogo(brand)}
                  alt={brand.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 10rem, 12rem"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
