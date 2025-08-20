import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { CategoriesTable } from "@/components/admin/categories-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-zantrix">
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">Categorias e Subcategorias</h1>
              <Button className="bg-orange-600 hover:bg-orange-700" id="add-category-button">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Categoria
              </Button>
            </div>
            <CategoriesTable />
          </div>
        </main>
      </div>
    </div>
  )
}
