"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

export function MainClients() {
  const clients = [
    {
      id: 1,
      name: "Transportadora Silva",
      logo: "/placeholder.svg?height=80&width=160&text=Cliente 1",
    },
    {
      id: 2,
      name: "Logística Express",
      logo: "/placeholder.svg?height=80&width=160&text=Cliente 2",
    },
    {
      id: 3,
      name: "Transportes Rápidos",
      logo: "/placeholder.svg?height=80&width=160&text=Cliente 3",
    },
    {
      id: 4,
      name: "Cargas Seguras",
      logo: "/placeholder.svg?height=80&width=160&text=Cliente 4",
    },
    {
      id: 5,
      name: "Transportadora Nacional",
      logo: "/placeholder.svg?height=80&width=160&text=Cliente 5",
    },
    {
      id: 6,
      name: "Logística Brasil",
      logo: "/placeholder.svg?height=80&width=160&text=Cliente 6",
    },
    {
      id: 7,
      name: "Transportes Confiança",
      logo: "/placeholder.svg?height=80&width=160&text=Cliente 7",
    },
    {
      id: 8,
      name: "Cargas & Fretes",
      logo: "/placeholder.svg?height=80&width=160&text=Cliente 8",
    },
  ]

  const [scrollPosition, setScrollPosition] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth
        setScrollPosition((prev) => {
          const newPosition = prev + 1
          return newPosition > maxScroll ? 0 : newPosition
        })
      }
    }, 30)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollPosition
    }
  }, [scrollPosition])

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">PRINCIPAIS CLIENTES</h2>
      <div className="relative overflow-hidden">
        <div ref={carouselRef} className="flex space-x-8 overflow-x-hidden py-4">
          {[...clients, ...clients].map((client, index) => (
            <div
              key={`${client.id}-${index}`}
              className="flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-center"
              style={{ width: "200px" }}
            >
              <div className="relative w-32 h-16">
                <Image src={client.logo || "/placeholder.svg"} alt={client.name} fill className="object-contain" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
