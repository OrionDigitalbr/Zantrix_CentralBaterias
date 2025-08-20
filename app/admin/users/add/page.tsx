import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { UserForm } from "@/components/admin/user-form"

export default function AddUserPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Adicionar Usuário" />
        <main className="p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Novo Usuário</h1>
            <UserForm />
          </div>
        </main>
      </div>
    </div>
  )
}
