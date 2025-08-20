import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { UserForm } from "@/components/admin/user-form"

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Editar Usuário" />
        <main className="p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Usuário</h1>
            <UserForm userId={id} />
          </div>
        </main>
      </div>
    </div>
  )
}
