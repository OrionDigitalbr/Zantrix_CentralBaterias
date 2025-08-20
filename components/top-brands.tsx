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
    },
    {
      id: 7,
      name: "Fabricante - 7",
      logoLight: "/images/brands/Logo-FABRICANTES-7.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-7.jpg"
    },
    {
      id: 8,
      name: "Fabricante - 8",
      logoLight: "/images/brands/Logo-FABRICANTES-8.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-8.jpg"
    },
    {
      id: 9,
      name: "Fabricante - 9",
      logoLight: "/images/brands/Logo-FABRICANTES-9.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-9.jpg"
    },
    {
      id: 10,
      name: "Fabricante - 10",
      logoLight: "/images/brands/Logo-FABRICANTES-10.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-10.jpg"
    },
    {
      id: 11,
      name: "Fabricante - 11",
      logoLight: "/images/brands/Logo-FABRICANTES-11.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-11.jpg"
    },
    {
      id: 12,
      name: "Fabricante - 12",
      logoLight: "/images/brands/Logo-FABRICANTES-12.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-12.jpg"
    },
    {
      id: 13,
      name: "Fabricante - 13",
      logoLight: "/images/brands/Logo-FABRICANTES-13.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-13.jpg"
    },
    {
      id: 14,
      name: "Fabricante - 14",
      logoLight: "/images/brands/Logo-FABRICANTES-14.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-14.jpg"
    },
    {
      id: 15,
      name: "Fabricante - 15",
      logoLight: "/images/brands/Logo-FABRICANTES-15.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-15.jpg"
    },
    {
      id: 16,
      name: "Fabricante - 16",
      logoLight: "/images/brands/Logo-FABRICANTES-16.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-16.jpg"
    },
    {
      id: 17,
      name: "Fabricante - 17",
      logoLight: "/images/brands/Logo-FABRICANTES-17.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-17.jpg"
    },
    {
      id: 18,
      name: "Fabricante - 18",
      logoLight: "/images/brands/Logo-FABRICANTES-18.jpg",
      logoDark: "/images/brands/Logo-FABRICANTES-18.jpg"
    },
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
          Melhores peças das melhores marcas!
        </h2>
        
        <div className="relative w-full overflow-hidden group">
          {/* Gradiente esquerdo */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background via-background/90 via-10% to-transparent z-10 pointer-events-none" />
          {/* Gradiente direito */}
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background via-background/90 via-10% to-transparent z-10 pointer-events-none" />
          <div 
            ref={carouselRef}
            className="flex items-center py-4 whitespace-nowrap cursor-pointer px-4 sm:px-8 md:px-12"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              display: 'inline-flex',
              width: 'max-content',
              animation: 'scroll 80s linear infinite',
              animationPlayState: 'running',
              transition: 'animation-play-state 0.3s ease'
            }}
            onMouseEnter={() => {
              if (carouselRef.current) {
                carouselRef.current.style.animationPlayState = 'paused';
              }
            }}
            onMouseLeave={() => {
              if (carouselRef.current) {
                carouselRef.current.style.animationPlayState = 'running';
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              if (carouselRef.current) {
                const isPaused = carouselRef.current.style.animationPlayState === 'paused';
                carouselRef.current.style.animationPlayState = isPaused ? 'running' : 'paused';
              }
            }}
          >
            {[...brands, ...brands].map((brand, index) => (
              <div 
                key={`${brand.id}-${index}`}
                className="inline-flex items-center justify-center w-40 h-20 mx-4 flex-shrink-0"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={getLogo(brand)}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 10rem, 12rem"
                  />
                </div>
              </div>
            ))}
          </div>
          <style jsx>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      </div>
    </section>
  )
}
