"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Settings,
  ShoppingBag,
  Layers,
  Users,
  FileText,
  BarChart,
  HelpCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    products: false,
    users: false,
  })

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <aside className="w-64 bg-card text-card-foreground shadow-sm hidden lg:block">
      <div className="h-full flex flex-col">
        <nav className="flex-1 py-4 px-3">
          <ul className="space-y-1">
            <li>
              <Link
                href="/admin/dashboard"
                className={`flex items-center px-4 py-3 text-sm rounded-lg ${isActive("/admin/dashboard") ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted"}`}
              >
                <Home size={18} className="mr-3" />
                Dashboard
              </Link>
            </li>

            <li>
              <button
                className={`flex items-center justify-between w-full px-4 py-3 text-sm rounded-lg ${pathname.includes("/admin/products") ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted"}`}
                onClick={() => toggleMenu("products")}
              >
                <div className="flex items-center">
                  <ShoppingBag size={18} className="mr-3" />
                  Produtos
                </div>
                {openMenus.products ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {openMenus.products && (
                <ul className="mt-1 ml-6 space-y-1">
                  <li>
                    <Link
                      href="/admin/products"
                      className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive("/admin/products") ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted"}`}
                    >
                      Todos os Produtos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/products/add"
                      className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive("/admin/products/add") ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted"}`}
                    >
                      Adicionar Produto
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/products/categories"
                      className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive("/admin/products/categories") ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted"}`}
                    >
                      Categorias
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link
                href="/admin/slides"
                className={`flex items-center px-4 py-3 text-sm rounded-lg ${isActive("/admin/slides") ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted"}`}
              >
                <Layers size={18} className="mr-3" />
                Slides
              </Link>
            </li>

            <li>
              <button
                className={`flex items-center justify-between w-full px-4 py-3 text-sm rounded-lg ${pathname.includes("/admin/users") ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted"}`}
                onClick={() => toggleMenu("users")}
              >
                <div className="flex items-center">
                  <Users size={18} className="mr-3" />
                  Usuários
                </div>
                {openMenus.users ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {openMenus.users && (
                <ul className="mt-1 ml-6 space-y-1">
                  <li>
                    <Link
                      href="/admin/users"
                      className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive("/admin/users") ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted"}`}
                    >
                      Todos os Usuários
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/users/add"
                      className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive("/admin/users/add") ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted"}`}
                    >
                      Adicionar Usuário
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/users/roles"
                      className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive("/admin/users/roles") ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted"}`}
                    >
                      Níveis de Acesso
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link
                href="/admin/ajuda"
                className={`flex items-center px-4 py-3 text-sm rounded-lg ${isActive("/admin/ajuda") ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted"}`}
              >
                <HelpCircle size={18} className="mr-3" />
                Ajuda
              </Link>
            </li>

            <li>
              <Link
                href="/admin/analytics"
                className={`flex items-center px-4 py-3 text-sm rounded-lg ${isActive("/admin/analytics") ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted"}`}
              >
                <BarChart size={18} className="mr-3" />
                Análise
              </Link>
            </li>

            <li>
              <Link
                href="/admin/settings"
                className={`flex items-center px-4 py-3 text-sm rounded-lg ${isActive("/admin/settings") ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted"}`}
              >
                <Settings size={18} className="mr-3" />
                Configurações
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm text-muted-foreground font-medium">Precisa de ajuda?</p>
            <p className="text-xs text-muted-foreground/80 mt-1">Acesse nossa central de ajuda completa.</p>
            <Link
              href="/admin/ajuda"
              className="mt-2 text-xs text-orange-500 hover:text-orange-600 font-medium inline-block"
            >
              Central de Ajuda
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
