import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ProductsTable } from "@/components/admin/products-table"

export default function AdminProducts() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
              <p className="text-muted-foreground">Gerencie todos os produtos da loja</p>
            </div>
            <a
              href="/admin/products/add"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Adicionar Produto
            </a>
          </div>

          <ProductsTable />
        </main>
      </div>
    </div>
  )
}
