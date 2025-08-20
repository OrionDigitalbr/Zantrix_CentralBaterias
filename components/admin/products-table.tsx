"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Search, Filter, Edit, Trash2, Eye, ChevronLeft, ChevronRight, BarChart2 } from "lucide-react"

export function ProductsTable() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)
  const supabase = createClientSupabaseClient()

  // Buscar produtos e categorias do banco de dados
  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🔍 [TESTE PRODUTOS] Iniciando busca de dados...')
        setLoading(true)
        setError(null)

        // Verificar autenticação
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        console.log('👤 [TESTE PRODUTOS] Usuário autenticado:', user?.email)

        // Buscar produtos
        console.log('📦 [TESTE PRODUTOS] Buscando produtos...')
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*, product_images(*)")
          .order("name")

        console.log('📦 [TESTE PRODUTOS] Resposta produtos:', {
          count: productsData?.length || 0,
          error: productsError?.message,
          firstProduct: productsData?.[0] ? {
            id: productsData[0].id,
            name: productsData[0].name,
            created_at: productsData[0].created_at
          } : null
        })

        if (productsError) throw productsError

        // Buscar categorias
        console.log('📂 [TESTE PRODUTOS] Buscando categorias...')
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name")

        console.log('📂 [TESTE PRODUTOS] Resposta categorias:', {
          count: categoriesData?.length || 0,
          error: categoriesError?.message
        })

        if (categoriesError) throw categoriesError

        // Processar produtos para adicionar a imagem principal
        const processedProducts = productsData?.map((product) => {
          // Encontrar a imagem principal ou a primeira imagem
          const mainImage = product.product_images?.find((img: any) => img.is_main) || product.product_images?.[0] || null

          return {
            ...product,
            image: mainImage ? mainImage.url : null,
          }
        }) || []

        console.log('✅ [TESTE PRODUTOS] Produtos processados:', {
          total: processedProducts.length,
          produtos: processedProducts.map(p => ({ id: p.id, name: p.name }))
        })

        setProducts(processedProducts)
        setCategories(categoriesData)
      } catch (err) {
        console.error("❌ [TESTE PRODUTOS] Erro ao buscar dados:", err)
        setError("Falha ao carregar produtos. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  // Filtrar produtos por categoria e pesquisa
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category_id === Number.parseInt(selectedCategory)
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Paginação
  const productsPerPage = 5
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)

  const confirmDelete = (id: number) => {
    setProductToDelete(id)
    setShowDeleteModal(true)
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      // Primeiro, excluir as imagens do produto
      const { data: images, error: imagesError } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productToDelete)

      if (imagesError) throw imagesError

      // Excluir cada imagem
      if (images && images.length > 0) {
        await supabase.from("product_images").delete().eq("product_id", productToDelete)
      }

      // Excluir o produto
      const { error } = await supabase.from("products").delete().eq("id", productToDelete)

      if (error) throw error

      // Atualizar a lista de produtos
      setProducts(products.filter((product) => product.id !== productToDelete))
      setShowDeleteModal(false)
      setProductToDelete(null)
    } catch (err) {
      console.error("Erro ao excluir produto:", err)
      setError("Falha ao excluir produto. Por favor, tente novamente.")
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setProductToDelete(null)
  }

  // Encontrar o nome da categoria pelo ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "Sem categoria"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm font-medium text-destructive hover:text-destructive/80"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar produtos por nome ou SKU..."
                className="w-full bg-background border border-input rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-foreground" size={18} />
            </div>

            <div className="flex items-center">
              <Filter className="text-foreground mr-2" size={18} />
              <select
                className="bg-background border border-input rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                >
                  Produto
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                >
                  SKU
                </th>
                <th
                  scope="col"
                  className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                >
                  Categoria
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                >
                  Preço
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                >
                  Estoque
                </th>
                <th
                  scope="col"
                  className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative rounded-md overflow-hidden bg-muted">
                          <Image
                            src={
                              product.image ||
                              "/placeholder.svg"
                            }
                            alt={product.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">{product.name}</div>
                          {/* Mostrar informações extras em mobile */}
                          <div className="md:hidden text-xs text-foreground mt-1">
                            {product.sku && <div>SKU: {product.sku}</div>}
                            <div className="lg:hidden">{getCategoryName(product.category_id)}</div>
                            <div className="md:hidden">
                              Estoque: {product.stock > 0 ? product.stock : "Esgotado"}
                            </div>
                            <div className="lg:hidden">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  product.active ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                                }`}
                              >
                                {product.active ? "Ativo" : "Inativo"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{product.sku || "N/A"}</div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{getCategoryName(product.category_id)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">R$ {product.price.toFixed(2).replace(".", ",")}</div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${product.stock > 0 ? "text-foreground" : "text-destructive font-medium"}`}>
                        {product.stock > 0 ? product.stock : "Esgotado"}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.active ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {product.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/produto/${product.slug}`}
                          target="_blank"
                          className="text-foreground hover:text-foreground transition-colors duration-200 transform hover:scale-110"
                          title="Visualizar"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="text-primary hover:text-primary/80 transition-colors duration-200 transform hover:scale-110"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </Link>
                        <Link
                          href={`/admin/products/analytics/${product.id}`}
                          className="text-purple-500 hover:text-purple-400 transition-colors duration-200 transform hover:scale-110"
                          title="Análise"
                        >
                          <BarChart2 size={18} />
                        </Link>
                        <button
                          className="text-destructive hover:text-destructive/80 transition-colors duration-200 transform hover:scale-110"
                          title="Excluir"
                          onClick={() => confirmDelete(product.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-foreground">
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-border">
            <div className="text-sm text-foreground">
              Mostrando <span className="font-medium text-foreground">{(currentPage - 1) * productsPerPage + 1}</span> a{" "}
              <span className="font-medium text-foreground">{Math.min(currentPage * productsPerPage, filteredProducts.length)}</span> de{" "}
              <span className="font-medium text-foreground">{filteredProducts.length}</span> resultados
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md transition-all duration-200 ${
                  currentPage === 1
                    ? "bg-muted text-foreground/50 cursor-not-allowed"
                    : "bg-muted text-foreground hover:bg-muted/80 hover:scale-105"
                }`}
              >
                <ChevronLeft size={18} />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-md transition-all duration-200 ${
                    currentPage === i + 1
                      ? "bg-primary text-primary-foreground transform scale-105"
                      : "bg-muted text-foreground hover:bg-muted/80 hover:scale-105"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md transition-all duration-200 ${
                  currentPage === totalPages
                    ? "bg-muted text-foreground/50 cursor-not-allowed"
                    : "bg-muted text-foreground hover:bg-muted/80 hover:scale-105"
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeInBackdrop">
          <div className="bg-card rounded-lg p-6 max-w-md w-full animate-modalFadeIn">
            <h3 className="text-lg font-semibold text-foreground mb-4">Confirmar Exclusão</h3>
            <p className="text-foreground mb-6">
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-all duration-200 hover:scale-105"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-all duration-200 hover:scale-105"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
