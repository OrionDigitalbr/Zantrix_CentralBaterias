"use client"

import { useState } from "react"
import { Edit, Trash2 } from "lucide-react"
import { RoleFormModal } from "./role-form-modal"

export type Role = {
  id: number
  name: string
  slug: string
  description: string
  permissions: string[]
  usersCount: number
}

export function RolesTable() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: "Administrador",
      slug: "admin",
      description: "Acesso completo ao sistema",
      permissions: [
        "gerenciar_usuarios",
        "gerenciar_produtos",
        "gerenciar_categorias",
        "gerenciar_slides",
        "gerenciar_configuracoes",
      ],
      usersCount: 2,
    },
    {
      id: 2,
      name: "Gerente",
      slug: "manager",
      description: "Acesso a produtos, categorias e slides",
      permissions: ["gerenciar_produtos", "gerenciar_categorias", "gerenciar_slides"],
      usersCount: 1,
    },
    {
      id: 3,
      name: "Editor",
      slug: "editor",
      description: "Acesso a produtos e categorias",
      permissions: ["gerenciar_produtos", "gerenciar_categorias"],
      usersCount: 3,
    },
    {
      id: 4,
      name: "Visualizador",
      slug: "viewer",
      description: "Acesso somente para visualização",
      permissions: [],
      usersCount: 2,
    },
  ])

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Tradução das permissões
  const permissionTranslations: Record<string, string> = {
    gerenciar_usuarios: "Gerenciar Usuários",
    gerenciar_produtos: "Gerenciar Produtos",
    gerenciar_categorias: "Gerenciar Categorias",
    gerenciar_slides: "Gerenciar Slides",
    gerenciar_configuracoes: "Gerenciar Configurações",
  }

  const confirmDelete = (id: number) => {
    setRoleToDelete(id)
    setShowDeleteModal(true)
  }

  const deleteRole = () => {
    if (roleToDelete) {
      setRoles(roles.filter((role) => role.id !== roleToDelete))
      setShowDeleteModal(false)
      setRoleToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setRoleToDelete(null)
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setShowEditModal(true)
  }

  const handleSaveEdit = (updatedRole: Role) => {
    setRoles(roles.map((role) => (role.id === updatedRole.id ? updatedRole : role)))
    setShowEditModal(false)
    setEditingRole(null)
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nome
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Slug
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Descrição
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Permissões
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Usuários
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{role.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{role.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{role.description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.length > 0 ? (
                      role.permissions.map((permission) => (
                        <span key={permission} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {permissionTranslations[permission] || permission}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Somente visualização</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{role.usersCount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      title="Editar"
                      onClick={() => handleEdit(role)}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className={`text-red-500 hover:text-red-700 ${role.usersCount > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      title="Excluir"
                      disabled={role.usersCount > 0}
                      onClick={() => role.usersCount === 0 && confirmDelete(role.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir este nível de acesso? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button onClick={deleteRole} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição */}
      {showEditModal && editingRole && (
        <RoleFormModal
          role={editingRole}
          onClose={() => {
            setShowEditModal(false)
            setEditingRole(null)
          }}
          onSave={handleSaveEdit}
        />
      )}
    </>
  )
}
