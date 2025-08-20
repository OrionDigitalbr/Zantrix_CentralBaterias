"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { DynamicLogo } from "./dynamic-logo"
import { ThemeToggle } from "./theme-toggle"
import { SocialLinks } from "./social-links"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMenuClosing, setIsMenuClosing] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Controlar o scroll quando o menu está aberto
  useEffect(() => {
    if (isMenuOpen && !isMenuClosing) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMenuOpen, isMenuClosing])

  // Detectar scroll para mudar o estilo do cabeçalho
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Limpar timeout ao desmontar o componente
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const handleOpenMenu = () => {
    setIsMenuOpen(true)
    setIsMenuClosing(false)
  }

  const handleCloseMenu = () => {
    setIsMenuClosing(true)

    // Definir um timeout para realmente fechar o menu após a animação
    closeTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false)
      setIsMenuClosing(false)
    }, 300) // Duração da animação de saída
  }

  return (
    <header
      className={`bg-background sticky top-0 z-40 ${scrolled ? "shadow-md" : "shadow-sm"} transition-shadow duration-300`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center">
              <DynamicLogo />
            </div>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-foreground hover:text-cliente text-sm font-semibold">
              INÍCIO
            </Link>
            <Link href="/sobre" className="text-foreground hover:text-cliente text-sm font-semibold">
              SOBRE NÓS
            </Link>
            <Link href="/unidades" className="text-foreground hover:text-cliente text-sm font-semibold">
              NOSSAS UNIDADES
            </Link>
            <Link href="/baterias" className="text-foreground hover:text-cliente text-sm font-semibold">
              BATERIAS
            </Link>
            <Link href="/loja" className="text-foreground hover:text-cliente text-sm font-semibold">
              LOJA VIRTUAL
            </Link>
            <Link href="/contato" className="text-foreground hover:text-cliente text-sm font-semibold">
              CONTATO
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* Botão Menu Mobile */}
            <button
              className="md:hidden text-foreground focus:outline-none"
              onClick={handleOpenMenu}
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Overlay */}
      {(isMenuOpen || isMenuClosing) && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-50 ${
            isMenuClosing ? "animate-fadeOutBackdrop" : "animate-fadeInBackdrop"
          }`}
          onClick={handleCloseMenu}
        >
          {/* Menu Mobile Container */}
          <div
            className={`fixed top-0 left-0 h-full w-4/5 bg-background shadow-xl ${
              isMenuClosing ? "animate-slideOutLeft" : "animate-slideInLeft"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Cabeçalho do Menu */}
              <div className="flex justify-between items-center p-4 border-b">
                <DynamicLogo width={150} height={50} className="h-10" />
                <button className="text-foreground focus:outline-none" onClick={handleCloseMenu} aria-label="Fechar menu">
                  <X size={24} />
                </button>
              </div>

              {/* Links do Menu */}
              <nav className="flex flex-col p-4 space-y-4 overflow-y-auto">
                {[
                  { href: "/", label: "INÍCIO" },
                  { href: "/sobre", label: "SOBRE NÓS" },
                  { href: "/unidades", label: "NOSSAS UNIDADES" },
                  { href: "/baterias", label: "BATERIAS" },
                  { href: "/loja", label: "LOJA VIRTUAL" },
                  { href: "/contato", label: "CONTATO" },
                ].map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-foreground hover:text-cliente text-lg font-medium py-2 border-b border-border ${
                      !isMenuClosing ? "animate-fadeIn" : ""
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={handleCloseMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto p-4">
                <SocialLinks />
                <div className="mt-4">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
