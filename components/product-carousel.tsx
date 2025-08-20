"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { ProductCardPrice } from "@/components/price-display"

interface Product {
  id: number
  name: string
  price: number
  sale_price?: number | null
  image: string
  url: string
}

interface ProductCarouselProps {
  title: string
  products: Product[]
  viewAllUrl: string
  viewAllText: string
  buttonColor: string
}

export function ProductCarousel({ title, products, viewAllUrl, viewAllText, buttonColor }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [itemWidth, setItemWidth] = useState(0)
  const [visibleItems, setVisibleItems] = useState(1)

  const isMobile = useIsMobile()

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setContainerWidth(width)

        // Verificar se é dispositivo móvel
        if (isMobile) {
          // Em dispositivos móveis: 1 item completo + 20% do próximo
          const calculatedItemWidth = width / 1.2
          setItemWidth(calculatedItemWidth)
          setVisibleItems(1)
        } else {
          // Em desktop: 4 itens por vez
          const calculatedItemWidth = width / 4
          setItemWidth(calculatedItemWidth)
          setVisibleItems(4)
        }
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [isMobile])

  const maxIndex = Math.max(0, products.length - visibleItems)

  const handlePrev = () => {
    if (isAnimating || currentIndex <= 0) return

    setIsAnimating(true)
    // Sempre retrocede apenas 1 item, independente do dispositivo
    setCurrentIndex((prev) => Math.max(0, prev - 1))

    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  const handleNext = () => {
    if (isAnimating || currentIndex >= maxIndex) return

    setIsAnimating(true)
    // Sempre avança apenas 1 item, independente do dispositivo
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))

    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>

      <div className="relative" ref={containerRef}>
        {/* Botão Anterior */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Carrossel */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out mb-6"
            style={{
              transform: `translateX(-${currentIndex * itemWidth}px)`,
            }}
          >
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0" style={{ width: `${itemWidth}px` }}>
                <Link
                  href={product.url}
                  className="block mx-4 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full"
                >
                  <div className="p-4 flex justify-center">
                    <div className="relative w-40 h-40">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="p-4 border-t">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">{product.name}</h3>
                    <ProductCardPrice
                      price={product.price}
                      salePrice={product.sale_price}
                    />
                    <button className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition-colors">
                      Comprar
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Botão Próximo */}
        {currentIndex < maxIndex && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Botão Ver Todos */}
      <div className="text-center mt-8">
        <Link
          href={viewAllUrl}
          className={`inline-block ${buttonColor} text-white font-bold py-3 px-6 rounded-lg transition-colors`}
        >
          {viewAllText}
        </Link>
      </div>
    </section>
  )
}
