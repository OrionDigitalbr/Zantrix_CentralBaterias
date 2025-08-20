"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"

interface Slide {
  id: number
  title: string
  subtitle?: string | null
  link_url: string | null
  image_url: string
  mobile_image_url?: string | null
  button_text?: string | null
  display_order: number
  active: boolean
}

export function Carousel() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deviceType, setDeviceType] = useState<"mobile" | "notebook" | "pc">("pc")

  useEffect(() => {
    // Determinar o tipo de dispositivo
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setDeviceType("mobile")
      } else if (width < 1024) {
        setDeviceType("notebook")
      } else {
        setDeviceType("pc")
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Buscar slides do banco de dados
    async function fetchSlides() {
      try {
        const supabase = createClientSupabaseClient()

        const { data, error } = await supabase.from("slides").select("*").eq("active", true).order("display_order")

        if (error) {
          console.error("Erro ao buscar slides:", error)
          setSlides(fallbackSlides)
          return
        }

        setSlides(data)
      } catch (error) {
        console.error("Erro ao buscar slides:", error)
        setSlides(fallbackSlides)
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    // Rotação automática dos slides
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  // Slides de fallback
  const fallbackSlides = [
    {
      id: 1,
      title: "Baterias com até 20% de desconto",
      subtitle: "Qualidade e tradição há mais de 30 anos",
      link_url: "/loja?categoria=baterias",
      image_url: "/placeholder.svg?height=600&width=1920&text=Slide Baterias",
      mobile_image_url: "/placeholder.svg?height=400&width=600&text=Slide Baterias Mobile",
      button_text: "Ver Produtos",
      display_order: 1,
      active: true,
    },
    {
      id: 2,
      title: "Filtros originais para seu caminhão",
      subtitle: "Peças originais com garantia",
      link_url: "/loja?categoria=filtros",
      image_url: "/placeholder.svg?height=600&width=1920&text=Slide Filtros",
      mobile_image_url: "/placeholder.svg?height=400&width=600&text=Slide Filtros Mobile",
      button_text: "Conheça",
      display_order: 2,
      active: true,
    },
    {
      id: 3,
      title: "Iluminação LED para maior segurança",
      subtitle: "Tecnologia avançada para seu veículo",
      link_url: "/loja?categoria=iluminacao",
      image_url: "/placeholder.svg?height=600&width=1920&text=Slide Iluminação",
      mobile_image_url: "/placeholder.svg?height=400&width=600&text=Slide Iluminação Mobile",
      button_text: "Ver Mais",
      display_order: 3,
      active: true,
    },
  ]

  if (loading) {
    return (
      <div className="relative w-full aspect-[500/780] sm:aspect-[16/6] bg-gray-300 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </div>
    )
  }

  if (slides.length === 0) {
    return null
  }

  const getSlideImage = (slide: Slide) => {
    // Retorna a URL da imagem específica para o dispositivo atual
    // ou null se não houver imagem específica
    switch (deviceType) {
      case "mobile":
        return slide.mobile_image_url || null
      case "notebook":
        // Se precisar de uma imagem específica para notebook, adicione notebook_image_url ao tipo Slide
        return slide.image_url || null
      default: // desktop
        return slide.image_url || null
    }
  }

  return (
    <div className="relative w-full aspect-[500/780] sm:aspect-[16/6] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="relative w-full h-full">
            {getSlideImage(slide) ? (
              <>
                <Image
                  src={getSlideImage(slide)!}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover"
                />
                {slide.link_url ? (
                  <Link href={slide.link_url} className="absolute inset-0">
                    <span className="sr-only">Ver {slide.title}</span>
                  </Link>
                ) : (
                  <div className="absolute inset-0"></div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center p-4">
                  <p className="text-gray-500 text-sm">
                    {deviceType === "mobile" 
                      ? "Nenhuma imagem para celular configurada"
                      : deviceType === "notebook"
                      ? "Nenhuma imagem para notebook configurada"
                      : "Nenhuma imagem para desktop configurada"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Controles de navegação */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full ${index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"}`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
