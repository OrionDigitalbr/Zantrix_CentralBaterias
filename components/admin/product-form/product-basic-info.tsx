"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import type { Category } from "@/lib/database.types"

interface ProductBasicInfoProps {
  product: {
    name: string
    slug: string
    sku: string
    description: string
    short_description: string
    price: number
    sale_price: number | null
    stock: number
    category_id: number
    brand: string
    featured: boolean
    active: boolean
  }
  categories: Category[]
  onChange: (field: string, value: any) => void
}

export function ProductBasicInfo({ product, categories, onChange }: ProductBasicInfoProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement
      onChange(name, checked)
    } else if (name === "price" || name === "stock") {
      onChange(name, Number(value) || 0)
    } else if (name === "sale_price") {
      onChange(name, value ? Number(value) : null)
    } else {
      onChange(name, value)
    }

    // Gerar slug automaticamente a partir do nome
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")

      onChange("slug", slug)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Produto <span className="text-red-500">*</span>
          </Label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <Label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug <span className="text-red-500">*</span>
          </Label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={product.slug}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">URL amigável do produto (gerada automaticamente)</p>
        </div>

        <div>
          <Label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </Label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={product.sku || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <Label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria <span className="text-red-500">*</span>
          </Label>
          <select
            id="category_id"
            name="category_id"
            value={product.category_id || ""}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
            Marca
          </Label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={product.brand || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Preço (R$) <span className="text-red-500">*</span>
          </Label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            min="0"
            value={product.price}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <Label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 mb-1">
            Preço Promocional (R$)
          </Label>
          <input
            type="number"
            id="sale_price"
            name="sale_price"
            step="0.01"
            min="0"
            value={product.sale_price === null ? "" : product.sale_price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Deixe em branco se não houver promoção</p>
        </div>

        <div>
          <Label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
            Estoque
          </Label>
          <input
            type="number"
            id="stock"
            name="stock"
            min="0"
            value={product.stock}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <ToggleSwitch
              id="featured"
              checked={product.featured}
              onCheckedChange={(checked) => onChange("featured", checked)}
              className="transition-all duration-200"
            />
            <Label htmlFor="featured" className="text-sm font-medium text-gray-700">
              Produto em Destaque
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <ToggleSwitch
              id="active"
              checked={product.active}
              onCheckedChange={(checked) => onChange("active", checked)}
              className="transition-all duration-200"
            />
            <Label htmlFor="active" className="text-sm font-medium text-gray-700">
              Produto Ativo
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
