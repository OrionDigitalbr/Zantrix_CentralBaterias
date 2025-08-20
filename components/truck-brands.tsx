"use client"

import Image from "next/image"
import { useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TruckBrands() {
  const brands = [
    {
      id: 1,
      name: "Scania",
      logo: "/svg/marcas/scania.svg",   
    },
    {
      id: 2,
      name: "Mercedes-Benz",
      logo: "/svg/marcas/Mercedes.svg",
    },
    {
      id: 3,
      name: "Ford",
      logo: "/svg/marcas/ford.svg",
    },
    {
      id: 4,
      name: "MAN",
      logo: "/svg/marcas/man.svg",
    },
    {
      id: 5,
      name: "Randon",
      logo: "/svg/marcas/randon.svg",
    },
    {
      id: 6,
      name: "DAF",
      logo: "/svg/marcas/DAF.svg",
    },
  ]

  const carouselRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    let animationId: number
    let isPaused = false
    let position = 0
    const speed = 1 // velocidade do carrossel (pixels por frame)

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
    const handleMouseEnter = () => {
      isPaused = true
    }

    const handleMouseLeave = () => {
      isPaused = false
    }

    carousel.addEventListener("mouseenter", handleMouseEnter)
    carousel.addEventListener("mouseleave", handleMouseLeave)

    // Limpar animação quando o componente for desmontado
    return () => {
      cancelAnimationFrame(animationId)
      carousel.removeEventListener("mouseenter", handleMouseEnter)
      carousel.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <section className="py-12 relative">
      <h1 className="text-3xl font-bold text-center mb-8">Principais marcas</h1>

      <div className="relative  mx-auto px-4">
        <div className="relative w-full overflow-hidden">
          {/* Gradiente esquerdo */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background via-background/90 via-10% to-transparent z-10 pointer-events-none" />
          {/* Gradiente direito */}
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background via-background/90 via-10% to-transparent z-10 pointer-events-none" />
          <div
            ref={carouselRef}
            className="flex items-center py-4 whitespace-nowrap px-4 sm:px-8 md:px-12"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              display: 'inline-flex',
              width: 'max-content',
              animation: 'scroll 40s linear infinite',
              animationPlayState: 'running',
              transition: 'animation-play-state 0.3s ease'
            }}
            onMouseEnter={() => carouselRef.current?.style.setProperty('animation-play-state', 'paused')}
            onMouseLeave={() => carouselRef.current?.style.setProperty('animation-play-state', 'running')}
            onClick={(e) => {
              e.preventDefault()
              if (carouselRef.current) {
                const isPaused = carouselRef.current.style.animationPlayState === 'paused'
                carouselRef.current.style.animationPlayState = isPaused ? 'running' : 'paused'
              }
            }}
          >
            {brands.map((brand, index) => (
              <div
                key={brand.id}
                className="flex-shrink-0 w-[160px] flex items-center justify-center transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative w-32 h-16">
                  <div className="relative w-full h-full dark:invert-0 dark:brightness-100 brightness-0 dark:filter-none">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain"
                      loading={index > 5 ? 'lazy' : 'eager'}
                      sizes="(max-width: 768px) 160px, 200px"
                    />
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate brands for infinite carousel effect */}
            {brands.map((brand, index) => (
              <div
                key={`duplicate-${brand.id}`}
                className="inline-flex items-center justify-center w-40 h-20 mx-4 flex-shrink-0 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative w-32 h-16">
                  <div className="relative w-full h-full dark:invert-0 dark:brightness-100 brightness-0 dark:filter-none">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain"
                      loading={index > 5 ? 'lazy' : 'eager'}
                      sizes="(max-width: 768px) 160px, 200px"
                    />
                  </div>
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

        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2  rounded-full z-10"
          onClick={() => {
            if (carouselRef.current) {
              const currentScroll = carouselRef.current.scrollLeft
              carouselRef.current.scrollTo({
                left: currentScroll - 300,
                behavior: "smooth",
              })
            }
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Anterior</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2  rounded-full z-10"
          onClick={() => {
            if (carouselRef.current) {
              const currentScroll = carouselRef.current.scrollLeft
              carouselRef.current.scrollTo({
                left: currentScroll + 300,
                behavior: "smooth",
              })
            }
          }}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Próximo</span>
        </Button>
      </div>
    </section>
  )
}
