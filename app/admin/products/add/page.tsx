import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { CompleteProductForm } from "@/components/admin/complete-product-form"

export default function AddProduct() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader />

      <div className="flex flex-1 ">
        <AdminSidebar />

        <main className="flex-1 p-6 bg-zantrix">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Adicionar Produto</h1>
            <p className="text-muted-foreground">Preencha os campos abaixo para adicionar um novo produto</p>
          </div>

          <CompleteProductForm />
        </main>
      </div>
    </div>
  )
}
