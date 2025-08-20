"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "João Silva",
      company: "Transportadora Silva",
      image: "/placeholder.svg?height=80&width=80&text=JS",
      text: "Excelente atendimento e produtos de qualidade. Sempre encontro o que preciso para minha frota de caminhões. Recomendo a todos os transportadores.",
      rating: 5,
    },
    {
      id: 2,
      name: "Maria Oliveira",
      company: "Logística Express",
      image: "/placeholder.svg?height=80&width=80&text=MO",
      text: "As baterias Jupiter são realmente superiores. Desde que comecei a usar, nunca mais tive problemas com meus veículos. Atendimento nota 10!",
      rating: 5,
    },
    {
      id: 3,
      name: "Carlos Santos",
      company: "Transportes Rápidos",
      image: "/placeholder.svg?height=80&width=80&text=CS",
      text: "Parceria de anos que só melhora. Produtos de qualidade, preços justos e entrega rápida. O Grupo Central é referência no setor.",
      rating: 4,
    },
    {
      id: 4,
      name: "Ana Pereira",
      company: "Cargas Seguras",
      image: "/placeholder.svg?height=80&width=80&text=AP",
      text: "Atendimento personalizado e soluções eficientes para nossa frota. Os produtos de iluminação LED melhoraram muito a segurança dos nossos motoristas.",
      rating: 5,
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  const prev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1))
  }

  const next = () => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <section className="py-12 bg-background">
      <h2 className="text-3xl font-bold text-center mb-12 text-foreground">DEPOIMENTOS</h2>

      <div className="relative max-w-4xl mx-auto">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                <div className="bg-card p-8 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-card-foreground">{testimonial.name}</h3>
                      <p className="text-muted-foreground">{testimonial.company}</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-card-foreground italic">"{testimonial.text}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-card rounded-full p-2 shadow-md text-card-foreground hover:bg-muted"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-card rounded-full p-2 shadow-md text-card-foreground hover:bg-muted"
        >
          <ChevronRight size={24} />
        </button>

        <div className="flex justify-center mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 mx-1 rounded-full ${index === currentIndex ? "bg-orange-500" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
