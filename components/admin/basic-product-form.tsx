"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useNotify } from "@/contexts/notification-context"

interface BasicProductFormProps {
  productId?: string
}

export function BasicProductForm({ productId }: BasicProductFormProps) {
  const router = useRouter()
  const notify = useNotify()
  const isEditing = !!productId

  const [product, setProduct] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "price") {
      setProduct((prev) => ({ ...prev, [name]: Number(value) || 0 }))
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }))
    }

    // Gerar slug automaticamente
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")

      setProduct((prev) => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product.name || !product.slug) {
      notify.error("Campos Obrigatórios", "Preencha nome e slug")
      return
    }

    // Simular salvamento
    console.log("Dados do produto:", product)
    notify.success(
      isEditing ? "Produto Atualizado" : "Produto Criado",
      `${isEditing ? "Editando" : "Criando"} produto: ${product.name}`
    )

    // Redirecionar após "salvar"
    router.push("/admin/products")
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? "Editar" : "Criar"} Produto - Teste Básico
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Produto *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Digite o nome do produto"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={product.slug}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="slug-do-produto"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Preço (R$) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            min="0"
            value={product.price}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            value={product.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Descrição do produto"
          />
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            ← Voltar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            {isEditing ? "Atualizar" : "Criar"} Produto
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium text-gray-700 mb-2">Debug Info:</h3>
        <p><strong>Modo:</strong> {isEditing ? "Edição" : "Criação"}</p>
        <p><strong>Product ID:</strong> {productId || "N/A"}</p>
        <p><strong>Nome:</strong> {product.name || "Vazio"}</p>
        <p><strong>Slug:</strong> {product.slug || "Vazio"}</p>
        <p><strong>Preço:</strong> R$ {product.price}</p>
      </div>
    </div>
  )
}
