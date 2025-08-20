import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { NotificationsSystem } from "@/components/admin/notifications-system"

export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Notificações" />
        <main className="p-6">
          <NotificationsSystem />
        </main>
      </div>
    </div>
  )
}
