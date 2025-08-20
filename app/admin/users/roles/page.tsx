"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { RolesTable } from "@/components/admin/roles-table"
import { RoleFormModal } from "@/components/admin/role-form-modal"

export default function UserRoles() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Níveis de Acesso</h1>
              <p className="text-muted-foreground">Gerencie os níveis de acesso dos usuários</p>
            </div>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              onClick={() => setShowAddModal(true)}
            >
              Adicionar Nível
            </button>
          </div>

          <RolesTable />

          {showAddModal && (
            <RoleFormModal
              onClose={() => setShowAddModal(false)}
              onSave={(newRole) => {
                // Aqui você adicionaria a lógica para salvar o novo nível
                setShowAddModal(false)
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}
