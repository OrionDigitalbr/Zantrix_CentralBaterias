import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { HelpContent } from "@/components/admin/help-content"

export default function Help() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader title="Ajuda e Suporte" />
          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Ajuda</h1>
              <p className="text-gray-600">Perguntas frequentes e suporte</p>
            </div>

            <HelpContent />
          </main>
        </div>
      </div>
    </div>
  )
}
