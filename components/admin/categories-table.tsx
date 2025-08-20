"use client"

import React, { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Edit, Trash, Plus, ChevronRight, ChevronDown, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClientSupabaseClient } from "@/lib/supabase"


// Esquema de validação para o formulário de categoria
const categorySchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  slug: z.string().min(2, { message: "O slug deve ter pelo menos 2 caracteres" }),
  description: z.string().optional(),
  active: z.boolean().optional().default(true),
  parentId: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

export function CategoriesTable() {
  const [categories, setCategories] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [parentCategory, setParentCategory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientSupabaseClient()

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      active: true,
      parentId: undefined,
    },
  })

  // Buscar categorias do banco de dados
  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("categories").select("*").order("name")

        if (error) {
          console.error("Erro ao buscar categorias:", {
            message: error?.message || 'Erro desconhecido',
            details: error?.details || 'Sem detalhes',
            hint: error?.hint || 'Sem dica',
            code: error?.code || 'Sem código',
            fullError: error
          })
          return
        }

        // Organizar categorias em hierarquia
        const mainCategories = data.filter((category) => !category.parent_id)
        const subCategories = data.filter((category) => category.parent_id)

        const categoriesWithChildren = mainCategories.map((category) => {
          return {
            ...category,
            children: subCategories.filter((sub) => sub.parent_id === category.id),
          }
        })

        setCategories(categoriesWithChildren)
      } catch (error: any) {
        console.error("Erro ao buscar categorias:", {
          message: error?.message || 'Erro desconhecido',
          details: error?.details || 'Sem detalhes',
          hint: error?.hint || 'Sem dica',
          code: error?.code || 'Sem código',
          fullError: error
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [supabase])

  // Efeito para inicializar o formulário quando estiver editando
  useEffect(() => {
    if (isEditing && selectedCategory) {
      form.reset({
        name: selectedCategory.name,
        slug: selectedCategory.slug,
        description: selectedCategory.description || "",
        active: selectedCategory.active,
        parentId: selectedCategory.parent_id,
      })
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
        active: true,
        parentId: parentCategory?.id,
      })
    }
  }, [isEditing, selectedCategory, parentCategory, form])

  // Efeito para adicionar o listener do botão de adicionar categoria
  useEffect(() => {
    const addButton = document.getElementById("add-category-button")
    if (addButton) {
      addButton.addEventListener("click", () => handleAddCategory())
      return () => {
        addButton.removeEventListener("click", () => handleAddCategory())
      }
    }
  }, [])

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleAddCategory = () => {
    setIsEditing(false)
    setSelectedCategory(null)
    setParentCategory(null)
    setCategoryDialogOpen(true)
  }

  const handleAddSubcategory = (parent: any) => {
    setIsEditing(false)
    setSelectedCategory(null)
    setParentCategory(parent)
    setSubcategoryDialogOpen(true)
  }

  const handleEditCategory = (category: any) => {
    setIsEditing(true)
    setSelectedCategory(category)
    setParentCategory(null)
    setCategoryDialogOpen(true)
  }

  const handleEditSubcategory = (subcategory: any, parent: any) => {
    setIsEditing(true)
    setSelectedCategory(subcategory)
    setParentCategory(parent)
    setSubcategoryDialogOpen(true)
  }

  const handleDeleteClick = (category: any) => {
    setSelectedCategory(category)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      // Excluir categoria do banco de dados
      const { error } = await supabase.from("categories").delete().eq("id", selectedCategory.id)

      if (error) throw error

      // Atualizar a lista de categorias após a exclusão
      if (selectedCategory.parent_id) {
        // É uma subcategoria
        setCategories((prev) =>
          prev.map((cat) => {
            if (cat.id === selectedCategory.parent_id) {
              return {
                ...cat,
                children: cat.children.filter((child: any) => child.id !== selectedCategory.id),
              }
            }
            return cat
          }),
        )
      } else {
        // É uma categoria principal
        setCategories((prev) => prev.filter((cat) => cat.id !== selectedCategory.id))
      }

      setDeleteDialogOpen(false)
    } catch (error: any) {
      console.error("Erro ao excluir categoria:", {
        message: error?.message || 'Erro desconhecido',
        details: error?.details || 'Sem detalhes',
        hint: error?.hint || 'Sem dica',
        code: error?.code || 'Sem código',
        fullError: error
      })

      // Mostrar erro mais detalhado para o usuário
      const errorMessage = error?.message || error?.details || 'Erro desconhecido ao excluir categoria'
      alert(`Erro ao excluir categoria: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }



  const onCategorySubmit = async (data: CategoryFormData) => {

    try {
      if (isEditing) {
        // Atualizar categoria existente
        const updateData = {
          name: data.name,
          slug: data.slug,
          description: data.description,
          active: Boolean(data.active),
        }

        const { error } = await supabase
          .from("categories")
          .update(updateData)
          .eq("id", selectedCategory.id)

        if (error) throw error

        // Atualizar estado local
        if (selectedCategory.parent_id) {
          // É uma subcategoria
          setCategories((prev) =>
            prev.map((cat) => {
              if (cat.id === selectedCategory.parent_id) {
                return {
                  ...cat,
                  children: cat.children.map((child: any) =>
                    child.id === selectedCategory.id
                      ? {
                          ...child,
                          name: data.name,
                          slug: data.slug,
                          description: data.description,
                          active: data.active,
                        }
                      : child,
                  ),
                }
              }
              return cat
            }),
          )
        } else {
          // É uma categoria principal
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === selectedCategory.id
                ? {
                    ...cat,
                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    active: data.active,
                    children: cat.children,
                  }
                : cat,
            ),
          )
        }
      } else {
        // Adicionar nova categoria
        const categoryData = {
          name: data.name,
          slug: data.slug,
          description: data.description,
          active: Boolean(data.active),
          parent_id: parentCategory?.id || null,
        }

        const { data: newCategory, error } = await supabase
          .from("categories")
          .insert(categoryData)
          .select()

        if (error) throw error

        if (parentCategory) {
          // Adicionar subcategoria
          setCategories((prev) =>
            prev.map((cat) => {
              if (cat.id === parentCategory.id) {
                return {
                  ...cat,
                  children: [
                    ...cat.children,
                    {
                      ...newCategory[0],
                      children: [],
                    },
                  ],
                }
              }
              return cat
            }),
          )
        } else {
          // Adicionar categoria principal
          setCategories((prev) => [
            ...prev,
            {
              ...newCategory[0],
              children: [],
            },
          ])
        }
      }

      setCategoryDialogOpen(false)
      setSubcategoryDialogOpen(false)
      form.reset()
    } catch (error: any) {
      console.error("Erro ao salvar categoria:", {
        message: error?.message || 'Erro desconhecido',
        details: error?.details || 'Sem detalhes',
        hint: error?.hint || 'Sem dica',
        code: error?.code || 'Sem código',
        fullError: error
      })

      // Mostrar erro mais detalhado para o usuário
      const errorMessage = error?.message || error?.details || 'Erro desconhecido ao salvar categoria'
      alert(`Erro ao salvar categoria: ${errorMessage}`)
    }
  }

  // Função para gerar slug a partir do nome
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  // Atualizar o slug quando o nome mudar
  const watchName = form.watch("name")
  useEffect(() => {
    if (!isEditing || (isEditing && form.getValues("slug") === selectedCategory?.slug)) {
      form.setValue("slug", generateSlug(watchName))
    }
  }, [watchName, form, isEditing, selectedCategory])

  // Filtrar categorias com base no termo de busca
  const filterCategories = (categories: any[], term: string) => {
    return categories
      .filter((category) => {
        const matchesSearch =
          category.name.toLowerCase().includes(term.toLowerCase()) ||
          category.description?.toLowerCase().includes(term.toLowerCase())

        // Verificar se alguma subcategoria corresponde à pesquisa
        const hasMatchingChildren = category.children && filterCategories(category.children, term).length > 0

        return matchesSearch || hasMatchingChildren
      })
      .map((category) => {
        if (category.children && category.children.length > 0) {
          return {
            ...category,
            children: filterCategories(category.children, term),
          }
        }
        return category
      })
  }

  const filteredCategories = searchTerm ? filterCategories(categories, searchTerm) : categories

  // Renderizar categorias e subcategorias
  const renderCategories = (categories: any[], level = 0) => {
    return categories.map((category, index) => (
      <React.Fragment key={`${category.id}-${level}-${index}`}>
        <TableRow className={level > 0 ? "bg-gray-50" : ""}>
          <TableCell>
            <div className="flex items-center">
              <div style={{ width: `${level * 24}px` }} />
              {category.children && category.children.length > 0 && (
                <button onClick={() => toggleExpand(category.id)} className="mr-2 p-1 rounded-full hover:bg-gray-200">
                  {expandedCategories.includes(category.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              <span className={level > 0 ? "font-normal" : "font-medium"}>{category.name}</span>
            </div>
          </TableCell>
          <TableCell>{category.slug}</TableCell>
          <TableCell>
            {category.active ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inativo</Badge>
            )}
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    level === 0
                      ? handleEditCategory(category)
                      : handleEditSubcategory(
                          category,
                          categories.find((c) => c.id === category.parent_id),
                        )
                  }
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                {level === 0 && (
                  <DropdownMenuItem onClick={() => handleAddSubcategory(category)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Subcategoria
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleDeleteClick(category)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {category.children &&
          category.children.length > 0 &&
          expandedCategories.includes(category.id) &&
          renderCategories(category.children, level + 1)}
      </React.Fragment>
    ))
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar categorias..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2">Carregando categorias...</p>
                </TableCell>
              </TableRow>
            ) : filteredCategories.length > 0 ? (
              renderCategories(filteredCategories)
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhuma categoria encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir a categoria <strong>{selectedCategory?.name}</strong>?
              {selectedCategory?.children?.length > 0 && (
                <p className="mt-2 text-red-500">
                  Esta categoria contém {selectedCategory.children.length} subcategorias. Excluí-la também removerá
                  todas as subcategorias.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de categoria */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Categoria" : "Adicionar Categoria"}</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para {isEditing ? "editar a" : "adicionar uma nova"} categoria.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCategorySubmit as any)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Categoria ativa</FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  {isEditing ? "Atualizar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de subcategoria */}
      <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Subcategoria" : "Adicionar Subcategoria"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Editar subcategoria da categoria "${parentCategory?.name}".`
                : `Adicionar nova subcategoria à categoria "${parentCategory?.name}".`}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCategorySubmit as any)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Subcategoria ativa</FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isEditing ? "Atualizar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
