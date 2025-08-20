"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Role } from "./roles-table"

interface RoleFormModalProps {
  role?: Role
  onClose: () => void
  onSave: (role: Role) => void
}

export function RoleFormModal({ role, onClose, onSave }: RoleFormModalProps) {
  const isEditing = !!role

  const [formData, setFormData] = useState<Omit<Role, "id" | "usersCount">>({
    name: role?.name || "",
    slug: role?.slug || "",
    description: role?.description || "",
    permissions: role?.permissions || [],
  })

  // Lista de todas as permissões disponíveis
  const availablePermissions = [
    { id: "gerenciar_usuarios", label: "Gerenciar Usuários" },
    { id: "gerenciar_produtos", label: "Gerenciar Produtos" },
    { id: "gerenciar_categorias", label: "Gerenciar Categorias" },
    { id: "gerenciar_slides", label: "Gerenciar Slides" },
    { id: "gerenciar_configuracoes", label: "Gerenciar Configurações" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePermissionChange = (permissionId: string) => {
    setFormData((prev) => {
      const permissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId]

      return { ...prev, permissions }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Gerar slug a partir do nome se estiver vazio
    let slug = formData.slug
    if (!slug && formData.name) {
      slug = formData.name
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "_")
    }

    const updatedRole: Role = {
      id: role?.id || Math.floor(Math.random() * 1000 + Date.now()), // Gerar ID único para novos níveis
      ...formData,
      slug,
      usersCount: role?.usersCount || 0,
    }

    onSave(updatedRole)
  }

  // Gerar slug automaticamente quando o nome mudar
  useEffect(() => {
    if (!isEditing || (isEditing && !role.slug)) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "_")

      setFormData((prev) => ({ ...prev, slug: generatedSlug }))
    }
  }, [formData.name, isEditing, role?.slug])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? "Editar Nível de Acesso" : "Adicionar Nível de Acesso"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Gerado automaticamente"
              />
              <p className="text-xs text-gray-500 mt-1">
                Identificador único usado no sistema. Será gerado automaticamente se deixado em branco.
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissões</label>
              <div className="space-y-2">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`permission-${permission.id}`}
                      checked={formData.permissions.includes(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`permission-${permission.id}`} className="ml-2 text-sm text-gray-700">
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
              {isEditing ? "Salvar Alterações" : "Adicionar Nível"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
