import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SlidesManager } from "@/components/admin/slides-manager"
import Link from "next/link"

export default function AdminSlides() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Slides</h1>
              <p className="text-muted-foreground">Gerencie os slides do carrossel da página inicial</p>
            </div>
            <Link
              href="/admin/slides/add"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Adicionar Slide
            </Link>
          </div>

          <SlidesManager />
        </main>
      </div>
    </div>
  )
}
