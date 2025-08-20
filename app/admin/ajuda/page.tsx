import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { UnifiedHelpContent } from "@/components/admin/unified-help-content"

export default function Ajuda() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Central de Ajuda</h1>
            <p className="text-gray-600">Guias, tutoriais e suporte para o painel administrativo</p>
          </div>

          <UnifiedHelpContent />
        </main>
      </div>
    </div>
  )
}
