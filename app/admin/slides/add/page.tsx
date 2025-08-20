import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SlideForm } from "@/components/admin/slide-form"

export default function AddSlide() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Adicionar Slide</h1>
            <p className="text-muted-foreground">Crie um novo slide para o carrossel da página inicial</p>
          </div>

          <SlideForm />
        </main>
      </div>
    </div>
  )
}
