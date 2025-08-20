import { NextResponse } from "next/server"
import { getSlideById, updateSlide, deleteSlide } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const slide = await getSlideById(id)
    return NextResponse.json(slide)
  } catch (error) {
    console.error(`Error fetching slide ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch slide" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const slide = await updateSlide(id, body)
    return NextResponse.json(slide)
  } catch (error) {
    console.error(`Error updating slide ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update slide" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    await deleteSlide(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting slide ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete slide" }, { status: 500 })
  }
}
