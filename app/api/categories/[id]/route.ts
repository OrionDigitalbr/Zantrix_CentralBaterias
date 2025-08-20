import { NextResponse } from "next/server"
import { getCategoryById, updateCategory, deleteCategory } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const category = await getCategoryById(id)
    return NextResponse.json(category)
  } catch (error) {
    console.error(`Error fetching category ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const category = await updateCategory(id, body)
    return NextResponse.json(category)
  } catch (error) {
    console.error(`Error updating category ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    await deleteCategory(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting category ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
