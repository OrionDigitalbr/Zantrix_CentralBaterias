import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SlideForm } from "@/components/admin/slide-form"

export default async function EditSlide({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Editar Slide</h1>
            <p className="text-muted-foreground">Edite as informações do slide #{id}</p>
          </div>

          <SlideForm slideId={id} />
        </main>
      </div>
    </div>
  )
}
