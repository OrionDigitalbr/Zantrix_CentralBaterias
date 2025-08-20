import { NextRequest, NextResponse } from "next/server"
import { markNotificationAsRead, deleteNotification } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const notification = await markNotificationAsRead(id)
    return NextResponse.json(notification)
  } catch (error) {
    console.error(`Error marking notification ${params.id} as read:`, error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    await deleteNotification(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting notification ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}
